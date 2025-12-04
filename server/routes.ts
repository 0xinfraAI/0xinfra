import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConnectionSchema } from "@shared/schema";
import { validateApiKey, rpcProxyHandler } from "./rpc-proxy";
import { getAllNetworks, getNetworkBySlug, getAlchemyUrl, getMainnetNetworks } from "./networks";
import { generateCopilotResponse, getQuickSuggestions, type CopilotMessage, type CopilotContext } from "./copilot";

interface NetworkStatus {
  slug: string;
  name: string;
  chainId: number;
  status: "online" | "offline" | "degraded";
  latency: number | null;
  blockNumber: string | null;
  lastChecked: string;
}

async function checkNetworkStatus(network: { slug: string; name: string; chainId: number; alchemyPath: string }): Promise<NetworkStatus> {
  const alchemyApiKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyApiKey) {
    return {
      slug: network.slug,
      name: network.name,
      chainId: network.chainId,
      status: "offline",
      latency: null,
      blockNumber: null,
      lastChecked: new Date().toISOString(),
    };
  }

  const url = `https://${network.alchemyPath}.g.alchemy.com/v2/${alchemyApiKey}`;
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_blockNumber",
        params: [],
        id: 1,
      }),
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (data.result) {
      return {
        slug: network.slug,
        name: network.name,
        chainId: network.chainId,
        status: latency > 500 ? "degraded" : "online",
        latency,
        blockNumber: data.result,
        lastChecked: new Date().toISOString(),
      };
    } else {
      return {
        slug: network.slug,
        name: network.name,
        chainId: network.chainId,
        status: "offline",
        latency: null,
        blockNumber: null,
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      slug: network.slug,
      name: network.name,
      chainId: network.chainId,
      status: "offline",
      latency: null,
      blockNumber: null,
      lastChecked: new Date().toISOString(),
    };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Get available networks
  app.get("/api/networks", (req, res) => {
    const networks = getAllNetworks().map(n => ({
      name: n.name,
      slug: n.slug,
      chainId: n.chainId,
      type: n.type,
    }));
    res.json(networks);
  });

  // Get live network status with connectivity checks
  app.get("/api/network-status", async (req, res) => {
    try {
      const networks = getAllNetworks();
      const statusPromises = networks.map(network => 
        checkNetworkStatus({
          slug: network.slug,
          name: network.name,
          chainId: network.chainId,
          alchemyPath: network.alchemyPath,
        })
      );
      
      const statuses = await Promise.all(statusPromises);
      res.json(statuses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get status for a single network
  app.get("/api/network-status/:slug", async (req, res) => {
    try {
      const network = getNetworkBySlug(req.params.slug);
      if (!network) {
        return res.status(404).json({ error: "Network not found" });
      }
      
      const status = await checkNetworkStatus({
        slug: network.slug,
        name: network.name,
        chainId: network.chainId,
        alchemyPath: network.alchemyPath,
      });
      
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // RPC Proxy endpoint - validates API key and proxies to provider
  // Supports both header-based auth (X-INFRA-KEY) and URL-based auth
  app.post("/rpc/:network", validateApiKey, rpcProxyHandler);
  app.post("/rpc/:network/:apiKey", validateApiKey, rpcProxyHandler);

  // Connection management
  app.post("/api/connections", async (req, res) => {
    try {
      const validated = insertConnectionSchema.parse(req.body);
      const connection = await storage.createConnection(validated);
      res.json(connection);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/connections", async (req, res) => {
    try {
      const connections = await storage.getAllConnections();
      res.json(connections);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const connection = await storage.getConnection(id);
      if (!connection) {
        return res.status(404).json({ error: "Connection not found" });
      }
      res.json(connection);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/connections/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deactivateConnection(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Copilot endpoints
  app.post("/api/copilot/chat", async (req, res) => {
    try {
      const { messages, context } = req.body as {
        messages: CopilotMessage[];
        context?: CopilotContext;
      };

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const response = await generateCopilotResponse(messages, context);
      res.json({ response });
    } catch (error: any) {
      console.error("Copilot chat error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/copilot/suggestions", (req, res) => {
    const { network, apiKey, mode } = req.query;
    const context: CopilotContext = {
      selectedNetwork: network as string | undefined,
      apiKey: apiKey as string | undefined,
      mode: mode as "quick" | "advanced" | undefined,
    };
    const suggestions = getQuickSuggestions(context);
    res.json({ suggestions });
  });

  return httpServer;
}
