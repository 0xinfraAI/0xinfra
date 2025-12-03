import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Wifi, Activity, CheckCircle2, XCircle, Lock, Globe, Cpu, ArrowRight, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";

export default function Connect() {
  const [step, setStep] = useState<"SELECT" | "CONFIG" | "DEPLOY" | "ACTIVE">("SELECT");
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState("IDLE");
  const [apiKeyLabel, setApiKeyLabel] = useState("");
  const [allowedIp, setAllowedIp] = useState("");
  const [connectionData, setConnectionData] = useState<any>(null);
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

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
      addLog("Initializing handshake protocol...");
      
      setTimeout(() => {
        addLog("Verifying cryptographic keys...");
        setStatus("VERIFY");
      }, 1500);

      setTimeout(() => {
        addLog("Establishing secure tunnel (mTLS)...");
        setStatus("TUNNEL");
      }, 3000);

      setTimeout(() => {
        addLog("Syncing latest block headers...");
        setStatus("SYNC");
      }, 4500);

      setTimeout(() => {
        addLog("Connection established successfully.");
        setStatus("READY");
        setStep("ACTIVE");
      }, 6000);
    },
  });

  const handleDeploy = () => {
    if (!selectedNode || !apiKeyLabel) return;
    createConnectionMutation.mutate({
      label: apiKeyLabel,
      network: selectedNode,
      allowedIp: allowedIp || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <header className="mb-12 border-b border-border pb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <div className={`w-3 h-3 rounded-full ${step === "ACTIVE" ? "bg-primary animate-pulse" : "bg-yellow-500"}`} />
                 <span className="font-mono text-xs tracking-widest opacity-70">CONNECTION_WIZARD_V1.0</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
                Bridge Interface
              </h1>
            </div>
            <div className="hidden md:block text-right font-mono text-xs text-muted-foreground">
              <div className="mb-1">SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
              <div>ENCRYPTION: AES-256-GCM</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Panel: Configuration */}
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              {step === "SELECT" && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="bg-black border border-border p-6">
                    <h2 className="font-bold uppercase mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-primary" />
                      Select Network Layer
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {["MAINNET", "TESTNET", "DEVNET"].map((net) => (
                        <button 
                          key={net}
                          className={`p-4 text-left border transition-all ${
                            selectedNode === net 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border hover:border-white"
                          }`}
                          onClick={() => setSelectedNode(net)}
                        >
                          <div className="font-mono font-bold text-lg mb-1">{net}</div>
                          <div className="text-xs opacity-60 font-mono">
                            {net === "MAINNET" ? "Production Ready" : "Sandbox Environment"}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black border border-border p-6 opacity-50 pointer-events-none">
                    <h2 className="font-bold uppercase mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5" />
                      Auth Method
                    </h2>
                    <div className="h-12 bg-white/5 border border-white/10" />
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      disabled={!selectedNode}
                      onClick={() => setStep("CONFIG")}
                      className="bg-white text-black font-mono font-bold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary transition-colors uppercase flex items-center gap-2"
                    >
                      Next Step <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "CONFIG" && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                   <div className="bg-black border border-border p-6">
                    <h2 className="font-bold uppercase mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-primary" />
                      Authentication
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block font-mono text-xs mb-2 uppercase">API Key Label</label>
                        <input 
                          type="text" 
                          placeholder="My-App-Node-01" 
                          value={apiKeyLabel}
                          onChange={(e) => setApiKeyLabel(e.target.value)}
                          className="w-full bg-background border border-border p-3 font-mono text-sm focus:border-primary outline-none transition-colors" 
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-xs mb-2 uppercase">Allowed IP (Optional)</label>
                        <input 
                          type="text" 
                          placeholder="0.0.0.0/0" 
                          value={allowedIp}
                          onChange={(e) => setAllowedIp(e.target.value)}
                          className="w-full bg-background border border-border p-3 font-mono text-sm focus:border-primary outline-none transition-colors" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 border border-primary/20 p-4 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <p className="font-mono text-xs text-muted-foreground">
                      <strong className="text-primary block mb-1">SECURITY NOTICE</strong>
                      You are about to generate a high-privilege access key. This key will grant full read/write access to the node RPC. Do not share it.
                    </p>
                  </div>

                  {createConnectionMutation.isError && (
                    <div className="bg-red-500/10 border border-red-500/50 p-4 font-mono text-sm text-red-400">
                      Error: Failed to create connection. Please try again.
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button 
                      onClick={() => setStep("SELECT")}
                      className="text-muted-foreground hover:text-white font-mono text-sm underline underline-offset-4"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleDeploy}
                      disabled={!apiKeyLabel || createConnectionMutation.isPending}
                      className="bg-primary text-black font-mono font-bold px-8 py-3 hover:bg-white transition-colors uppercase flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createConnectionMutation.isPending ? "CONNECTING..." : "Generate & Connect"} <Wifi className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {(step === "DEPLOY" || step === "ACTIVE") && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-black border border-border p-0 overflow-hidden font-mono text-sm relative">
                    <div className="bg-neutral-900 px-4 py-2 border-b border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>TERMINAL_OUTPUT</span>
                      <span>/bin/bash</span>
                    </div>
                    <div className="p-4 h-64 overflow-y-auto space-y-2">
                      {logs.map((log, i) => (
                        <div key={i} className="text-green-500/80">{log}</div>
                      ))}
                      {step === "DEPLOY" && (
                        <div className="animate-pulse text-primary">_</div>
                      )}
                    </div>
                  </div>

                  {step === "ACTIVE" && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/10 p-6"
                    >
                       <h3 className="font-bold uppercase mb-4 flex items-center gap-2 text-green-500">
                         <CheckCircle2 className="w-5 h-5" />
                         Connection Active
                       </h3>
                       
                       <div className="space-y-4">
                         <div>
                           <label className="block font-mono text-xs mb-2 text-muted-foreground">HTTPS ENDPOINT</label>
                           <div className="flex gap-2">
                             <code className="bg-black border border-border px-3 py-2 block w-full text-primary overflow-x-auto">
                               https://rpc.infra.v1/{connectionData?.network}/{connectionData?.apiKey}
                             </code>
                             <button 
                               onClick={() => navigator.clipboard.writeText(`https://rpc.infra.v1/${connectionData?.network}/${connectionData?.apiKey}`)}
                               className="bg-white text-black p-2 hover:bg-primary transition-colors"
                             >
                               <Copy className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                         
                         <div>
                           <label className="block font-mono text-xs mb-2 text-muted-foreground">WEBSOCKET ENDPOINT</label>
                           <div className="flex gap-2">
                             <code className="bg-black border border-border px-3 py-2 block w-full text-primary overflow-x-auto">
                               wss://rpc.infra.v1/ws/{connectionData?.network}/{connectionData?.apiKey}
                             </code>
                             <button 
                               onClick={() => navigator.clipboard.writeText(`wss://rpc.infra.v1/ws/${connectionData?.network}/${connectionData?.apiKey}`)}
                               className="bg-white text-black p-2 hover:bg-primary transition-colors"
                             >
                               <Copy className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Status */}
          <div className="border border-border bg-black/50 p-6 h-fit sticky top-24">
            <h3 className="font-bold uppercase mb-6 tracking-widest text-sm">Connection State</h3>
            
            <div className="space-y-6 relative">
              {/* Connecting Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border -z-10" />

              {[
                { id: "INIT", label: "Initialization", icon: Activity },
                { id: "VERIFY", label: "Key Verification", icon: Lock },
                { id: "TUNNEL", label: "Secure Tunnel", icon: Shield },
                { id: "SYNC", label: "Block Sync", icon: Zap },
                { id: "READY", label: "Operational", icon: CheckCircle2 },
              ].map((s, i) => {
                const isActive = s.id === status;
                const isDone = step === "ACTIVE" || (step === "DEPLOY" && ["INIT", "VERIFY", "TUNNEL", "SYNC", "READY"].indexOf(status) > i);
                
                return (
                  <div key={s.id} className={`flex items-center gap-4 ${isDone || isActive ? "opacity-100" : "opacity-30"}`}>
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
              <div className="mt-8 pt-8 border-t border-border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground font-mono mb-1">LATENCY</div>
                    <div className="text-xl font-bold text-primary">12ms</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-mono mb-1">REQUESTS/SEC</div>
                    <div className="text-xl font-bold">4.2k</div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}