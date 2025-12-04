import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Terminal, ChevronRight, ChevronDown, Hash, FileText, Code, Cpu, Shield,
  Search, Copy, Check, ExternalLink, Zap, Database, Globe, Key, Wallet, Bot,
  PlayCircle, BookOpen, Rocket, Settings, Network, Box, AlertTriangle, Info,
  Activity, TrendingUp, Users, Clock, Layers, Lock, Server, Wifi, Eye, Sparkles
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

declare global {
  interface Window {
    mermaid: any;
  }
}

const useMermaid = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (window.mermaid) {
      setLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
    script.async = true;
    script.onload = () => {
      window.mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          primaryColor: "#CCFF00",
          primaryTextColor: "#000",
          primaryBorderColor: "#CCFF00",
          lineColor: "#666",
          secondaryColor: "#1a1a1a",
          tertiaryColor: "#0a0a0a",
          background: "#000",
          mainBkg: "#1a1a1a",
          nodeBorder: "#CCFF00",
          clusterBkg: "#0a0a0a",
          clusterBorder: "#333",
          titleColor: "#fff",
          edgeLabelBackground: "#1a1a1a",
        },
      });
      setLoaded(true);
    };
    document.body.appendChild(script);
  }, []);

  return loaded;
};

function MermaidDiagram({ chart, title }: { chart: string; title?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mermaidLoaded = useMermaid();
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    if (!mermaidLoaded || !containerRef.current) return;

    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await window.mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error("Mermaid render error:", error);
      }
    };

    renderDiagram();
  }, [chart, mermaidLoaded]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border bg-black p-6 my-6 overflow-x-auto group hover:border-primary/50 transition-colors"
    >
      {title && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <span className="font-mono text-xs text-primary uppercase tracking-widest">{title}</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">LIVE</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="flex justify-center [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </motion.div>
  );
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
      data-testid="copy-button"
    >
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />}
    </button>
  );
}

type CodeLanguage = "curl" | "javascript" | "python";

function CodeTabs({ examples }: { examples: Record<CodeLanguage, string> }) {
  const [activeTab, setActiveTab] = useState<CodeLanguage>("javascript");

  const tabs: { id: CodeLanguage; label: string }[] = [
    { id: "javascript", label: "JavaScript" },
    { id: "python", label: "Python" },
    { id: "curl", label: "cURL" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border bg-black my-6 group hover:border-primary/30 transition-colors"
    >
      <div className="flex border-b border-border bg-neutral-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 font-mono text-xs transition-all ${
              activeTab === tab.id
                ? "bg-primary text-black font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1" />
        <CopyButton text={examples[activeTab]} />
      </div>
      <pre className="p-4 font-mono text-sm text-primary/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
        {examples[activeTab]}
      </pre>
    </motion.div>
  );
}

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-black border border-border my-4 relative group hover:border-primary/30 transition-colors"
    >
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-neutral-950">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase">{language}</span>
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="p-4 font-mono text-sm text-primary/90 overflow-x-auto">
        {code}
      </pre>
    </motion.div>
  );
}

function LivePlayground() {
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);

  const runQuery = async () => {
    setLoading(true);
    const start = Date.now();
    
    await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
    
    setLatency(Date.now() - start);
    setResponse(JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      result: "0x" + Math.floor(Math.random() * 20000000 + 19000000).toString(16)
    }, null, 2));
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="border-2 border-primary/50 bg-black p-6 my-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <PlayCircle className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Live API Playground</h3>
            <p className="text-xs text-muted-foreground">Try eth_blockNumber in real-time</p>
          </div>
        </div>
        {latency && (
          <div className="flex items-center gap-2 text-primary">
            <Activity className="w-4 h-4" />
            <span className="font-mono text-sm">{latency}ms</span>
          </div>
        )}
      </div>

      <div className="bg-neutral-950 border border-border p-4 mb-4 font-mono text-sm">
        <div className="text-muted-foreground mb-2">// Request</div>
        <div className="text-primary">
          {`{ "jsonrpc": "2.0", "method": "eth_blockNumber", "params": [], "id": 1 }`}
        </div>
      </div>

      <button
        onClick={runQuery}
        disabled={loading}
        className="w-full bg-primary text-black font-bold py-3 hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Fetching...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Execute Request
          </>
        )}
      </button>

      {response && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 bg-neutral-950 border border-primary/30 p-4 font-mono text-sm"
        >
          <div className="text-muted-foreground mb-2">// Response</div>
          <pre className="text-primary">{response}</pre>
        </motion.div>
      )}
    </motion.div>
  );
}

