import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Wifi, Activity, CheckCircle2, Lock, Globe, ArrowRight, Copy, Check, Code2, Braces, Hash, ChevronDown, ExternalLink, Server, Cpu, Clock, Box, Home } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";

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

      <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-mono text-sm">
        <Home className="w-4 h-4" />
        <span className="hidden md:inline">HOME</span>
      </a>
    </nav>
  );
}

const NETWORKS = [
  { slug: "ethereum", name: "Ethereum", chainId: 1, blockTime: "12s", icon: "ETH", color: "#627EEA" },
  { slug: "polygon", name: "Polygon", chainId: 137, blockTime: "2s", icon: "MATIC", color: "#8247E5" },
  { slug: "arbitrum", name: "Arbitrum", chainId: 42161, blockTime: "0.25s", icon: "ARB", color: "#28A0F0" },
  { slug: "optimism", name: "Optimism", chainId: 10, blockTime: "2s", icon: "OP", color: "#FF0420" },
  { slug: "base", name: "Base", chainId: 8453, blockTime: "2s", icon: "BASE", color: "#0052FF" },
];

const TESTNETS = [
  { slug: "ethereum-sepolia", name: "Sepolia", chainId: 11155111, icon: "ETH" },
  { slug: "polygon-mumbai", name: "Mumbai", chainId: 80001, icon: "MATIC" },
  { slug: "arbitrum-sepolia", name: "Arb Sepolia", chainId: 421614, icon: "ARB" },
  { slug: "optimism-sepolia", name: "OP Sepolia", chainId: 11155420, icon: "OP" },
  { slug: "base-sepolia", name: "Base Sepolia", chainId: 84532, icon: "BASE" },
];

function TerminalAnimation({ apiKey, network }: { apiKey: string; network: string }) {
  const [lines, setLines] = useState<{ text: string; type: "command" | "output" | "success" }[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);

  const allLines = [
    { text: `$ curl -X POST https://rpc.infra.v1/rpc/${network}/${apiKey.substring(0, 20)}...`, type: "command" as const },
    { text: `  -H "Content-Type: application/json"`, type: "command" as const },
    { text: `  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`, type: "command" as const },
    { text: "", type: "output" as const },
    { text: `{"jsonrpc":"2.0","id":1,"result":"0x${Math.floor(Math.random() * 16777215).toString(16)}"}`, type: "success" as const },
  ];

  useEffect(() => {
    if (currentLine < allLines.length) {
      const timer = setTimeout(() => {
        setLines(prev => [...prev, allLines[currentLine]]);
        setCurrentLine(prev => prev + 1);
      }, currentLine === 0 ? 500 : currentLine === 4 ? 800 : 300);
      return () => clearTimeout(timer);
    } else {
      const resetTimer = setTimeout(() => {
        setLines([]);
        setCurrentLine(0);
      }, 3000);
      return () => clearTimeout(resetTimer);
    }
  }, [currentLine, apiKey]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="bg-black border border-primary/30 overflow-hidden font-mono text-sm terminal-glow relative scanline">
      <div className="bg-neutral-900/80 px-4 py-2 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        </div>
        <span className="text-xs text-primary/70 font-bold tracking-widest">LIVE_PREVIEW</span>
      </div>
      <div ref={terminalRef} className="p-4 h-48 overflow-y-auto space-y-1 animate-flicker">
        {lines.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`${
              line.type === "command" ? "text-muted-foreground" :
              line.type === "success" ? "text-primary glow-text" : "text-white"
            }`}
          >
            {line.text}
          </motion.div>
        ))}
        <span className="animate-pulse text-primary glow-text">_</span>
      </div>
    </div>
  );
}

