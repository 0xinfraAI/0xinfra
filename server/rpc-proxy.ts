import type { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { getAlchemyUrl, getNetworkBySlug } from "./networks";
import { randomBytes } from "crypto";
import type { InsertRpcLog } from "@shared/schema";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

interface SerializedRpcLog {
  requestId: string;
  connectionId: number | null;
  apiKeyLast4: string | null;
  network: string;
  method: string;
  status: string;
  statusCode: number | null;
  latency: number;
  requestBody: any;
  responseBody: any;
  errorMessage: string | null;
  timestamp: string;
}

type LogEventCallback = (log: SerializedRpcLog) => void;
const logEventListeners: Set<LogEventCallback> = new Set();

export function subscribeToLogs(callback: LogEventCallback): () => void {
  logEventListeners.add(callback);
  return () => logEventListeners.delete(callback);
}

function emitLogEvent(log: InsertRpcLog & { timestamp: Date }) {
  const serializedLog: SerializedRpcLog = {
    requestId: log.requestId,
    connectionId: log.connectionId ?? null,
    apiKeyLast4: log.apiKeyLast4 ?? null,
    network: log.network,
    method: log.method,
    status: log.status,
    statusCode: log.statusCode ?? null,
    latency: log.latency,
    requestBody: log.requestBody,
    responseBody: log.responseBody,
    errorMessage: log.errorMessage ?? null,
    timestamp: log.timestamp.toISOString(),
  };
  Array.from(logEventListeners).forEach(callback => {
    try {
      callback(serializedLog);
    } catch (e) {
      console.error("Log event listener error:", e);
    }
  });
}

function generateRequestId(): string {
  return `req_${randomBytes(8).toString("hex")}`;
}

function sanitizeString(str: string): string {
  return str
    .replace(/alchemy/gi, "INFRA_V1")
    .replace(/Alchemy/g, "INFRA_V1")
    .replace(/api\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/g\.alchemy\.com/gi, "infra.v1")
    .replace(/eth-mainnet\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/polygon-mainnet\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/arb-mainnet\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/opt-mainnet\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/base-mainnet\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/[a-zA-Z0-9-]+\.g\.alchemy\.com/gi, "rpc.infra.v1");
}

function sanitizeResponse(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (typeof data === "string") {
    return sanitizeString(data);
  }
  
  if (typeof data === "number" || typeof data === "boolean") {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeResponse);
  }
  
  if (typeof data === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeResponse(value);
    }
    return sanitized;
  }
  
  return data;
}

function sanitizeError(error: any): { code: number; message: string; data?: any } {
  let message = error?.message || error?.error?.message || "Internal server error";
  message = sanitizeString(message);
  
  const result: { code: number; message: string; data?: any } = {
    code: error?.code || error?.error?.code || -32603,
    message,
  };
  
  if (error?.data) {
    result.data = sanitizeResponse(error.data);
  }
  
  return result;
}

export async function validateApiKey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Support API key in: URL path, header, or query parameter
  const apiKey = req.params.apiKey as string || 
                 req.headers["x-infra-key"] as string || 
                 req.query.apiKey as string;
  
  if (!apiKey) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Missing API key. Provide in URL path, X-INFRA-KEY header, or apiKey query parameter.",
      },
      id: null,
    });
  }

  if (!apiKey.startsWith("infra_")) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Invalid API key format.",
      },
      id: null,
    });
  }

  const connection = await storage.getConnectionByApiKey(apiKey);
  
  if (!connection) {
    return res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Invalid API key.",
      },
      id: null,
    });
  }

  if (!connection.isActive) {
    return res.status(403).json({
      jsonrpc: "2.0",
      error: {
        code: -32002,
        message: "API key is deactivated.",
      },
      id: null,
    });
  }

  if (connection.allowedIp) {
    const clientIp = req.ip || req.socket.remoteAddress;
    if (clientIp && !connection.allowedIp.split(",").includes(clientIp)) {
      return res.status(403).json({
        jsonrpc: "2.0",
        error: {
          code: -32003,
          message: "IP address not allowed.",
        },
        id: null,
      });
    }
  }

  (req as any).connection = connection;
  next();
}