function ApiMethod({ 
  method, 
  endpoint, 
  description, 
  params, 
  examples,
  response 
}: { 
  method: string;
  endpoint: string;
  description: string;
  params?: Array<{ name: string; type: string; required: boolean; description: string }>;
  examples: Record<CodeLanguage, string>;
  response?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border mb-4 hover:border-primary/30 transition-colors"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs bg-primary text-black px-2 py-1 font-bold font-mono">{method}</span>
          <span className="font-mono font-bold text-primary">{endpoint}</span>
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 border-t border-border">
              <p className="text-muted-foreground mb-4">{description}</p>

              {params && params.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-mono text-sm font-bold mb-3 text-primary flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Parameters
                  </h4>
                  <div className="space-y-2">
                    {params.map((param) => (
                      <div key={param.name} className="flex items-start gap-4 p-3 bg-black/50 border border-border">
                        <div className="flex-shrink-0">
                          <code className="font-mono text-sm text-primary">{param.name}</code>
                          <span className="ml-2 text-xs text-muted-foreground">{param.type}</span>
                          {param.required && (
                            <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-1">required</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="font-mono text-sm font-bold mb-3 text-primary flex items-center gap-2">
                <Code className="w-4 h-4" />
                Request Example
              </h4>
              <CodeTabs examples={examples} />

              {response && (
                <>
                  <h4 className="font-mono text-sm font-bold mb-3 text-primary mt-6 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Response
                  </h4>
                  <CodeBlock code={response} language="json" />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Callout({ type, title, children }: { type: "info" | "warning" | "success"; title: string; children: React.ReactNode }) {
  const styles = {
    info: "bg-blue-500/10 border-blue-500/50 text-blue-400",
    warning: "bg-yellow-500/10 border-yellow-500/50 text-yellow-400",
    success: "bg-primary/10 border-primary/50 text-primary",
  };

  const icons = {
    info: <Info className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    success: <Check className="w-5 h-5" />,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`border-l-4 p-4 my-6 ${styles[type]}`}
    >
      <div className="flex items-center gap-2 font-bold mb-2">
        {icons[type]}
        {title}
      </div>
      <div className="text-sm text-muted-foreground">{children}</div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label, suffix }: { icon: any; value: string; label: string; suffix?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="border border-border p-6 bg-black hover:border-primary/50 transition-all"
    >
      <Icon className="w-8 h-8 text-primary mb-4" />
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-primary">{value}</span>
        {suffix && <span className="text-xl text-muted-foreground">{suffix}</span>}
      </div>
      <p className="text-sm text-muted-foreground mt-2 font-mono uppercase">{label}</p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className="border border-border p-6 bg-black hover:border-primary/50 transition-all group"
    >
      <div className="w-12 h-12 bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-colors">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function NetworkBadge({ name, status, latency }: { name: string; status: "live" | "beta"; latency: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center justify-between p-3 border border-border hover:border-primary/50 transition-colors bg-black"
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${status === "live" ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
        <span className="font-mono text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{latency}</span>
        <span className={`text-xs px-2 py-0.5 ${status === "live" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
          {status.toUpperCase()}
        </span>
      </div>
    </motion.div>
  );
}

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
}

const sections: DocSection[] = [
  { id: "overview", title: "Overview", icon: <Eye className="w-4 h-4" />, category: "Getting Started" },
  { id: "quickstart", title: "Quick Start", icon: <Zap className="w-4 h-4" />, category: "Getting Started" },
  { id: "authentication", title: "Authentication", icon: <Key className="w-4 h-4" />, category: "Getting Started" },
  { id: "architecture", title: "Architecture", icon: <Network className="w-4 h-4" />, category: "Core Concepts" },
  { id: "networks", title: "Supported Networks", icon: <Globe className="w-4 h-4" />, category: "Core Concepts" },
  { id: "eth-methods", title: "Ethereum Methods", icon: <Code className="w-4 h-4" />, category: "API Reference" },
  { id: "enhanced-api", title: "Enhanced APIs", icon: <Rocket className="w-4 h-4" />, category: "API Reference" },
  { id: "solana-api", title: "Solana API", icon: <Box className="w-4 h-4" />, category: "API Reference" },
  { id: "sdk-javascript", title: "JavaScript SDK", icon: <FileText className="w-4 h-4" />, category: "SDKs" },
  { id: "sdk-python", title: "Python SDK", icon: <FileText className="w-4 h-4" />, category: "SDKs" },
  { id: "deploy-contracts", title: "Deploy Contracts", icon: <Rocket className="w-4 h-4" />, category: "Tutorials" },
  { id: "ai-copilot", title: "AI Copilot", icon: <Bot className="w-4 h-4" />, category: "Tutorials" },
  { id: "webhooks", title: "Webhooks", icon: <Zap className="w-4 h-4" />, category: "Advanced" },
  { id: "rate-limits", title: "Rate Limits", icon: <Settings className="w-4 h-4" />, category: "Advanced" },
];

const categories = ["Getting Started", "Core Concepts", "API Reference", "SDKs", "Tutorials", "Advanced"];

export default function Docs() {
  const [activeSection, setActiveSection] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map((c) => [c, true]))
  );

  const filteredSections = sections.filter(
    (s) => s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-border bg-neutral-950 fixed h-screen overflow-y-auto flex flex-col">
        <div className="p-4 border-b border-border">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 bg-primary animate-pulse" />
            <span className="font-mono font-bold tracking-widest">INFRA_V1</span>
          </a>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-border pl-10 pr-4 py-2 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              data-testid="docs-search"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {categories.map((category) => {
            const categorySections = filteredSections.filter((s) => s.category === category);
            if (categorySections.length === 0) return null;

            return (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 hover:text-foreground transition-colors"
                >
                  {category}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${expandedCategories[category] ? "" : "-rotate-90"}`}
                  />
                </button>

                <AnimatePresence>
                  {expandedCategories[category] && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1 overflow-hidden"
                    >
                      {categorySections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => setActiveSection(section.id)}
                          className={`w-full flex items-center gap-2 px-3 py-2 font-mono text-sm transition-all ${
                            activeSection === section.id
                              ? "bg-primary text-black font-bold"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                          }`}
                          data-testid={`nav-${section.id}`}
                        >
                          {section.icon}
                          {section.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>v1.0.4-beta</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="border-b border-border p-8 bg-background sticky top-0 z-30">
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm mb-2">
            <a href="/docs" className="hover:text-primary transition-colors">DOCS</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{sections.find((s) => s.id === activeSection)?.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-black uppercase tracking-tight">
              {sections.find((s) => s.id === activeSection)?.title}
            </h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Updated 2 min ago</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-5xl pb-32">
          {/* Overview - Hero Section */}
          {activeSection === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              {/* Hero Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard icon={Globe} value="80" suffix="+" label="Networks Supported" />
                <StatCard icon={Activity} value="99.99" suffix="%" label="Uptime SLA" />
                <StatCard icon={Zap} value="<50" suffix="ms" label="Average Latency" />
                <StatCard icon={Users} value="10K" suffix="+" label="Active Developers" />
              </div>

              {/* Tagline */}
              <div className="text-center py-12 border-y border-border">
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-black uppercase tracking-tight mb-4"
                >
                  The Infrastructure Layer for <span className="text-primary">Web3</span>
                </motion.h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Connect to any blockchain. Build anything. Scale infinitely.
                </p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                  icon={Server}
                  title="Multi-Chain Access"
                  description="One API key for 80+ blockchains. Ethereum, Polygon, Arbitrum, Optimism, Solana, and more."
                />
                <FeatureCard 
                  icon={Bot}
                  title="AI-Powered Development"
                  description="Generate smart contracts, debug errors, and get code suggestions with our AI Copilot."
                />
                <FeatureCard 
                  icon={Rocket}
                  title="Deploy in Seconds"
                  description="Write, compile, and deploy contracts directly from your browser with our Remix-style IDE."
                />
                <FeatureCard 
                  icon={Database}
                  title="Enhanced APIs"
                  description="Get token balances, NFT metadata, and transaction history with single API calls."
                />
                <FeatureCard 
                  icon={Lock}
                  title="Enterprise Security"
                  description="SOC 2 compliant infrastructure with automatic key rotation and IP allowlisting."
                />
                <FeatureCard 
                  icon={TrendingUp}
                  title="Real-time Analytics"
                  description="Monitor usage, track requests, and optimize performance with detailed dashboards."
                />
              </div>

              {/* Live Network Status */}
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Wifi className="w-6 h-6 text-primary" />
                  Live Network Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <NetworkBadge name="Ethereum Mainnet" status="live" latency="23ms" />
                  <NetworkBadge name="Polygon Mainnet" status="live" latency="18ms" />
                  <NetworkBadge name="Arbitrum One" status="live" latency="31ms" />
                  <NetworkBadge name="Optimism" status="live" latency="27ms" />
                  <NetworkBadge name="Base" status="live" latency="22ms" />
                  <NetworkBadge name="Solana Mainnet" status="live" latency="45ms" />
                </div>
              </div>

              {/* Architecture Preview */}
              <MermaidDiagram
                title="System Architecture"
                chart={`flowchart TB
    subgraph Clients["Your Applications"]
        A[dApps]
        B[Wallets]
        C[Backend Services]
    end
    
    subgraph Edge["INFRA_V1 Edge Network"]
        D[Global Load Balancer]
        E[Smart Cache Layer]
        F[Rate Limiter]
    end
    
    subgraph Nodes["Multi-Chain Infrastructure"]
        G[EVM Nodes]
        H[Solana Nodes]
        I[Archive Nodes]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    
    style D fill:#CCFF00,color:#000
    style E fill:#CCFF00,color:#000
    style F fill:#CCFF00,color:#000`}
              />

              <Callout type="success" title="Ready to Start?">
                Check out the <button onClick={() => setActiveSection("quickstart")} className="underline hover:text-primary">Quick Start guide</button> to make your first API call in under 5 minutes.
              </Callout>
            </motion.div>
          )}

          {/* Quick Start */}
          {activeSection === "quickstart" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Get started with INFRA_V1 in under 5 minutes. Create your API key, make your first RPC call, and start building on any blockchain.
              </p>

              {/* Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { step: 1, title: "Create API Key", desc: "Sign up and generate your first API key from the dashboard.", icon: Key },
                  { step: 2, title: "Choose Network", desc: "Select from 80+ supported chains including Ethereum, Polygon, and Solana.", icon: Globe },
                  { step: 3, title: "Start Building", desc: "Make your first API call and access blockchain data instantly.", icon: Rocket },
                ].map((item) => (
                  <motion.div 
                    key={item.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: item.step * 0.1 }}
                    className="border border-border p-6 hover:border-primary/50 transition-colors relative group"
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary flex items-center justify-center">
                      <span className="font-mono font-bold text-black">{item.step}</span>
                    </div>
                    <item.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2">
                <PlayCircle className="w-6 h-6 text-primary" />
                Your First API Call
              </h2>

              <p className="text-muted-foreground mb-4">
                Replace <code className="bg-black px-2 py-1 text-primary border border-border">YOUR_API_KEY</code> with your actual API key from the dashboard.
              </p>

              <CodeTabs
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
});

const data = await response.json();
console.log('Current block:', parseInt(data.result, 16));`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_blockNumber',
        'params': [],
        'id': 1
    }
)

data = response.json()
print(f"Current block: {int(data['result'], 16)}")`
                }}
              />

              {/* Live Playground */}
              <LivePlayground />

              <Callout type="success" title="You're Ready!">
                Once you get a successful response, you're all set to start building. Check out the API Reference for all available methods.
              </Callout>
            </motion.div>
          )}

          {/* Authentication */}
          {activeSection === "authentication" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Authenticate your requests using API keys. Each key is associated with your account and can be configured with specific permissions and rate limits.
              </p>

              <MermaidDiagram
                title="Authentication Flow"
                chart={`sequenceDiagram
    participant Client as Your App
    participant Edge as INFRA_V1 Edge
    participant Auth as Auth Service
    participant Node as Blockchain Node
    
    Client->>Edge: Request + API Key
    Edge->>Auth: Validate Key
    Auth-->>Edge: Key Valid ✓
    Edge->>Edge: Check Rate Limits
    Edge->>Node: Forward Request
    Node-->>Edge: Response
    Edge-->>Client: Return Data`}
              />

              <h2 className="text-2xl font-bold mt-12 mb-6">API Key Types</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="border border-border p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-500/20 flex items-center justify-center">
                      <Key className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-bold">Standard Keys</h3>
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400">FREE</span>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 300 requests/second</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> 10M requests/month</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> All standard RPC methods</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-400" /> Community support</li>
                  </ul>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="border-2 border-primary p-6 bg-primary/5 relative"
                >
                  <div className="absolute -top-3 right-4 bg-primary text-black text-xs font-bold px-2 py-1">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">Pro Keys</h3>
                      <span className="px-2 py-0.5 text-xs bg-primary text-black font-bold">PRO</span>
                    </div>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 3,000 requests/second</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Unlimited requests</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Enhanced APIs (NFT, Token)</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> WebSocket subscriptions</li>
                    <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Priority support</li>
                  </ul>
                </motion.div>
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-6">Using Your API Key</h2>

              <p className="text-muted-foreground mb-4">
                Include your API key in the endpoint URL:
              </p>

              <CodeBlock
                code={`https://{network}.infra.v1/v2/{YOUR_API_KEY}`}
                language="url"
              />

              <Callout type="warning" title="Keep Your Keys Secret">
                Never expose your API keys in client-side code or public repositories. Use environment variables and server-side proxies for production applications.
              </Callout>
            </motion.div>
          )}

          {/* Architecture */}
          {activeSection === "architecture" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                INFRA_V1 is built on a globally distributed infrastructure designed for maximum reliability, low latency, and seamless scalability.
              </p>

              <MermaidDiagram
                title="Global Infrastructure"
                chart={`flowchart TB
    subgraph Clients["Client Layer"]
        A[Web3 Apps]
        B[Mobile dApps]
        C[Backend Services]
    end
    
    subgraph Edge["Edge Network - 50+ PoPs"]
        D[Load Balancer]
        E[Rate Limiter]
        F[Cache Layer]
    end
    
    subgraph Infra["Node Infrastructure"]
        G[Ethereum Cluster]
        H[Polygon Cluster]
        I[L2 Networks]
        J[Solana Cluster]
    end
    
    A --> D
    B --> D
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    
    style D fill:#CCFF00,color:#000
    style E fill:#CCFF00,color:#000
    style F fill:#CCFF00,color:#000`}
              />

              <h2 className="text-2xl font-bold mt-12 mb-6">Infrastructure Components</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FeatureCard icon={Globe} title="Global Edge Network" description="Requests are routed to the nearest edge location for minimal latency. 50+ PoPs worldwide ensure fast response times globally." />
                <FeatureCard icon={Database} title="Intelligent Caching" description="Frequently accessed data is cached at the edge, reducing load on nodes and improving response times by up to 10x." />
                <FeatureCard icon={Shield} title="Node Redundancy" description="Multiple node providers per network ensure 99.99% uptime. Automatic failover handles any node issues transparently." />
                <FeatureCard icon={Activity} title="Real-time Monitoring" description="24/7 monitoring with automatic alerting and incident response. View network status at status.infra.v1." />
              </div>

              <MermaidDiagram
                title="Request Flow with Caching"
                chart={`sequenceDiagram
    participant App as Your App
    participant Edge as Edge PoP
    participant Cache as Cache Layer
    participant Node as Blockchain Node
    
    App->>Edge: RPC Request
    Edge->>Edge: Authenticate
    Edge->>Cache: Check Cache
    alt Cache Hit
        Cache-->>Edge: Cached Response
        Edge-->>App: ⚡ Fast Response (~10ms)
    else Cache Miss
        Edge->>Node: Forward to Node
        Node-->>Edge: Node Response
        Edge->>Cache: Store in Cache
        Edge-->>App: Response (~50ms)
    end`}
              />
            </motion.div>
          )}

          {/* Supported Networks */}
          {activeSection === "networks" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access 80+ blockchain networks through a single unified API. All networks support standard JSON-RPC methods plus INFRA_V1 enhanced APIs.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-6 flex items-center gap-2">
                <Layers className="w-6 h-6 text-primary" />
                EVM Networks
              </h2>

              <div className="overflow-x-auto border border-border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-neutral-950 text-left">
                      <th className="p-4 font-mono text-sm text-primary">Network</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Chain ID</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Endpoint</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {[
                      { network: "Ethereum Mainnet", chainId: "1", endpoint: "eth-mainnet", latency: "23ms" },
                      { network: "Ethereum Sepolia", chainId: "11155111", endpoint: "eth-sepolia", latency: "28ms" },
                      { network: "Polygon Mainnet", chainId: "137", endpoint: "polygon-mainnet", latency: "18ms" },
                      { network: "Polygon Mumbai", chainId: "80001", endpoint: "polygon-mumbai", latency: "22ms" },
                      { network: "Arbitrum One", chainId: "42161", endpoint: "arb-mainnet", latency: "31ms" },
                      { network: "Arbitrum Sepolia", chainId: "421614", endpoint: "arb-sepolia", latency: "35ms" },
                      { network: "Optimism", chainId: "10", endpoint: "opt-mainnet", latency: "27ms" },
                      { network: "Base", chainId: "8453", endpoint: "base-mainnet", latency: "22ms" },
                      { network: "BSC", chainId: "56", endpoint: "bsc-mainnet", latency: "19ms" },
                    ].map((row) => (
                      <motion.tr 
                        key={row.endpoint} 
                        className="border-b border-border hover:bg-white/5"
                        whileHover={{ x: 4 }}
                      >
                        <td className="p-4 font-sans">{row.network}</td>
                        <td className="p-4 text-muted-foreground">{row.chainId}</td>
                        <td className="p-4">
                          <code className="text-primary bg-primary/10 px-2 py-1">{row.endpoint}.infra.v1</code>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400">{row.latency}</span>
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2">
                <Box className="w-6 h-6 text-primary" />
                Non-EVM Networks
              </h2>

              <div className="overflow-x-auto border border-border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-neutral-950 text-left">
                      <th className="p-4 font-mono text-sm text-primary">Network</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Endpoint</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {[
                      { network: "Solana Mainnet", endpoint: "solana-mainnet", latency: "45ms" },
                      { network: "Solana Devnet", endpoint: "solana-devnet", latency: "52ms" },
                    ].map((row) => (
                      <motion.tr 
                        key={row.endpoint} 
                        className="border-b border-border hover:bg-white/5"
                        whileHover={{ x: 4 }}
                      >
                        <td className="p-4 font-sans">{row.network}</td>
                        <td className="p-4">
                          <code className="text-primary bg-primary/10 px-2 py-1">{row.endpoint}.infra.v1</code>
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-green-400">{row.latency}</span>
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Ethereum Methods */}
          {activeSection === "eth-methods" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Standard Ethereum JSON-RPC methods for interacting with EVM-compatible blockchains.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Reading Data
              </h2>

              <ApiMethod
                method="POST"
                endpoint="eth_blockNumber"
                description="Returns the current block number."
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_blockNumber',
    params: [],
    id: 1
  })
});`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_blockNumber',
        'params': [],
        'id': 1
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x13b5e0c"
}`}
              />

              <ApiMethod
                method="POST"
                endpoint="eth_getBalance"
                description="Returns the balance of the account at the given address."
                params={[
                  { name: "address", type: "string", required: true, description: "20-byte address to check balance" },
                  { name: "blockNumber", type: "string", required: true, description: "Block number or 'latest', 'earliest', 'pending'" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08","latest"],"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: ['0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08', 'latest'],
    id: 1
  })
});`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_getBalance',
        'params': ['0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08', 'latest'],
        'id': 1
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x2b12a9f3f7e8c00"
}`}
              />

              <ApiMethod
                method="POST"
                endpoint="eth_getTransactionByHash"
                description="Returns the information about a transaction by its hash."
                params={[
                  { name: "hash", type: "string", required: true, description: "32-byte transaction hash" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x88df..."],"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_getTransactionByHash',
    params: ['0x88df...'],
    id: 1
  })
});`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_getTransactionByHash',
        'params': ['0x88df...'],
        'id': 1
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "hash": "0x88df...",
    "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08",
    "to": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    "value": "0x0",
    "gas": "0x5208",
    "gasPrice": "0x4a817c800"
  }
}`}
              />

              <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2">
                <ArrowRight className="w-6 h-6 text-primary" />
                Sending Transactions
              </h2>

              <ApiMethod
                method="POST"
                endpoint="eth_sendRawTransaction"
                description="Submits a signed transaction to the network."
                params={[
                  { name: "signedTx", type: "string", required: true, description: "The signed transaction data" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_sendRawTransaction","params":["0xf86c..."],"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_sendRawTransaction',
    params: ['0xf86c...'],
    id: 1
  })
});`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_sendRawTransaction',
        'params': ['0xf86c...'],
        'id': 1
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0xe670ec64341771606e55d6b4ca35a1a6b75ee3d5145a99d05921026d1527331"
}`}
              />
            </motion.div>
          )}

          {/* Enhanced APIs */}
          {activeSection === "enhanced-api" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                INFRA_V1 Enhanced APIs provide powerful, indexed data that goes beyond standard RPC methods. Get token balances, NFT metadata, transaction history, and more with a single call.
              </p>

              <Callout type="info" title="Pro Feature">
                Enhanced APIs are available on Pro and Enterprise plans. Upgrade your plan to access these powerful endpoints.
              </Callout>

              <h2 className="text-2xl font-bold mt-8 mb-6 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-primary" />
                Token APIs
              </h2>

              <ApiMethod
                method="POST"
                endpoint="infra_getTokenBalances"
                description="Returns all ERC-20 token balances for an address."
                params={[
                  { name: "address", type: "string", required: true, description: "Wallet address to query" },
                  { name: "pageSize", type: "number", required: false, description: "Number of results per page (default: 100)" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"infra_getTokenBalances","params":{"address":"0x742d..."},"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'infra_getTokenBalances',
    params: { address: '0x742d...' },
    id: 1
  })
});`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'infra_getTokenBalances',
        'params': {'address': '0x742d...'},
        'id': 1
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "address": "0x742d...",
    "tokenBalances": [
      {
        "contractAddress": "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "tokenBalance": "1000000000",
        "name": "Tether USD",
        "symbol": "USDT",
        "decimals": 6
      }
    ]
  }
}`}
              />

              <h2 className="text-2xl font-bold mt-12 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                NFT APIs
              </h2>

              <ApiMethod
                method="POST"
                endpoint="infra_getNFTs"
                description="Returns all NFTs owned by an address with metadata."
                params={[
                  { name: "owner", type: "string", required: true, description: "Wallet address to query" },
                  { name: "contractAddresses", type: "string[]", required: false, description: "Filter by specific NFT contracts" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"infra_getNFTs","params":{"owner":"0x742d..."},"id":1}'`,
                  javascript: `const response = await fetch('https://eth-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'infra_getNFTs',
    params: { owner: '0x742d...' },
    id: 1
  })
});`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'infra_getNFTs',
        'params': {'owner': '0x742d...'},
        'id': 1
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ownedNfts": [
      {
        "contract": { "address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D" },
        "tokenId": "1234",
        "title": "Bored Ape #1234",
        "description": "...",
        "media": { "gateway": "https://..." }
      }
    ],
    "totalCount": 5
  }
}`}
              />
            </motion.div>
          )}

          {/* Solana API */}
          {activeSection === "solana-api" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Access Solana mainnet and devnet through INFRA_V1. We support all standard Solana JSON-RPC methods.
              </p>

              <MermaidDiagram
                title="Solana Request Flow"
                chart={`flowchart LR
    A[Your App] -->|JSON-RPC| B[INFRA_V1 Edge]
    B -->|Load Balance| C[Solana RPC Pool]
    C -->|Response| B
    B -->|Response| A
    
    style B fill:#CCFF00,color:#000`}
              />

              <h2 className="text-2xl font-bold mt-8 mb-6">Common Methods</h2>

              <ApiMethod
                method="POST"
                endpoint="getBalance"
                description="Returns the balance of the account at the given address."
                params={[
                  { name: "pubkey", type: "string", required: true, description: "Base-58 encoded public key" }
                ]}
                examples={{
                  curl: `curl https://solana-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"getBalance","params":["83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"]}'`,
                  javascript: `const response = await fetch('https://solana-mainnet.infra.v1/v2/YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'getBalance',
    params: ['83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri']
  })
});`,
                  python: `import requests

response = requests.post(
    'https://solana-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'getBalance',
        'params': ['83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri']
    }
)`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "context": { "slot": 123456789 },
    "value": 1000000000
  }
}`}
              />
            </motion.div>
          )}

          {/* JavaScript SDK */}
          {activeSection === "sdk-javascript" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                The INFRA_V1 JavaScript SDK provides a simple, type-safe interface for interacting with blockchain networks.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-6">Installation</h2>

              <CodeBlock code="npm install @infra-v1/sdk" language="bash" />

              <h2 className="text-2xl font-bold mt-8 mb-6">Quick Start</h2>

              <CodeBlock
                code={`import { Infra } from '@infra-v1/sdk';

// Initialize with your API key
const infra = new Infra({
  apiKey: 'YOUR_API_KEY',
  network: 'eth-mainnet'
});

// Get current block number
const blockNumber = await infra.getBlockNumber();
console.log('Current block:', blockNumber);

// Get account balance
const balance = await infra.getBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08');
console.log('Balance:', infra.utils.formatEther(balance), 'ETH');`}
                language="javascript"
              />

              <h2 className="text-2xl font-bold mt-12 mb-6">Using with ethers.js</h2>

              <CodeBlock
                code={`import { ethers } from 'ethers';

// Use INFRA_V1 as your provider
const provider = new ethers.JsonRpcProvider(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY'
);

// Now use ethers.js as normal
const balance = await provider.getBalance('0x742d...');
const block = await provider.getBlock('latest');`}
                language="javascript"
              />

              <Callout type="success" title="Type Safety">
                The SDK includes full TypeScript definitions for all methods and responses.
              </Callout>
            </motion.div>
          )}

          {/* Python SDK */}
          {activeSection === "sdk-python" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                The INFRA_V1 Python SDK provides an intuitive interface for Python developers.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-6">Installation</h2>

              <CodeBlock code="pip install infra-v1" language="bash" />

              <h2 className="text-2xl font-bold mt-8 mb-6">Quick Start</h2>

              <CodeBlock
                code={`from infra_v1 import Infra

# Initialize with your API key
infra = Infra(
    api_key='YOUR_API_KEY',
    network='eth-mainnet'
)

# Get current block number
block_number = infra.get_block_number()
print(f'Current block: {block_number}')

# Get account balance
balance = infra.get_balance('0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08')
print(f'Balance: {infra.utils.format_ether(balance)} ETH')`}
                language="python"
              />

              <h2 className="text-2xl font-bold mt-12 mb-6">Using with web3.py</h2>

              <CodeBlock
                code={`from web3 import Web3

# Use INFRA_V1 as your provider
w3 = Web3(Web3.HTTPProvider(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY'
))

# Now use web3.py as normal
balance = w3.eth.get_balance('0x742d...')
block = w3.eth.get_block('latest')`}
                language="python"
              />
            </motion.div>
          )}

          {/* Deploy Contracts Tutorial */}
          {activeSection === "deploy-contracts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Deploy smart contracts directly from your browser using INFRA_V1's built-in Remix-style IDE with AI assistance.
              </p>

              <MermaidDiagram
                title="Contract Deployment Flow"
                chart={`flowchart LR
    A[📝 Write Code] --> B[⚙️ Compile]
    B --> C{Errors?}
    C -->|Yes| D[🤖 AI Fix]
    D --> B
    C -->|No| E[🔗 Connect Wallet]
    E --> F[🌐 Select Network]
    F --> G[🚀 Deploy]
    G --> H[✅ Verify]
    
    style A fill:#1a1a1a,stroke:#CCFF00
    style G fill:#CCFF00,color:#000
    style H fill:#22c55e,color:#fff`}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <FeatureCard 
                  icon={Bot}
                  title="AI Contract Generation"
                  description="Describe what you want in plain English and our AI generates production-ready Solidity code."
                />
                <FeatureCard 
                  icon={Zap}
                  title="Instant Compilation"
                  description="In-browser Solidity compiler with real-time error detection and AI-powered fixes."
                />
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-6">Step 1: Open the Deploy Page</h2>

              <p className="text-muted-foreground mb-4">
                Navigate to <a href="/deploy" className="text-primary hover:underline font-mono">/deploy</a> to access the Remix-style IDE.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-6">Step 2: Write Your Contract</h2>

              <CodeBlock
                code={`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedValue;
    
    event ValueChanged(uint256 newValue);
    
    function set(uint256 value) public {
        storedValue = value;
        emit ValueChanged(value);
    }
    
    function get() public view returns (uint256) {
        return storedValue;
    }
}`}
                language="solidity"
              />

              <Callout type="warning" title="Test First">
                Always deploy to a testnet first to verify your contract works as expected before deploying to mainnet.
              </Callout>
            </motion.div>
          )}

          {/* AI Copilot Tutorial */}
          {activeSection === "ai-copilot" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                INFRA_V1's AI Copilot is your blockchain development assistant. Get help with smart contracts, Web3 integrations, and debugging.
              </p>

              <MermaidDiagram
                title="AI Copilot Capabilities"
                chart={`mindmap
  root((🤖 AI Copilot))
    Smart Contracts
      Generate code
      Fix errors
      Optimize gas
      Security audit
    Web3 Development
      Integration help
      SDK usage
      Best practices
    Debugging
      Error analysis
      Transaction tracing
      Log interpretation`}
              />

              <h2 className="text-2xl font-bold mt-8 mb-6">Example Prompts</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Contract Generation", prompt: "Create an ERC-20 token with minting and burning capabilities" },
                  { title: "Code Explanation", prompt: "Explain what this modifier does and why it's important for security" },
                  { title: "Bug Fixing", prompt: "My contract is giving a 'stack too deep' error, how do I fix it?" },
                  { title: "Web3 Help", prompt: "How do I listen for Transfer events using ethers.js?" },
                ].map((item) => (
                  <motion.div 
                    key={item.title}
                    whileHover={{ scale: 1.02 }}
                    className="border border-border p-4 hover:border-primary/50 transition-colors"
                  >
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <Bot className="w-4 h-4 text-primary" />
                      {item.title}
                    </h4>
                    <p className="text-sm text-muted-foreground italic">"{item.prompt}"</p>
                  </motion.div>
                ))}
              </div>

              <Callout type="success" title="Try It Now">
                Open the <a href="/copilot" className="underline hover:text-primary">AI Copilot</a> and start building smarter.
              </Callout>
            </motion.div>
          )}

          {/* Webhooks */}
          {activeSection === "webhooks" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                Receive real-time notifications for on-chain events without polling. Webhooks deliver events directly to your server.
              </p>

              <MermaidDiagram
                title="Webhook Flow"
                chart={`sequenceDiagram
    participant Chain as Blockchain
    participant INFRA as INFRA_V1
    participant Server as Your Server
    
    Chain->>INFRA: New Block/Transaction
    INFRA->>INFRA: Match against filters
    INFRA->>Server: HTTP POST webhook
    Server-->>INFRA: 200 OK
    Note over INFRA,Server: Retry on failure with exponential backoff`}
              />

              <h2 className="text-2xl font-bold mt-8 mb-6">Webhook Types</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FeatureCard icon={Activity} title="Address Activity" description="Get notified when an address sends or receives ETH or tokens." />
                <FeatureCard icon={Hash} title="Mined Transactions" description="Receive notifications when transactions you're tracking get mined." />
                <FeatureCard icon={Sparkles} title="NFT Activity" description="Track mints, transfers, and sales for specific NFT collections." />
              </div>
            </motion.div>
          )}

          {/* Rate Limits */}
          {activeSection === "rate-limits" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl text-muted-foreground leading-relaxed">
                INFRA_V1 implements rate limiting to ensure fair usage and platform stability. Here's what you need to know.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-6">Rate Limits by Plan</h2>

              <div className="overflow-x-auto border border-border">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-neutral-950 text-left">
                      <th className="p-4 font-mono text-sm text-primary">Plan</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Requests/Second</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Monthly Requests</th>
                      <th className="p-4 font-mono text-sm text-muted-foreground">Compute Units/Day</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    <tr className="border-b border-border hover:bg-white/5">
                      <td className="p-4">Free</td>
                      <td className="p-4">300</td>
                      <td className="p-4">10,000,000</td>
                      <td className="p-4">300,000</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-white/5 bg-primary/5">
                      <td className="p-4 flex items-center gap-2">
                        Pro
                        <span className="text-xs bg-primary text-black px-1">POPULAR</span>
                      </td>
                      <td className="p-4 text-primary">3,000</td>
                      <td className="p-4 text-primary">Unlimited</td>
                      <td className="p-4 text-primary">5,000,000</td>
                    </tr>
                    <tr className="border-b border-border hover:bg-white/5">
                      <td className="p-4">Enterprise</td>
                      <td className="p-4">Custom</td>
                      <td className="p-4">Unlimited</td>
                      <td className="p-4">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h2 className="text-2xl font-bold mt-12 mb-6">Rate Limit Headers</h2>

              <CodeBlock
                code={`X-RateLimit-Limit: 300
X-RateLimit-Remaining: 297
X-RateLimit-Reset: 1640995200`}
                language="http"
              />

              <Callout type="warning" title="Handling 429 Errors">
                If you exceed your rate limit, you'll receive a 429 status code. Implement exponential backoff in your retry logic.
              </Callout>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
