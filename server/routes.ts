import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertConnectionSchema } from "@shared/schema";
import { validateApiKey, rpcProxyHandler } from "./rpc-proxy";
import { getAllNetworks, getNetworkBySlug } from "./networks";

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

  // RPC Proxy endpoint - validates API key and proxies to provider
  app.post("/rpc/:network", validateApiKey, rpcProxyHandler);

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

  return httpServer;
}