export async function rpcProxyHandler(req: Request, res: Response) {
  const { network } = req.params;
  const connection = (req as any).connection;
  const requestId = generateRequestId();
  const apiKeyLast4 = connection?.apiKey?.slice(-4) || null;
  const method = req.body?.method || "unknown";
  
  if (!ALCHEMY_API_KEY) {
    const logEntry: InsertRpcLog & { timestamp: Date } = {
      requestId,
      connectionId: connection?.id || null,
      apiKeyLast4,
      network,
      method,
      status: "error",
      statusCode: 503,
      latency: 0,
      requestBody: req.body,
      responseBody: null,
      errorMessage: "RPC service temporarily unavailable",
      timestamp: new Date(),
    };
    storage.createRpcLog(logEntry).catch(console.error);
    emitLogEvent(logEntry);
    
    return res.status(503).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "RPC service temporarily unavailable.",
      },
      id: req.body?.id || null,
    });
  }

  const networkConfig = getNetworkBySlug(network);
  if (!networkConfig) {
    const logEntry: InsertRpcLog & { timestamp: Date } = {
      requestId,
      connectionId: connection?.id || null,
      apiKeyLast4,
      network,
      method,
      status: "error",
      statusCode: 400,
      latency: 0,
      requestBody: req.body,
      responseBody: null,
      errorMessage: `Unsupported network: ${network}`,
      timestamp: new Date(),
    };
    storage.createRpcLog(logEntry).catch(console.error);
    emitLogEvent(logEntry);
    
    return res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32602,
        message: `Unsupported network: ${network}. Use /api/networks for available options.`,
      },
      id: req.body?.id || null,
    });
  }

  const alchemyUrl = getAlchemyUrl(network, ALCHEMY_API_KEY);
  if (!alchemyUrl) {
    const logEntry: InsertRpcLog & { timestamp: Date } = {
      requestId,
      connectionId: connection?.id || null,
      apiKeyLast4,
      network,
      method,
      status: "error",
      statusCode: 400,
      latency: 0,
      requestBody: req.body,
      responseBody: null,
      errorMessage: `Network configuration error for: ${network}`,
      timestamp: new Date(),
    };
    storage.createRpcLog(logEntry).catch(console.error);
    emitLogEvent(logEntry);
    
    return res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32602,
        message: `Network configuration error for: ${network}`,
      },
      id: req.body?.id || null,
    });
  }

  try {
    const startTime = Date.now();
    
    const response = await fetch(alchemyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const latency = Date.now() - startTime;
    
    storage.incrementRequestCount(connection.id).catch(console.error);

    const data = await response.json();
    
    const sanitizedData = sanitizeResponse(data);
    const hasError = !!data.error;
    
    const logEntry: InsertRpcLog & { timestamp: Date } = {
      requestId,
      connectionId: connection?.id || null,
      apiKeyLast4,
      network,
      method,
      status: hasError ? "error" : "success",
      statusCode: response.status,
      latency,
      requestBody: req.body,
      responseBody: sanitizedData,
      errorMessage: hasError ? data.error?.message : null,
      timestamp: new Date(),
    };
    storage.createRpcLog(logEntry).catch(console.error);
    emitLogEvent(logEntry);

    res.set({
      "X-INFRA-Network": networkConfig.name,
      "X-INFRA-ChainId": (networkConfig.chainId || 0).toString(),
      "X-INFRA-Latency": `${latency}ms`,
      "X-INFRA-RequestId": requestId,
    });

    if (data.error) {
      return res.status(200).json({
        ...sanitizedData,
        error: sanitizeError(data.error),
      });
    }

    return res.json(sanitizedData);
    
  } catch (error: any) {
    console.error(`RPC proxy error for ${network}:`, error.message);
    
    const logEntry: InsertRpcLog & { timestamp: Date } = {
      requestId,
      connectionId: connection?.id || null,
      apiKeyLast4,
      network,
      method,
      status: "error",
      statusCode: 502,
      latency: 0,
      requestBody: req.body,
      responseBody: null,
      errorMessage: error.message,
      timestamp: new Date(),
    };
    storage.createRpcLog(logEntry).catch(console.error);
    emitLogEvent(logEntry);
    
    return res.status(502).json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: "Upstream node temporarily unavailable. Please retry.",
      },
      id: req.body?.id || null,
    });
  }
}