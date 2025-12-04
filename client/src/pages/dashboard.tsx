import { motion } from "framer-motion";
import { Activity, Zap, Globe, Shield, Plus, Copy, Trash2, RefreshCw, Check, Terminal, ArrowRight } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import type { Connection } from "@shared/schema";

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 md:px-8 h-16">
      <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-3 h-3 bg-primary animate-pulse" />
        <span className="font-mono font-bold text-lg tracking-widest">INFRA_V1</span>
      </a>
      
      <div className="hidden md:flex items-center gap-8 font-mono text-sm">
        {[
          { label: 'NODES', href: '/nodes' },
          { label: 'AI COPILOT', href: '/copilot' },
          { label: 'PRICING', href: '/pricing' },
          { label: 'DASHBOARD', href: '/dashboard' },
          { label: 'DOCS', href: '/docs' },
        ].map((item) => (
          <a 
            key={item.label} 
            href={item.href} 
            className="hover:text-primary hover:underline decoration-primary underline-offset-4 transition-colors"
          >
            {item.label}
          </a>
        ))}
      </div>

      <a href="/connect">
        <button className="bg-primary text-black font-mono font-bold px-6 py-2 text-sm hover:bg-white transition-colors flex items-center gap-2 border border-transparent hover:border-black">
          CONNECT <ArrowRight className="w-4 h-4" />
        </button>
      </a>
    </nav>
  );
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: connections, isLoading, refetch } = useQuery<Connection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const response = await fetch("/api/connections");
      if (!response.ok) throw new Error("Failed to fetch connections");
      return response.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/connections/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete connection");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });

  const activeConnections = connections?.filter((c) => c.isActive) || [];
  const totalRequests = connections?.reduce((acc, c) => acc + c.requestCount, 0) || 0;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRpcUrl = (apiKey: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/rpc/ethereum`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="px-6 md:px-12 max-w-7xl mx-auto pt-24 pb-24">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-4">
          <div>
            <p className="font-mono text-primary text-sm mb-2 tracking-widest">[ CONTROL_PANEL ]</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Dashboard
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => refetch()}
              className="border border-border px-4 py-2 font-mono text-sm hover:border-white transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link href="/connect">
              <button className="bg-primary text-black px-6 py-2 font-mono font-bold text-sm hover:bg-white transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Connection
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-border p-6 bg-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground uppercase">Active Connections</span>
            </div>
            <div className="text-4xl font-black">{activeConnections.length}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="border border-border p-6 bg-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground uppercase">Total Requests</span>
            </div>
            <div className="text-4xl font-black">{totalRequests.toLocaleString()}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="border border-border p-6 bg-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground uppercase">Avg Latency</span>
            </div>
            <div className="text-4xl font-black">12<span className="text-lg text-muted-foreground">ms</span></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="border border-border p-6 bg-black"
          >
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-mono text-xs text-muted-foreground uppercase">Uptime</span>
            </div>
            <div className="text-4xl font-black text-green-500">99.9<span className="text-lg">%</span></div>
          </motion.div>
        </div>

        {/* Connections Table */}
        <div className="border border-border bg-black">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="font-bold uppercase">Your Connections</h2>
            <span className="font-mono text-xs text-muted-foreground">{connections?.length || 0} total</span>
          </div>

          {isLoading ? (
            <div className="p-12 text-center font-mono text-muted-foreground">
              Loading connections...
            </div>
          ) : !connections?.length ? (
            <div className="p-12 text-center">
              <p className="font-mono text-muted-foreground mb-4">No connections yet</p>
              <Link href="/connect">
                <button className="bg-primary text-black px-6 py-2 font-mono font-bold text-sm hover:bg-white transition-colors">
                  Create Your First Connection
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-xs text-muted-foreground uppercase">
                    <th className="p-4">Label</th>
                    <th className="p-4">Network</th>
                    <th className="p-4">API Key</th>
                    <th className="p-4">Requests</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {connections.map((connection) => (
                    <tr key={connection.id} className="border-b border-border hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold">{connection.label}</td>
                      <td className="p-4">
                        <span className="bg-white/10 px-2 py-1 text-xs font-mono">{connection.network}</span>
                      </td>
                      <td className="p-4 font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-primary truncate max-w-[150px]">
                            {connection.apiKey.substring(0, 20)}...
                          </span>
                          <button
                            onClick={() => copyToClipboard(connection.apiKey, `key-${connection.id}`)}
                            className="text-muted-foreground hover:text-white transition-colors"
                            title="Copy API Key"
                          >
                            {copiedId === `key-${connection.id}` ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-4 font-mono">{connection.requestCount.toLocaleString()}</td>
                      <td className="p-4">
                        {connection.isActive ? (
                          <span className="flex items-center gap-2 text-green-500 text-sm">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-500 text-sm">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs text-muted-foreground">
                        {new Date(connection.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => deleteMutation.mutate(connection.id)}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RPC Usage Guide */}
        {connections && connections.length > 0 && (
          <div className="mt-12 border border-primary/50 p-8 bg-primary/5">
            <div className="flex items-start gap-4 mb-6">
              <Terminal className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className="font-bold uppercase mb-2">Quick Start: Using Your RPC Endpoint</h2>
                <p className="font-mono text-sm text-muted-foreground">
                  Make JSON-RPC calls to any supported network using your API key
                </p>
              </div>
            </div>

            {/* Your Endpoints */}
            <div className="bg-black border border-border p-4 mb-4">
              <span className="text-xs font-mono text-muted-foreground block mb-3">YOUR ENDPOINTS</span>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">HTTP:</span>
                  <code className="text-primary font-mono text-sm flex-1 truncate">
                    {window.location.origin}/rpc/ethereum/{connections[0].apiKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin}/rpc/ethereum/${connections[0].apiKey}`, "http-url")}
                    className="text-muted-foreground hover:text-white transition-colors shrink-0"
                  >
                    {copiedId === "http-url" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-12">WSS:</span>
                  <code className="text-primary font-mono text-sm flex-1 truncate">
                    {window.location.origin.replace("http", "ws")}/ws/ethereum/{connections[0].apiKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(`${window.location.origin.replace("http", "ws")}/ws/ethereum/${connections[0].apiKey}`, "ws-url")}
                    className="text-muted-foreground hover:text-white transition-colors shrink-0"
                  >
                    {copiedId === "ws-url" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-black border border-border p-4 mb-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">CURL EXAMPLE (URL-BASED AUTH)</span>
                <button
                  onClick={() => copyToClipboard(`curl -X POST ${window.location.origin}/rpc/ethereum/${connections[0].apiKey} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`, "curl")}
                  className="text-muted-foreground hover:text-white transition-colors"
                >
                  {copiedId === "curl" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <pre className="text-primary font-mono text-sm whitespace-pre-wrap">
{`curl -X POST ${window.location.origin}/rpc/ethereum/${connections[0].apiKey} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">ETHERS.JS</span>
                  <button
                    onClick={() => copyToClipboard(`const provider = new ethers.JsonRpcProvider(
  "${window.location.origin}/rpc/ethereum/${connections[0].apiKey}"
);`, "ethers")}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    {copiedId === "ethers" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-primary font-mono text-xs overflow-x-auto">
{`const provider = new ethers.JsonRpcProvider(
  "${window.location.origin}/rpc/ethereum/${connections[0].apiKey}"
);`}
                </pre>
              </div>

              <div className="bg-black border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-muted-foreground">WEBSOCKET SUBSCRIPTION</span>
                  <button
                    onClick={() => copyToClipboard(`const ws = new WebSocket(
  "${window.location.origin.replace("http", "ws")}/ws/ethereum/${connections[0].apiKey}"
);
ws.onopen = () => {
  ws.send(JSON.stringify({
    jsonrpc: "2.0",
    method: "eth_subscribe",
    params: ["newHeads"],
    id: 1
  }));
};`, "ws")}
                    className="text-muted-foreground hover:text-white transition-colors"
                  >
                    {copiedId === "ws" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <pre className="text-primary font-mono text-xs overflow-x-auto">
{`const ws = new WebSocket(
  "wss://your-domain/ws/ethereum/YOUR_KEY"
);
ws.send(JSON.stringify({
  method: "eth_subscribe",
  params: ["newHeads"], id: 1
}));`}
                </pre>
              </div>
            </div>

            <div className="mt-4 bg-black border border-border p-4">
              <span className="text-xs font-mono text-muted-foreground block mb-3">AVAILABLE NETWORKS</span>
              <div className="flex flex-wrap gap-2">
                {["ethereum", "polygon", "arbitrum", "optimism", "base"].map(net => (
                  <span key={net} className="bg-white/10 px-2 py-1 text-xs font-mono">{net}</span>
                ))}
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-3">
                + testnets: ethereum-sepolia, polygon-mumbai, arbitrum-sepolia, optimism-sepolia, base-sepolia
              </p>
            </div>
          </div>
        )}

        {/* Usage Chart Placeholder */}
        <div className="mt-12 border border-border p-8 bg-black">
          <h2 className="font-bold uppercase mb-6">Request Volume (Last 7 Days)</h2>
          <div className="h-48 flex items-end gap-2">
            {[45, 62, 78, 55, 89, 95, 72].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/20 hover:bg-primary/40 transition-colors relative group"
                  style={{ height: `${height}%` }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black border border-border px-2 py-1 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(height * 100)}K
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}