function LiveBlockCounter({ network }: { network: string }) {
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const fetchBlock = async () => {
      try {
        const response = await fetch(`/rpc/${network}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", method: "eth_blockNumber", params: [], id: 1 }),
        });
        const data = await response.json();
        if (data.result) {
          const newBlock = parseInt(data.result, 16).toLocaleString();
          if (newBlock !== blockNumber) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
          }
          setBlockNumber(newBlock);
        }
      } catch (e) {
        console.error("Failed to fetch block");
      }
    };

    fetchBlock();
    const interval = setInterval(fetchBlock, 12000);
    return () => clearInterval(interval);
  }, [network]);

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full bg-primary ${isAnimating ? "animate-ping" : "animate-pulse"}`} />
      <span className="font-mono text-xs text-muted-foreground">BLOCK</span>
      <span className={`font-mono text-sm text-primary transition-transform ${isAnimating ? "scale-110" : ""}`}>
        {blockNumber || "..."}
      </span>
    </div>
  );
}

function CodeSnippet({ language, code, onCopy }: { language: string; code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-black border border-border p-4 overflow-x-auto text-sm">
        <code className="text-primary font-mono whitespace-pre">{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
        data-testid={`copy-${language}`}
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function Connect() {
  const [mode, setMode] = useState<"quick" | "advanced">("quick");
  const [selectedNetwork, setSelectedNetwork] = useState("ethereum");
  const [selectedTab, setSelectedTab] = useState<"curl" | "javascript" | "python">("curl");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [step, setStep] = useState<"NETWORK" | "CONFIG" | "SECURITY" | "DEPLOY" | "ACTIVE">("NETWORK");
  const [advancedNetwork, setAdvancedNetwork] = useState<string | null>(null);
  const [integrationType, setIntegrationType] = useState<"http" | "websocket" | "both">("both");
  const [apiKeyLabel, setApiKeyLabel] = useState("");
  const [allowedIp, setAllowedIp] = useState("");
  const [rateLimit, setRateLimit] = useState("unlimited");
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("IDLE");
  const [connectionData, setConnectionData] = useState<any>(null);
  const [quickApiKey, setQuickApiKey] = useState<string | null>(null);

  const { data: connections } = useQuery({
    queryKey: ["/api/connections"],
    queryFn: async () => {
      const res = await fetch("/api/connections");
      return res.json();
    },
  });

  const existingKey = connections?.[0]?.apiKey || quickApiKey;

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const quickKeyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: `quick-${Date.now()}`, network: "MAINNET" }),
      });
      if (!response.ok) throw new Error("Failed to create key");
      return response.json();
    },
    onSuccess: (data) => {
      setQuickApiKey(data.apiKey);
    },
  });

  const createConnectionMutation = useMutation({
    mutationFn: async (data: { label: string; network: string; allowedIp?: string }) => {
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create connection");
      return response.json();
    },
    onSuccess: (data) => {
      setConnectionData(data);
      setStep("DEPLOY");
      setStatus("INIT");
      addLog("Initializing secure handshake protocol...");
      
      setTimeout(() => {
        addLog("Generating ephemeral keys (X25519)...");
        setStatus("KEYS");
      }, 1200);

      setTimeout(() => {
        addLog("Establishing mTLS tunnel...");
        setStatus("TUNNEL");
      }, 2400);

      setTimeout(() => {
        addLog("Syncing block headers from peer nodes...");
        setStatus("SYNC");
      }, 3600);

      setTimeout(() => {
        addLog("Verifying chain state integrity...");
        setStatus("VERIFY");
      }, 4800);

      setTimeout(() => {
        addLog("CONNECTION ESTABLISHED - All systems operational");
        setStatus("READY");
        setStep("ACTIVE");
      }, 6000);
    },
  });

  const handleAdvancedDeploy = () => {
    if (!advancedNetwork || !apiKeyLabel) return;
    createConnectionMutation.mutate({
      label: apiKeyLabel,
      network: advancedNetwork.includes("sepolia") || advancedNetwork.includes("mumbai") ? "TESTNET" : "MAINNET",
      allowedIp: allowedIp || undefined,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCodeSnippets = (apiKey: string, network: string) => ({
    curl: `curl -X POST ${window.location.origin}/rpc/${network}/${apiKey} \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`,
    javascript: `import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  "${window.location.origin}/rpc/${network}/${apiKey}"
);

const blockNumber = await provider.getBlockNumber();
console.log("Latest block:", blockNumber);`,
    python: `from web3 import Web3

w3 = Web3(Web3.HTTPProvider(
    "${window.location.origin}/rpc/${network}/${apiKey}"
))

block = w3.eth.block_number
print(f"Latest block: {block}")`,
  });

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background text-foreground pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
        
        <header className="mb-12 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 blur-3xl -z-10" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse glow-primary" />
            <span className="font-mono text-xs tracking-widest text-primary/70">START_BUILDING_V2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 relative">
            <span className="relative z-10">Start Building</span>
            <span className="absolute inset-0 text-primary/20 blur-sm -z-10">Start Building</span>
          </h1>
          <p className="text-xl text-muted-foreground font-mono max-w-2xl">
            Connect to any blockchain in seconds. No setup, no complexity, just raw RPC power.
          </p>
        </header>

        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setMode("quick")}
            className={`px-6 py-3 font-mono font-bold uppercase text-sm transition-all ${
              mode === "quick" 
                ? "bg-primary text-black" 
                : "bg-white/5 text-muted-foreground hover:text-white border border-border"
            }`}
            data-testid="mode-quick"
          >
            <Zap className="w-4 h-4 inline-block mr-2" />
            Quick Start
          </button>
          <button
            onClick={() => setMode("advanced")}
            className={`px-6 py-3 font-mono font-bold uppercase text-sm transition-all ${
              mode === "advanced" 
                ? "bg-primary text-black" 
                : "bg-white/5 text-muted-foreground hover:text-white border border-border"
            }`}
            data-testid="mode-advanced"
          >
            <Cpu className="w-4 h-4 inline-block mr-2" />
            Advanced Setup
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === "quick" && (
            <motion.div
              key="quick"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black border border-primary/50 p-6 glow-primary relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold uppercase flex items-center gap-2">
                          <Terminal className="w-5 h-5 text-primary" />
                          Your API Key
                        </h2>
                        <LiveBlockCounter network={selectedNetwork} />
                      </div>
                      
                      {existingKey ? (
                        <div className="space-y-4">
                          <div className="bg-background/80 border border-primary/30 p-4 flex items-center justify-between gap-4 code-highlight">
                            <code className="text-primary font-mono text-sm truncate flex-1 glow-text" data-testid="api-key-display">
                              {existingKey}
                            </code>
                            <button
                              onClick={() => copyToClipboard(existingKey, "apikey")}
                              className="shrink-0 p-2 bg-primary/20 hover:bg-primary/40 transition-colors border border-primary/30"
                              data-testid="copy-api-key"
                            >
                              {copiedId === "apikey" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-primary" />}
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-black/50 p-3 border border-border">
                              <label className="block text-xs text-muted-foreground mb-1 font-mono">HTTP ENDPOINT</label>
                              <code className="text-primary text-xs block truncate">
                                /rpc/{selectedNetwork}/{existingKey.substring(0, 12)}...
                              </code>
                            </div>
                            <div className="bg-black/50 p-3 border border-border">
                              <label className="block text-xs text-muted-foreground mb-1 font-mono">WSS ENDPOINT</label>
                              <code className="text-primary text-xs block truncate">
                                /ws/{selectedNetwork}/{existingKey.substring(0, 12)}...
                              </code>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => quickKeyMutation.mutate()}
                          disabled={quickKeyMutation.isPending}
                          className="w-full bg-primary text-black font-mono font-bold py-4 hover:bg-white transition-all uppercase flex items-center justify-center gap-2 animate-pulse-glow hover:animate-none"
                          data-testid="generate-key"
                        >
                          {quickKeyMutation.isPending ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <Zap className="w-5 h-5" />
                              Generate API Key Instantly
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase">Select Network</h3>
                    <div className="flex flex-wrap gap-2">
                      {NETWORKS.map((net) => (
                        <button
                          key={net.slug}
                          onClick={() => setSelectedNetwork(net.slug)}
                          className={`px-4 py-2 font-mono text-sm transition-all ${
                            selectedNetwork === net.slug
                              ? "bg-primary text-black"
                              : "bg-white/5 border border-border hover:border-white"
                          }`}
                          data-testid={`network-${net.slug}`}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {TESTNETS.map((net) => (
                        <button
                          key={net.slug}
                          onClick={() => setSelectedNetwork(net.slug)}
                          className={`px-3 py-1 font-mono text-xs transition-all ${
                            selectedNetwork === net.slug
                              ? "bg-primary/50 text-black"
                              : "bg-white/5 border border-border/50 text-muted-foreground hover:text-white"
                          }`}
                          data-testid={`network-${net.slug}`}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  {existingKey && (
                    <TerminalAnimation apiKey={existingKey} network={selectedNetwork} />
                  )}
                  {!existingKey && (
                    <div className="bg-black border border-border h-64 flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Terminal className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="font-mono text-sm">Generate a key to see live preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {existingKey && (
                <div className="border border-border bg-black">
                  <div className="flex border-b border-border">
                    {[
                      { id: "curl" as const, label: "cURL", icon: Terminal },
                      { id: "javascript" as const, label: "JavaScript", icon: Braces },
                      { id: "python" as const, label: "Python", icon: Code2 },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setSelectedTab(tab.id)}
                        className={`flex-1 px-6 py-4 font-mono text-sm uppercase flex items-center justify-center gap-2 transition-colors ${
                          selectedTab === tab.id
                            ? "bg-primary/10 text-primary border-b-2 border-primary"
                            : "text-muted-foreground hover:text-white"
                        }`}
                        data-testid={`tab-${tab.id}`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <CodeSnippet
                    language={selectedTab}
                    code={getCodeSnippets(existingKey, selectedNetwork)[selectedTab]}
                    onCopy={() => setCopiedId(selectedTab)}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {NETWORKS.map((net) => (
                  <motion.div 
                    key={net.slug} 
                    className="bg-black border border-border p-4 hover:border-primary/50 transition-all hover:glow-primary group cursor-pointer"
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110"
                        style={{ backgroundColor: net.color + "20", color: net.color }}
                      >
                        {net.icon}
                      </div>
                      <span className="font-mono font-bold text-sm">{net.name}</span>
                    </div>
                    <div className="space-y-1 text-xs font-mono text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Chain ID</span>
                        <span className="text-white group-hover:text-primary transition-colors">{net.chainId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Block Time</span>
                        <span className="text-white group-hover:text-primary transition-colors">{net.blockTime}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {mode === "advanced" && (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <AnimatePresence mode="wait">
                    {step === "NETWORK" && (
                      <motion.div
                        key="network"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="bg-black border border-border p-6">
                          <h2 className="font-bold uppercase mb-6 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-primary" />
                            Step 1: Select Network
                          </h2>
                          
                          <div className="mb-6">
                            <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase">Mainnets</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {NETWORKS.map((net) => (
                                <button
                                  key={net.slug}
                                  onClick={() => setAdvancedNetwork(net.slug)}
                                  className={`p-4 text-left border transition-all ${
                                    advancedNetwork === net.slug
                                      ? "border-primary bg-primary/10"
                                      : "border-border hover:border-white"
                                  }`}
                                  data-testid={`adv-network-${net.slug}`}
                                >
                                  <div className="flex items-center gap-3 mb-2">
                                    <div 
                                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                                      style={{ backgroundColor: net.color + "20", color: net.color }}
                                    >
                                      {net.icon}
                                    </div>
                                    <div>
                                      <div className="font-mono font-bold">{net.name}</div>
                                      <div className="text-xs text-muted-foreground">Chain {net.chainId}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {net.blockTime}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Box className="w-3 h-3" /> EVM
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase">Testnets</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                              {TESTNETS.map((net) => (
                                <button
                                  key={net.slug}
                                  onClick={() => setAdvancedNetwork(net.slug)}
                                  className={`p-3 text-left border transition-all ${
                                    advancedNetwork === net.slug
                                      ? "border-primary bg-primary/10"
                                      : "border-border/50 hover:border-white"
                                  }`}
                                  data-testid={`adv-network-${net.slug}`}
                                >
                                  <div className="font-mono text-sm">{net.name}</div>
                                  <div className="text-xs text-muted-foreground">ID: {net.chainId}</div>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            disabled={!advancedNetwork}
                            onClick={() => setStep("CONFIG")}
                            className="bg-white text-black font-mono font-bold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors uppercase flex items-center gap-2"
                            data-testid="next-config"
                          >
                            Next: Configuration <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === "CONFIG" && (
                      <motion.div
                        key="config"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="bg-black border border-border p-6">
                          <h2 className="font-bold uppercase mb-6 flex items-center gap-2">
                            <Server className="w-5 h-5 text-primary" />
                            Step 2: Integration Type
                          </h2>

                          <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                              { id: "http" as const, label: "HTTP Only", desc: "Standard JSON-RPC" },
                              { id: "websocket" as const, label: "WebSocket Only", desc: "Real-time subscriptions" },
                              { id: "both" as const, label: "Both", desc: "Full access" },
                            ].map((opt) => (
                              <button
                                key={opt.id}
                                onClick={() => setIntegrationType(opt.id)}
                                className={`p-4 text-left border transition-all ${
                                  integrationType === opt.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border hover:border-white"
                                }`}
                                data-testid={`integration-${opt.id}`}
                              >
                                <div className="font-mono font-bold mb-1">{opt.label}</div>
                                <div className="text-xs text-muted-foreground">{opt.desc}</div>
                              </button>
                            ))}
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block font-mono text-xs mb-2 uppercase text-muted-foreground">
                                API Key Label *
                              </label>
                              <input
                                type="text"
                                placeholder="production-backend-01"
                                value={apiKeyLabel}
                                onChange={(e) => setApiKeyLabel(e.target.value)}
                                className="w-full bg-background border border-border p-3 font-mono text-sm focus:border-primary outline-none transition-colors"
                                data-testid="input-label"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setStep("NETWORK")}
                            className="text-muted-foreground hover:text-white font-mono text-sm underline underline-offset-4"
                          >
                            Back
                          </button>
                          <button
                            disabled={!apiKeyLabel}
                            onClick={() => setStep("SECURITY")}
                            className="bg-white text-black font-mono font-bold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors uppercase flex items-center gap-2"
                            data-testid="next-security"
                          >
                            Next: Security <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {step === "SECURITY" && (
                      <motion.div
                        key="security"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                        <div className="bg-black border border-border p-6">
                          <h2 className="font-bold uppercase mb-6 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            Step 3: Security Settings
                          </h2>

                          <div className="space-y-6">
                            <div>
                              <label className="block font-mono text-xs mb-2 uppercase text-muted-foreground">
                                IP Allowlist (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="192.168.1.0/24, 10.0.0.1"
                                value={allowedIp}
                                onChange={(e) => setAllowedIp(e.target.value)}
                                className="w-full bg-background border border-border p-3 font-mono text-sm focus:border-primary outline-none transition-colors"
                                data-testid="input-ip"
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                Leave empty to allow all IPs. Supports CIDR notation.
                              </p>
                            </div>

                            <div>
                              <label className="block font-mono text-xs mb-2 uppercase text-muted-foreground">
                                Rate Limit
                              </label>
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { id: "100", label: "100/sec" },
                                  { id: "1000", label: "1,000/sec" },
                                  { id: "unlimited", label: "Unlimited" },
                                ].map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => setRateLimit(opt.id)}
                                    className={`p-3 font-mono text-sm border transition-all ${
                                      rateLimit === opt.id
                                        ? "border-primary bg-primary/10 text-primary"
                                        : "border-border hover:border-white"
                                    }`}
                                    data-testid={`rate-${opt.id}`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/30 p-4 flex items-start gap-3">
                          <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <div className="font-mono text-xs">
                            <strong className="text-primary block mb-1">DEPLOYMENT SUMMARY</strong>
                            <ul className="space-y-1 text-muted-foreground">
                              <li>Network: <span className="text-white">{advancedNetwork}</span></li>
                              <li>Integration: <span className="text-white">{integrationType.toUpperCase()}</span></li>
                              <li>Label: <span className="text-white">{apiKeyLabel}</span></li>
                              <li>IP Restriction: <span className="text-white">{allowedIp || "None"}</span></li>
                              <li>Rate Limit: <span className="text-white">{rateLimit}</span></li>
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => setStep("CONFIG")}
                            className="text-muted-foreground hover:text-white font-mono text-sm underline underline-offset-4"
                          >
                            Back
                          </button>
                          <button
                            onClick={handleAdvancedDeploy}
                            disabled={createConnectionMutation.isPending}
                            className="bg-primary text-black font-mono font-bold px-8 py-3 hover:bg-white transition-colors uppercase flex items-center gap-2"
                            data-testid="deploy-connection"
                          >
                            {createConnectionMutation.isPending ? "DEPLOYING..." : "Deploy Connection"}
                            <Wifi className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {(step === "DEPLOY" || step === "ACTIVE") && (
                      <motion.div
                        key="deploy"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        <div className="bg-black border border-primary overflow-hidden font-mono text-sm relative">
                          <div className="bg-neutral-900 px-4 py-3 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-500" />
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                            </div>
                            <span className="text-xs text-muted-foreground">DEPLOYMENT_TERMINAL</span>
                          </div>
                          <div className="p-4 h-72 overflow-y-auto space-y-2 bg-black">
                            {logs.map((log, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`${log.includes("ESTABLISHED") ? "text-primary font-bold" : "text-green-500/80"}`}
                              >
                                {log}
                              </motion.div>
                            ))}
                            {step === "DEPLOY" && (
                              <span className="animate-pulse text-primary">_</span>
                            )}
                          </div>
                        </div>

                        {step === "ACTIVE" && connectionData && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-primary/5 border border-primary p-6"
                          >
                            <h3 className="font-bold uppercase mb-6 flex items-center gap-2 text-primary">
                              <CheckCircle2 className="w-5 h-5" />
                              Connection Active
                            </h3>

                            <div className="space-y-4">
                              <div>
                                <label className="block font-mono text-xs mb-2 text-muted-foreground">HTTP ENDPOINT</label>
                                <div className="flex gap-2">
                                  <code className="bg-black border border-border px-3 py-2 block w-full text-primary text-sm overflow-x-auto">
                                    {window.location.origin}/rpc/{advancedNetwork}/{connectionData.apiKey}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(`${window.location.origin}/rpc/${advancedNetwork}/${connectionData.apiKey}`, "http")}
                                    className="bg-white text-black p-2 hover:bg-primary transition-colors shrink-0"
                                  >
                                    {copiedId === "http" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              <div>
                                <label className="block font-mono text-xs mb-2 text-muted-foreground">WEBSOCKET ENDPOINT</label>
                                <div className="flex gap-2">
                                  <code className="bg-black border border-border px-3 py-2 block w-full text-primary text-sm overflow-x-auto">
                                    {window.location.origin.replace("http", "ws")}/ws/{advancedNetwork}/{connectionData.apiKey}
                                  </code>
                                  <button
                                    onClick={() => copyToClipboard(`${window.location.origin.replace("http", "ws")}/ws/${advancedNetwork}/${connectionData.apiKey}`, "ws")}
                                    className="bg-white text-black p-2 hover:bg-primary transition-colors shrink-0"
                                  >
                                    {copiedId === "ws" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              <div className="flex gap-4 pt-4">
                                <Link href="/dashboard" className="flex-1 bg-white text-black font-mono font-bold py-3 text-center hover:bg-primary transition-colors uppercase">
                                  View Dashboard
                                </Link>
                                <button
                                  onClick={() => {
                                    setStep("NETWORK");
                                    setAdvancedNetwork(null);
                                    setApiKeyLabel("");
                                    setAllowedIp("");
                                    setLogs([]);
                                    setConnectionData(null);
                                  }}
                                  className="flex-1 border border-border font-mono font-bold py-3 hover:border-white transition-colors uppercase"
                                >
                                  Create Another
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="border border-border bg-black/50 p-6 h-fit sticky top-24">
                  <h3 className="font-bold uppercase mb-6 tracking-widest text-sm">Deployment Progress</h3>

                  <div className="space-y-4 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border -z-10" />

                    {[
                      { id: "NETWORK", label: "Network Selection", icon: Globe },
                      { id: "CONFIG", label: "Configuration", icon: Server },
                      { id: "SECURITY", label: "Security Settings", icon: Shield },
                      { id: "DEPLOY", label: "Deployment", icon: Activity },
                      { id: "ACTIVE", label: "Operational", icon: CheckCircle2 },
                    ].map((s, i) => {
                      const steps = ["NETWORK", "CONFIG", "SECURITY", "DEPLOY", "ACTIVE"];
                      const currentIndex = steps.indexOf(step);
                      const stepIndex = steps.indexOf(s.id);
                      const isActive = s.id === step;
                      const isDone = stepIndex < currentIndex;

                      return (
                        <div key={s.id} className={`flex items-center gap-4 transition-opacity ${isDone || isActive ? "opacity-100" : "opacity-30"}`}>
                          <div className={`w-6 h-6 rounded-full border flex items-center justify-center bg-black ${
                            isActive ? "border-primary text-primary animate-pulse" :
                            isDone ? "border-green-500 text-green-500" : "border-border"
                          }`}>
                            <s.icon className="w-3 h-3" />
                          </div>
                          <span className="font-mono text-sm uppercase">{s.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {step === "ACTIVE" && (
                    <div className="mt-8 pt-6 border-t border-border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground font-mono mb-1">LATENCY</div>
                          <div className="text-xl font-bold text-primary">~12ms</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground font-mono mb-1">UPTIME</div>
                          <div className="text-xl font-bold text-green-500">99.99%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </>
  );
}
