import WebSocket from "ws";
import type { IncomingMessage } from "http";
import { storage } from "./storage";
import { getAlchemyUrl, getNetworkBySlug } from "./networks";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

function sanitizeString(str: string): string {
  return str
    .replace(/alchemy/gi, "INFRA_V1")
    .replace(/Alchemy/g, "INFRA_V1")
    .replace(/api\.g\.alchemy\.com/gi, "rpc.infra.v1")
    .replace(/g\.alchemy\.com/gi, "infra.v1")
    .replace(/[a-zA-Z0-9-]+\.g\.alchemy\.com/gi, "rpc.infra.v1");
}

function sanitizeMessage(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") return sanitizeString(data);
  if (typeof data === "number" || typeof data === "boolean") return data;
  if (Array.isArray(data)) return data.map(sanitizeMessage);
  if (typeof data === "object") {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeMessage(value);
    }
    return sanitized;
  }
  return data;
}

function getAlchemyWsUrl(networkSlug: string, alchemyApiKey: string): string | null {
  const networkMap: Record<string, string> = {
    "ethereum": "eth-mainnet",
    "ethereum-sepolia": "eth-sepolia",
    "ethereum-goerli": "eth-goerli",
    "polygon": "polygon-mainnet",
    "polygon-mumbai": "polygon-mumbai",
    "arbitrum": "arb-mainnet",
    "arbitrum-sepolia": "arb-sepolia",
    "optimism": "opt-mainnet",
    "optimism-sepolia": "opt-sepolia",
    "base": "base-mainnet",
    "base-sepolia": "base-sepolia",
  };

  const alchemyPath = networkMap[networkSlug.toLowerCase()];
  if (!alchemyPath) return null;
  
  return `wss://${alchemyPath}.g.alchemy.com/v2/${alchemyApiKey}`;
}

export function setupWebSocketProxy(wss: WebSocket.Server) {
  wss.on("connection", async (clientWs: WebSocket, req: IncomingMessage) => {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Expected path: /ws/:network/:apiKey
    if (pathParts.length < 3 || pathParts[0] !== "ws") {
      clientWs.close(4000, JSON.stringify({
        error: { code: -32600, message: "Invalid WebSocket path. Use /ws/:network/:apiKey" }
      }));
      return;
    }

    const network = pathParts[1];
    const apiKey = pathParts[2];

    // Validate API key
    if (!apiKey || !apiKey.startsWith("infra_")) {
      clientWs.close(4001, JSON.stringify({
        error: { code: -32001, message: "Invalid API key format." }
      }));
      return;
    }

    const connection = await storage.getConnectionByApiKey(apiKey);
    if (!connection) {
      clientWs.close(4001, JSON.stringify({
        error: { code: -32001, message: "Invalid API key." }
      }));
      return;
    }

    if (!connection.isActive) {
      clientWs.close(4003, JSON.stringify({
        error: { code: -32002, message: "API key is deactivated." }
      }));
      return;
    }

    // Check network
    const networkConfig = getNetworkBySlug(network);
    if (!networkConfig) {
      clientWs.close(4000, JSON.stringify({
        error: { code: -32602, message: `Unsupported network: ${network}` }
      }));
      return;
    }

    if (!ALCHEMY_API_KEY) {
      clientWs.close(4003, JSON.stringify({
        error: { code: -32603, message: "WebSocket service temporarily unavailable." }
      }));
      return;
    }

    const alchemyWsUrl = getAlchemyWsUrl(network, ALCHEMY_API_KEY);
    if (!alchemyWsUrl) {
      clientWs.close(4000, JSON.stringify({
        error: { code: -32602, message: `WebSocket not available for network: ${network}` }
      }));
      return;
    }

    // Connect to Alchemy WebSocket
    const upstreamWs = new WebSocket(alchemyWsUrl);

    upstreamWs.on("open", () => {
      console.log(`[WS] Connected to upstream for ${network}`);
    });

    upstreamWs.on("message", (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        const sanitized = sanitizeMessage(message);
        clientWs.send(JSON.stringify(sanitized));
        
        // Count subscriptions as requests
        storage.incrementRequestCount(connection.id).catch(console.error);
      } catch (e) {
        clientWs.send(data.toString());
      }
    });

    upstreamWs.on("error", (error) => {
      console.error(`[WS] Upstream error:`, error.message);
      clientWs.close(4002, JSON.stringify({
        error: { code: -32603, message: "Upstream connection error." }
      }));
    });

    upstreamWs.on("close", () => {
      clientWs.close();
    });

    // Forward client messages to upstream
    clientWs.on("message", (data: WebSocket.Data) => {
      if (upstreamWs.readyState === WebSocket.OPEN) {
        upstreamWs.send(data.toString());
        storage.incrementRequestCount(connection.id).catch(console.error);
      }
    });

    clientWs.on("close", () => {
      if (upstreamWs.readyState === WebSocket.OPEN) {
        upstreamWs.close();
      }
    });

    clientWs.on("error", (error) => {
      console.error(`[WS] Client error:`, error.message);
      if (upstreamWs.readyState === WebSocket.OPEN) {
        upstreamWs.close();
      }
    });
  });
}