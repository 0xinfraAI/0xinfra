import { motion } from "framer-motion";
import { Globe, Server, Shield, Zap, Cpu, Filter, MapPin, Activity, Search } from "lucide-react";
import { useState } from "react";

// Mock Data for Node Marketplace
const NODES = [
  { id: "ND_9921", region: "Tokyo, JP", type: "CORE", latency: "4ms", price: "$45/mo", uptime: "100%", provider: "INFRA_L1" },
  { id: "ND_8823", region: "New York, US", type: "CORE", latency: "8ms", price: "$45/mo", uptime: "99.99%", provider: "INFRA_L1" },
  { id: "ND_1204", region: "Berlin, DE", type: "COMMUNITY", latency: "24ms", price: "$12/mo", uptime: "99.5%", provider: "NodeRunner_X" },
  { id: "ND_4402", region: "Singapore, SG", type: "COMMUNITY", latency: "32ms", price: "$10/mo", uptime: "99.2%", provider: "CryptoSteve" },
  { id: "ND_7731", region: "London, UK", type: "CORE", latency: "12ms", price: "$45/mo", uptime: "99.99%", provider: "INFRA_L1" },
  { id: "ND_3391", region: "Sao Paulo, BR", type: "COMMUNITY", latency: "65ms", price: "$8/mo", uptime: "98.9%", provider: "LatamNodes" },
  { id: "ND_5512", region: "Sydney, AU", type: "CORE", latency: "18ms", price: "$50/mo", uptime: "99.99%", provider: "INFRA_L1" },
  { id: "ND_0021", region: "Mumbai, IN", type: "COMMUNITY", latency: "45ms", price: "$6/mo", uptime: "98.5%", provider: "Web3_India" },
];

export default function Nodes() {
  const [filter, setFilter] = useState<"ALL" | "CORE" | "COMMUNITY">("ALL");

  const filteredNodes = filter === "ALL" ? NODES : NODES.filter(n => n.type === filter);

  return (
    <div className="min-h-screen bg-background text-foreground pt-20">
      {/* Header */}
      <div className="px-6 md:px-12 mb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-border pb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-primary animate-pulse" />
            <span className="font-mono text-primary text-sm tracking-widest">LIVE NETWORK STATUS</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4">
            Node Explorer
          </h1>
          <p className="font-mono text-muted-foreground max-w-2xl text-lg">
            Deploy instantly on our hybrid network. Choose <span className="text-primary font-bold">CORE</span> for enterprise-grade reliability or <span className="text-white font-bold">COMMUNITY</span> for decentralized cost-efficiency.
          </p>
        </motion.div>
      </div>

      {/* Filters & Search */}
      <div className="px-6 md:px-12 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex gap-2">
          {["ALL", "CORE", "COMMUNITY"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 font-mono text-sm border transition-all ${
                filter === f 
                ? "bg-primary text-black border-primary font-bold" 
                : "bg-transparent text-muted-foreground border-border hover:border-white hover:text-white"
              }`}
            >
              [{f}]
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="SEARCH REGION..." 
            className="w-full bg-transparent border border-border px-10 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Node Grid */}
      <div className="px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNodes.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`border p-6 relative group transition-all hover:-translate-y-1 ${
                node.type === "CORE" 
                  ? "border-primary/30 bg-primary/5 hover:border-primary" 
                  : "border-border bg-black hover:border-white"
              }`}
            >
              {/* Badge */}
              <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-mono font-bold ${
                 node.type === "CORE" ? "bg-primary text-black" : "bg-neutral-800 text-neutral-400"
              }`}>
                {node.type}
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  {node.type === "CORE" ? <Shield className="w-8 h-8 text-primary" /> : <Globe className="w-8 h-8 text-muted-foreground" />}
                  <div>
                    <div className="font-bold text-lg">{node.region}</div>
                    <div className="font-mono text-xs text-muted-foreground">{node.provider}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 font-mono text-sm mb-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Latency</span>
                  <span className={node.type === "CORE" ? "text-primary" : "text-white"}>{node.latency}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">Uptime</span>
                  <span>{node.uptime}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-muted-foreground">ID</span>
                  <span className="opacity-50">{node.id}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4">
                <span className="text-xl font-bold">{node.price}</span>
                <button className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  node.type === "CORE" 
                    ? "bg-primary text-black hover:bg-white" 
                    : "bg-white text-black hover:bg-primary"
                }`}>
                  Deploy
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}