import { motion, AnimatePresence } from "framer-motion";
import { Globe, Server, Shield, Zap, Cpu, Filter, Activity, Search, Wifi, WifiOff, Clock, Box, RefreshCw, ArrowRight, Home, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface NetworkStatus {
  slug: string;
  name: string;
  chainId: number | null;
  status: "online" | "offline" | "degraded";
  latency: number | null;
  blockNumber: string | null;
  lastChecked: string;
  ecosystem: "evm" | "solana";
}

const NETWORK_ICONS: Record<string, { icon: string; color: string }> = {
  "ethereum": { icon: "ETH", color: "#627EEA" },
  "ethereum-sepolia": { icon: "ETH", color: "#627EEA" },
  "ethereum-goerli": { icon: "ETH", color: "#627EEA" },
  "polygon": { icon: "MATIC", color: "#8247E5" },
  "polygon-mumbai": { icon: "MATIC", color: "#8247E5" },
  "arbitrum": { icon: "ARB", color: "#28A0F0" },
  "arbitrum-sepolia": { icon: "ARB", color: "#28A0F0" },
  "optimism": { icon: "OP", color: "#FF0420" },
  "optimism-sepolia": { icon: "OP", color: "#FF0420" },
  "base": { icon: "BASE", color: "#0052FF" },
  "base-sepolia": { icon: "BASE", color: "#0052FF" },
  "bsc": { icon: "BNB", color: "#F0B90B" },
  "bsc-testnet": { icon: "BNB", color: "#F0B90B" },
  "solana": { icon: "SOL", color: "#9945FF" },
  "solana-devnet": { icon: "SOL", color: "#9945FF" },
};

function Navigation() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border flex items-center justify-between px-4 md:px-8 h-16">
      <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <div className="w-3 h-3 bg-primary animate-pulse" />
        <span className="font-mono font-bold text-lg tracking-widest">0xinfra</span>
      </a>
      
      <div className="hidden md:flex items-center gap-8 font-mono text-sm">
        {[
          { label: 'NODES', href: '/nodes' },
          { label: 'DEPLOY', href: '/deploy' },
          { label: 'AI COPILOT', href: '/copilot' },
          { label: 'PRICING', href: '/pricing' },
          { label: 'DASHBOARD', href: '/dashboard' },
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

function StatusBadge({ status }: { status: "online" | "offline" | "degraded" }) {
  const config = {
    online: { 
      icon: CheckCircle2, 
      label: "ONLINE", 
      className: "bg-green-500/20 text-green-400 border-green-500/50",
      pulseClass: "bg-green-500"
    },
    degraded: { 
      icon: AlertCircle, 
      label: "DEGRADED", 
      className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      pulseClass: "bg-yellow-500"
    },
    offline: { 
      icon: XCircle, 
      label: "OFFLINE", 
      className: "bg-red-500/20 text-red-400 border-red-500/50",
      pulseClass: "bg-red-500"
    },
  };

  const { icon: Icon, label, className, pulseClass } = config[status];

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border font-mono text-xs ${className}`}>
      <div className={`w-2 h-2 rounded-full ${pulseClass} ${status === "online" ? "animate-pulse" : ""}`} />
      <Icon className="w-3 h-3" />
      <span>{label}</span>
    </div>
  );
}

function BlockCounter({ blockNumber, ecosystem, label }: { blockNumber: string | null; ecosystem: "evm" | "solana"; label?: string }) {
  const [displayBlock, setDisplayBlock] = useState<number>(0);
  
  useEffect(() => {
    if (blockNumber) {
      const target = ecosystem === "solana" 
        ? parseInt(blockNumber, 10)
        : parseInt(blockNumber, 16);
      setDisplayBlock(target);
    }
  }, [blockNumber, ecosystem]);

  if (!blockNumber) return <span className="text-muted-foreground">--</span>;

  const prefix = label || (ecosystem === "solana" ? "Slot" : "#");

  return (
    <motion.span 
      key={displayBlock}
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-primary font-bold tabular-nums"
    >
      {prefix === "#" ? "#" : `${prefix} `}{displayBlock.toLocaleString()}
    </motion.span>
  );
}

function LatencyIndicator({ latency }: { latency: number | null }) {
  if (latency === null) return <span className="text-muted-foreground">--</span>;
  
  const color = latency < 100 ? "text-green-400" : latency < 300 ? "text-yellow-400" : "text-red-400";
  
  return (
    <span className={`font-mono ${color}`}>
      {latency}ms
    </span>
  );
}

export default function Nodes() {
  const [filter, setFilter] = useState<"ALL" | "MAINNET" | "TESTNET">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: networkStatuses, isLoading, isFetching, refetch, error, isError } = useQuery<NetworkStatus[]>({
    queryKey: ["/api/network-status"],
    queryFn: async () => {
      const res = await fetch("/api/network-status");
      if (!res.ok) throw new Error("Failed to fetch network status");
      return res.json();
    },
    refetchInterval: 30000,
    retry: 2,
  });

  const filteredNetworks = networkStatuses?.filter(network => {
    const isMainnet = !network.slug.includes("-");
    const matchesFilter = filter === "ALL" || 
      (filter === "MAINNET" && isMainnet) || 
      (filter === "TESTNET" && !isMainnet);
    const matchesSearch = network.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      network.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }) || [];

  const onlineCount = networkStatuses?.filter(n => n.status === "online").length || 0;
  const totalCount = networkStatuses?.length || 0;

  return (
    <>
      <Navigation />
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
              {isFetching && (
                <RefreshCw className="w-3 h-3 text-primary animate-spin ml-2" />
              )}
            </div>
            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4">
              Network Status
            </h1>
            <p className="font-mono text-muted-foreground max-w-2xl text-lg">
              Real-time connectivity status for all supported blockchain networks. 
              <span className="text-primary font-bold"> {onlineCount}/{totalCount}</span> networks online.
            </p>
          </motion.div>
        </div>

        {/* Status Summary Bar */}
        <div className="px-6 md:px-12 mb-8">
          <div className="bg-black border border-border p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6 font-mono text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-muted-foreground">Online:</span>
                <span className="text-green-400 font-bold">{networkStatuses?.filter(n => n.status === "online").length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">Degraded:</span>
                <span className="text-yellow-400 font-bold">{networkStatuses?.filter(n => n.status === "degraded").length || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">Offline:</span>
                <span className="text-red-400 font-bold">{networkStatuses?.filter(n => n.status === "offline").length || 0}</span>
              </div>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 text-primary font-mono text-sm hover:bg-primary/20 transition-colors disabled:opacity-50"
              data-testid="refresh-status"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              REFRESH
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="px-6 md:px-12 mb-8 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-2">
            {["ALL", "MAINNET", "TESTNET"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 font-mono text-sm border transition-all ${
                  filter === f 
                  ? "bg-primary text-black border-primary font-bold" 
                  : "bg-transparent text-muted-foreground border-border hover:border-white hover:text-white"
                }`}
                data-testid={`filter-${f.toLowerCase()}`}
              >
                [{f}]
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="SEARCH NETWORK..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border border-border px-10 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
              data-testid="search-network"
            />
          </div>
        </div>

        {/* Network Grid */}
        <div className="px-6 md:px-12 pb-32">
          {isError ? (
            <div className="border border-red-500/30 bg-red-500/5 p-8 text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl mb-2">Failed to Load Network Status</h3>
              <p className="text-muted-foreground font-mono text-sm mb-6 max-w-md mx-auto">
                {error instanceof Error ? error.message : "Unable to connect to the network status service. This may be due to a configuration issue."}
              </p>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="px-6 py-3 bg-red-500 text-white font-mono font-bold hover:bg-red-400 transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                data-testid="retry-fetch"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                RETRY
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-border bg-black p-6 animate-pulse">
                  <div className="h-8 bg-neutral-800 mb-4 w-1/2" />
                  <div className="h-4 bg-neutral-800 mb-2 w-3/4" />
                  <div className="h-4 bg-neutral-800 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredNetworks.map((network, i) => {
                  const networkInfo = NETWORK_ICONS[network.slug] || { icon: "?", color: "#888888" };
                  const isMainnet = !network.slug.includes("-");
                  
                  return (
                    <motion.div
                      key={network.slug}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border p-6 relative group transition-all hover:-translate-y-1 ${
                        network.status === "online"
                          ? "border-green-500/30 bg-green-500/5 hover:border-green-500/60"
                          : network.status === "degraded"
                          ? "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60"
                          : "border-red-500/30 bg-red-500/5 hover:border-red-500/60"
                      }`}
                      data-testid={`network-card-${network.slug}`}
                    >
                      {/* Network Type Badge */}
                      <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-mono font-bold ${
                        isMainnet ? "bg-primary text-black" : "bg-neutral-800 text-neutral-400"
                      }`}>
                        {isMainnet ? "MAINNET" : "TESTNET"}
                      </div>

                      {/* Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                            style={{ backgroundColor: networkInfo.color + "20", color: networkInfo.color }}
                          >
                            {networkInfo.icon}
                          </div>
                          <div>
                            <div className="font-bold text-lg">{network.name}</div>
                            <div className="font-mono text-xs text-muted-foreground">
                              {network.chainId ? `Chain ID: ${network.chainId}` : network.ecosystem === "solana" ? "Solana Network" : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-6">
                        <StatusBadge status={network.status} />
                      </div>

                      {/* Stats */}
                      <div className="space-y-3 font-mono text-sm">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Latency
                          </span>
                          <LatencyIndicator latency={network.latency} />
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Box className="w-3 h-3" />
                            {network.ecosystem === "solana" ? "Slot" : "Block Height"}
                          </span>
                          <BlockCounter blockNumber={network.blockNumber} ecosystem={network.ecosystem} />
                        </div>
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-muted-foreground flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            Slug
                          </span>
                          <span className="text-white/70">{network.slug}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="mt-6">
                        <a href="/connect">
                          <button 
                            className={`w-full px-4 py-3 text-sm font-bold uppercase tracking-wider transition-colors font-mono ${
                              network.status === "online"
                                ? "bg-green-500 text-black hover:bg-green-400"
                                : network.status === "degraded"
                                ? "bg-yellow-500 text-black hover:bg-yellow-400"
                                : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                            }`}
                            disabled={network.status === "offline"}
                            data-testid={`connect-${network.slug}`}
                          >
                            {network.status === "offline" ? "UNAVAILABLE" : "CONNECT"}
                          </button>
                        </a>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
