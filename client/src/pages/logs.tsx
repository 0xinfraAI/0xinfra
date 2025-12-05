import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, ArrowLeft, ChevronDown, ChevronRight, Clock, Database, Filter,
  Pause, Play, RefreshCw, Search, Server, Wifi, WifiOff, X, Zap, AlertTriangle,
  CheckCircle, XCircle, Code, Copy, Check
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface RpcLog {
  id: number;
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

interface LogStats {
  totalRequests: number;
  errorCount: number;
  avgLatency: number;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <button 
      onClick={copy} 
      className="p-1.5 hover:bg-primary/20 transition-colors"
      data-testid="copy-log-button"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />}
    </button>
  );
}

function StatCard({ icon: Icon, value, label, trend, color = "primary" }: { 
  icon: any; 
  value: string | number; 
  label: string; 
  trend?: string;
  color?: "primary" | "green" | "red" | "yellow";
}) {
  const colorClasses = {
    primary: "text-primary",
    green: "text-green-400",
    red: "text-red-400",
    yellow: "text-yellow-400",
  };

  return (
    <div className="border border-border bg-black p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${colorClasses[color]}`} />
        <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-bold font-mono ${colorClasses[color]}`}>{value}</span>
        {trend && <span className="text-xs text-muted-foreground">{trend}</span>}
      </div>
    </div>
  );
}

function LogRow({ log, expanded, onToggle }: { log: RpcLog; expanded: boolean; onToggle: () => void }) {
  const isError = log.status === "error";
  const timestamp = new Date(log.timestamp);
  const timeStr = timestamp.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const msStr = timestamp.getMilliseconds().toString().padStart(3, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border last:border-b-0"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
        data-testid={`log-row-${log.id}`}
      >
        <div className="flex items-center gap-2 w-24 flex-shrink-0">
          <span className={`w-2 h-2 rounded-full ${isError ? "bg-red-500" : "bg-green-500"}`} />
          <span className="font-mono text-xs text-muted-foreground">{timeStr}.{msStr}</span>
        </div>

        <div className="flex items-center gap-2 w-28 flex-shrink-0">
          <span className={`text-xs px-2 py-0.5 font-mono ${
            isError ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
          }`}>
            {log.status.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-2 w-32 flex-shrink-0">
          <Server className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono text-sm text-primary truncate">{log.network}</span>
        </div>

        <div className="flex-1 min-w-0">
          <span className="font-mono text-sm truncate block">{log.method}</span>
        </div>

        <div className="flex items-center gap-2 w-20 flex-shrink-0 justify-end">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className={`font-mono text-sm ${log.latency > 200 ? "text-yellow-400" : "text-muted-foreground"}`}>
            {log.latency}ms
          </span>
        </div>

        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-neutral-950 border-t border-border space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs uppercase">Request ID</span>
                  <div className="font-mono text-primary flex items-center gap-2">
                    <span className="truncate">{log.requestId}</span>
                    <CopyButton text={log.requestId} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase">API Key</span>
                  <div className="font-mono">****{log.apiKeyLast4 || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase">Status Code</span>
                  <div className={`font-mono ${log.statusCode && log.statusCode >= 400 ? "text-red-400" : ""}`}>
                    {log.statusCode || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs uppercase">Timestamp</span>
                  <div className="font-mono text-sm">{timestamp.toISOString()}</div>
                </div>
              </div>

              {log.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-bold text-red-400">Error</span>
                  </div>
                  <p className="font-mono text-sm text-red-300">{log.errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-xs uppercase flex items-center gap-2">
                      <Code className="w-3.5 h-3.5" />
                      Request
                    </span>
                    {log.requestBody && <CopyButton text={JSON.stringify(log.requestBody, null, 2)} />}
                  </div>
                  <pre className="bg-black border border-border p-3 font-mono text-xs text-primary/80 overflow-x-auto max-h-48 overflow-y-auto">
                    {log.requestBody ? JSON.stringify(log.requestBody, null, 2) : "N/A"}
                  </pre>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-xs uppercase flex items-center gap-2">
                      <ChevronRight className="w-3.5 h-3.5" />
                      Response
                    </span>
                    {log.responseBody && <CopyButton text={JSON.stringify(log.responseBody, null, 2)} />}
                  </div>
                  <pre className="bg-black border border-border p-3 font-mono text-xs text-primary/80 overflow-x-auto max-h-48 overflow-y-auto">
                    {log.responseBody ? JSON.stringify(log.responseBody, null, 2) : "N/A"}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState<RpcLog[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNetwork, setFilterNetwork] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [requestsPerSec, setRequestsPerSec] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const requestCountRef = useRef<{ count: number; lastReset: number }>({ count: 0, lastReset: Date.now() });

  const { data: stats, refetch: refetchStats } = useQuery<LogStats>({
    queryKey: ["log-stats"],
    queryFn: async () => {
      const res = await fetch("/api/logs/stats");
      return res.json();
    },
    refetchInterval: 5000,
  });

  const { data: networks } = useQuery<{ slug: string; name: string }[]>({
    queryKey: ["networks"],
    queryFn: async () => {
      const res = await fetch("/api/networks");
      return res.json();
    },
  });

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/logs`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      if (isPaused) return;

      try {
        const data = JSON.parse(event.data);
        
        if (data.type === "initial") {
          setLogs(data.logs);
        } else if (data.type === "log") {
          requestCountRef.current.count++;
          setLogs(prev => [data.log, ...prev].slice(0, 100));
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setIsConnected(false);
      
      if (!isPaused) {
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, [isPaused]);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - requestCountRef.current.lastReset) / 1000;
      if (elapsed >= 1) {
        setRequestsPerSec(Math.round(requestCountRef.current.count / elapsed));
        requestCountRef.current = { count: 0, lastReset: now };
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused && wsRef.current?.readyState !== WebSocket.OPEN) {
      connectWebSocket();
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!log.method.toLowerCase().includes(query) && 
          !log.requestId.toLowerCase().includes(query) &&
          !log.network.toLowerCase().includes(query)) {
        return false;
      }
    }
    if (filterNetwork && log.network !== filterNetwork) return false;
    if (filterStatus && log.status !== filterStatus) return false;
    return true;
  });

  const errorRate = stats ? (stats.errorCount / Math.max(stats.totalRequests, 1) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-neutral-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                <div className="w-3 h-3 bg-primary animate-pulse" />
                <span className="font-mono font-bold tracking-widest">0xinfra</span>
              </a>
              <span className="text-muted-foreground">/</span>
              <h1 className="font-bold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Live Logs
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 text-sm font-mono ${
                isConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
              }`}>
                {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {isConnected ? "LIVE" : "DISCONNECTED"}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Panel */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            icon={Zap} 
            value={requestsPerSec} 
            label="Req/sec" 
            color="primary"
          />
          <StatCard 
            icon={Database} 
            value={stats?.totalRequests?.toLocaleString() || "0"} 
            label="Total Requests"
            color="primary"
          />
          <StatCard 
            icon={AlertTriangle} 
            value={`${errorRate}%`} 
            label="Error Rate"
            color={parseFloat(errorRate) > 5 ? "red" : "green"}
          />
          <StatCard 
            icon={Clock} 
            value={stats?.avgLatency || 0} 
            label="Avg Latency"
            trend="ms"
            color={stats?.avgLatency && stats.avgLatency > 200 ? "yellow" : "green"}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={togglePause}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm transition-colors ${
              isPaused 
                ? "bg-primary text-black hover:bg-primary/90" 
                : "bg-neutral-800 hover:bg-neutral-700"
            }`}
            data-testid="pause-button"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            {isPaused ? "RESUME" : "PAUSE"}
          </button>

          <button
            onClick={clearLogs}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 font-mono text-sm transition-colors"
            data-testid="clear-button"
          >
            <X className="w-4 h-4" />
            CLEAR
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 font-mono text-sm transition-colors ${
              showFilters ? "bg-primary text-black" : "bg-neutral-800 hover:bg-neutral-700"
            }`}
            data-testid="filter-button"
          >
            <Filter className="w-4 h-4" />
            FILTERS
          </button>

          <div className="flex-1" />

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search method, ID, network..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-black border border-border pl-10 pr-4 py-2 font-mono text-sm w-64 focus:outline-none focus:border-primary transition-colors"
              data-testid="search-input"
            />
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-neutral-950 border border-border p-4 flex flex-wrap gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase block mb-2">Network</label>
                  <select
                    value={filterNetwork}
                    onChange={(e) => setFilterNetwork(e.target.value)}
                    className="bg-black border border-border px-3 py-2 font-mono text-sm min-w-40 focus:outline-none focus:border-primary"
                    data-testid="filter-network"
                  >
                    <option value="">All Networks</option>
                    {networks?.map(n => (
                      <option key={n.slug} value={n.slug}>{n.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase block mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-black border border-border px-3 py-2 font-mono text-sm min-w-40 focus:outline-none focus:border-primary"
                    data-testid="filter-status"
                  >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {(filterNetwork || filterStatus) && (
                  <button
                    onClick={() => { setFilterNetwork(""); setFilterStatus(""); }}
                    className="self-end px-4 py-2 bg-neutral-800 hover:bg-neutral-700 font-mono text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logs Table */}
        <div className="border border-border bg-black">
          {/* Table Header */}
          <div className="flex items-center gap-3 p-3 border-b border-border bg-neutral-950 text-xs text-muted-foreground font-mono uppercase">
            <div className="w-24">Time</div>
            <div className="w-28">Status</div>
            <div className="w-32">Network</div>
            <div className="flex-1">Method</div>
            <div className="w-20 text-right">Latency</div>
            <div className="w-4" />
          </div>

          {/* Logs */}
          <div className="max-h-[600px] overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Activity className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg mb-2">No logs yet</p>
                <p className="text-sm">Make some RPC requests to see them appear here</p>
              </div>
            ) : (
              filteredLogs.map(log => (
                <LogRow
                  key={log.id || log.requestId}
                  log={log}
                  expanded={expandedLogId === log.id}
                  onToggle={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                />
              ))
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between p-3 border-t border-border bg-neutral-950 text-xs text-muted-foreground font-mono">
            <span>Showing {filteredLogs.length} of {logs.length} logs</span>
            <span className="flex items-center gap-2">
              {isPaused && <span className="text-yellow-400">PAUSED</span>}
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
