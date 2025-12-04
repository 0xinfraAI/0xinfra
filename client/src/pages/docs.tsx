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
      className="border border-border bg-black p-8 my-10 overflow-x-auto"
    >
      {title && (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-sm text-primary uppercase tracking-widest">{title}</span>
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
      className="p-2 hover:bg-primary/20 transition-colors"
      data-testid="copy-button"
    >
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground hover:text-primary" />}
    </button>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-4 my-16">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="w-2 h-2 rotate-45 border border-primary/50" />
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}

function SectionDivider() {
  return <div className="h-px w-full bg-border my-12" />;
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
      className="border border-border bg-black my-8"
    >
      <div className="flex border-b border-border bg-neutral-950">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 font-mono text-sm transition-all ${
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
      <pre className="p-6 font-mono text-sm text-primary/90 overflow-x-auto whitespace-pre-wrap leading-relaxed">
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
      className="bg-black border border-border my-6 relative"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-neutral-950">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-primary" />
          <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{language}</span>
        </div>
        <CopyButton text={code} />
      </div>
      <pre className="p-6 font-mono text-sm text-primary/90 overflow-x-auto leading-relaxed">
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
      className="border-2 border-primary/50 bg-black p-8 my-12"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-black" />
          </div>
          <div>
            <h3 className="font-bold text-xl">Try It Live</h3>
            <p className="text-sm text-muted-foreground mt-1">See how fast our API responds</p>
          </div>
        </div>
        {latency && (
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-mono text-lg text-primary font-bold">{latency}ms</span>
          </div>
        )}
      </div>

      <div className="bg-neutral-950 border border-border p-6 mb-6 font-mono text-sm">
        <div className="text-muted-foreground mb-3 text-xs uppercase tracking-wider">Request</div>
        <div className="text-primary leading-relaxed">
          {`{ "method": "eth_blockNumber", "params": [], "id": 1 }`}
        </div>
      </div>

      <button
        onClick={runQuery}
        disabled={loading}
        className="w-full bg-primary text-black font-bold py-4 text-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Fetching from Ethereum...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Run Request
          </>
        )}
      </button>

      {response && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-6 bg-neutral-950 border border-primary/30 p-6 font-mono text-sm"
        >
          <div className="text-muted-foreground mb-3 text-xs uppercase tracking-wider">Response</div>
          <pre className="text-primary leading-relaxed">{response}</pre>
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
      className="border border-border mb-6"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="text-xs bg-primary text-black px-3 py-1.5 font-bold font-mono">{method}</span>
          <span className="font-mono font-bold text-primary text-lg">{endpoint}</span>
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
            <div className="p-6 border-t border-border space-y-8">
              <p className="text-lg text-muted-foreground leading-relaxed">{description}</p>

              {params && params.length > 0 && (
                <div>
                  <h4 className="font-mono text-sm font-bold mb-4 text-primary flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Parameters
                  </h4>
                  <div className="space-y-3">
                    {params.map((param) => (
                      <div key={param.name} className="p-4 bg-black/50 border border-border">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="font-mono text-primary font-bold">{param.name}</code>
                          <span className="text-xs text-muted-foreground bg-neutral-800 px-2 py-0.5">{param.type}</span>
                          {param.required && (
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5">required</span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{param.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-mono text-sm font-bold mb-4 text-primary flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Example Request
                </h4>
                <CodeTabs examples={examples} />
              </div>

              {response && (
                <div>
                  <h4 className="font-mono text-sm font-bold mb-4 text-primary flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Response
                  </h4>
                  <CodeBlock code={response} language="json" />
                </div>
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
    info: "bg-blue-500/5 border-l-4 border-blue-500 text-blue-400",
    warning: "bg-yellow-500/5 border-l-4 border-yellow-500 text-yellow-400",
    success: "bg-primary/5 border-l-4 border-primary text-primary",
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
      className={`p-6 my-10 ${styles[type]}`}
    >
      <div className="flex items-center gap-3 font-bold text-lg mb-3">
        {icons[type]}
        {title}
      </div>
      <div className="text-base text-muted-foreground leading-relaxed">{children}</div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, value, label, suffix }: { icon: any; value: string; label: string; suffix?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="border border-border p-8 bg-black text-center"
    >
      <Icon className="w-8 h-8 text-primary mx-auto mb-4" />
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-5xl font-black text-primary">{value}</span>
        {suffix && <span className="text-2xl text-muted-foreground">{suffix}</span>}
      </div>
      <p className="text-sm text-muted-foreground mt-3 font-mono uppercase tracking-wider">{label}</p>
    </motion.div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="border border-border p-8 bg-black group"
    >
      <div className="w-14 h-14 bg-primary/10 flex items-center justify-center mb-6">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-bold text-xl mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}

function NetworkBadge({ name, status, latency }: { name: string; status: "live" | "beta"; latency: string }) {
  return (
    <div className="flex items-center justify-between p-4 border border-border bg-black">
      <div className="flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${status === "live" ? "bg-green-500" : "bg-yellow-500"} animate-pulse`} />
        <span className="font-mono">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground font-mono">{latency}</span>
        <span className={`text-xs px-2 py-1 ${status === "live" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
          {status.toUpperCase()}
        </span>
      </div>
    </div>
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
        <div className="p-5 border-b border-border">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 bg-primary animate-pulse" />
            <span className="font-mono font-bold tracking-widest">INFRA_V1</span>
          </a>
        </div>

        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-border pl-10 pr-4 py-2.5 font-mono text-sm focus:outline-none focus:border-primary transition-colors"
              data-testid="docs-search"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {categories.map((category) => {
            const categorySections = filteredSections.filter((s) => s.category === category);
            if (categorySections.length === 0) return null;

            return (
              <div key={category} className="mb-6">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider mb-3 hover:text-foreground transition-colors"
                >
                  {category}
                  <ChevronDown className={`w-3 h-3 transition-transform ${expandedCategories[category] ? "" : "-rotate-90"}`} />
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
                          className={`w-full flex items-center gap-3 px-4 py-2.5 font-mono text-sm transition-all ${
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

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">All Systems Operational</span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>v1.0.4</span>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary flex items-center gap-1">
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-72">
        <header className="border-b border-border px-12 py-8 bg-background sticky top-0 z-30">
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm mb-3">
            <a href="/docs" className="hover:text-primary transition-colors">Documentation</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{sections.find((s) => s.id === activeSection)?.title}</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight">
            {sections.find((s) => s.id === activeSection)?.title}
          </h1>
        </header>

        <div className="px-12 py-12 max-w-4xl pb-32">
          {/* Overview */}
          {activeSection === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Welcome to INFRA_V1 — your gateway to blockchain infrastructure. 
                We make it simple to connect to any blockchain network with a single API.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Whether you're building a DeFi protocol, an NFT marketplace, or a Web3 game, 
                our infrastructure handles the complexity so you can focus on what matters: shipping great products.
              </p>

              <Divider />

              {/* Stats */}
              <div>
                <h2 className="text-2xl font-bold mb-8">By the Numbers</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Globe} value="80" suffix="+" label="Networks" />
                  <StatCard icon={Activity} value="99.99" suffix="%" label="Uptime" />
                  <StatCard icon={Zap} value="<50" suffix="ms" label="Latency" />
                  <StatCard icon={Users} value="10K" suffix="+" label="Developers" />
                </div>
              </div>

              <Divider />

              {/* What We Offer */}
              <div>
                <h2 className="text-2xl font-bold mb-4">What We Offer</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  INFRA_V1 isn't just another node provider. We've built a complete platform 
                  for blockchain developers, combining reliable infrastructure with powerful tools.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FeatureCard 
                    icon={Server}
                    title="Multi-Chain RPC"
                    description="Connect to Ethereum, Polygon, Arbitrum, Solana, and 80+ other networks through a single, unified API. No more juggling multiple providers."
                  />
                  <FeatureCard 
                    icon={Bot}
                    title="AI Development Tools"
                    description="Generate smart contracts from plain English, get instant debugging help, and write better code with our AI Copilot."
                  />
                  <FeatureCard 
                    icon={Rocket}
                    title="In-Browser IDE"
                    description="Write, test, and deploy smart contracts without leaving your browser. Our Remix-style editor includes everything you need."
                  />
                  <FeatureCard 
                    icon={Database}
                    title="Enhanced APIs"
                    description="Go beyond standard RPC with indexed data for tokens, NFTs, and transaction history. Get what you need in a single call."
                  />
                </div>
              </div>

              <Divider />

              {/* Network Status */}
              <div>
                <h2 className="text-2xl font-bold mb-4">Live Network Status</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Real-time status of our most popular networks. All nodes are monitored 24/7 
                  with automatic failover to ensure maximum uptime.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <NetworkBadge name="Ethereum Mainnet" status="live" latency="23ms" />
                  <NetworkBadge name="Polygon" status="live" latency="18ms" />
                  <NetworkBadge name="Arbitrum One" status="live" latency="31ms" />
                  <NetworkBadge name="Optimism" status="live" latency="27ms" />
                  <NetworkBadge name="Base" status="live" latency="22ms" />
                  <NetworkBadge name="Solana" status="live" latency="45ms" />
                </div>
              </div>

              <Divider />

              <div className="text-center py-8">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Create your first API key and make your first request in under 5 minutes.
                </p>
                <button 
                  onClick={() => setActiveSection("quickstart")}
                  className="bg-primary text-black font-bold px-8 py-4 text-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-3"
                >
                  Start Building
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Quick Start */}
          {activeSection === "quickstart" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Let's get you up and running. In just a few minutes, you'll make your first 
                blockchain API call and see real data flowing.
              </p>

              <SectionDivider />

              {/* Step 1 */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center">
                    <span className="font-mono font-bold text-black text-xl">1</span>
                  </div>
                  <h2 className="text-2xl font-bold">Get Your API Key</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Head to your <a href="/dashboard" className="text-primary hover:underline">Dashboard</a> and 
                  create a new API key. Each key is free and gives you 10 million requests per month — 
                  more than enough to build and test your application.
                </p>

                <p className="text-muted-foreground leading-relaxed">
                  Your API key looks something like this: <code className="bg-black px-3 py-1 text-primary border border-border">infra_abc123xyz789...</code>
                </p>
              </div>

              <SectionDivider />

              {/* Step 2 */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center">
                    <span className="font-mono font-bold text-black text-xl">2</span>
                  </div>
                  <h2 className="text-2xl font-bold">Make Your First Request</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Let's fetch the current Ethereum block number. This is the simplest possible request — 
                  if this works, you're ready to build anything.
                </p>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  Replace <code className="bg-black px-2 py-1 text-primary border border-border">YOUR_API_KEY</code> with 
                  the key you just created.
                </p>

                <CodeTabs
                  examples={{
                    curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`,
                    javascript: `const response = await fetch(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    })
  }
);

const data = await response.json();

// Convert hex to decimal
const blockNumber = parseInt(data.result, 16);
console.log('Current block:', blockNumber);`,
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

# Convert hex to decimal
block_number = int(data['result'], 16)
print(f'Current block: {block_number}')`
                  }}
                />
              </div>

              <SectionDivider />

              {/* Step 3 - Try It */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary flex items-center justify-center">
                    <span className="font-mono font-bold text-black text-xl">3</span>
                  </div>
                  <h2 className="text-2xl font-bold">See It in Action</h2>
                </div>
                
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Don't just take our word for it — try it yourself right here. 
                  Click the button below to make a live request to Ethereum.
                </p>

                <LivePlayground />
              </div>

              <Callout type="success" title="You're All Set!">
                If you saw a response above, congratulations — you just made your first blockchain API call! 
                Now you can use any of the hundreds of methods we support. Check out the 
                <button onClick={() => setActiveSection("eth-methods")} className="underline hover:text-primary mx-1">API Reference</button> 
                to see what's possible.
              </Callout>
            </motion.div>
          )}

          {/* Authentication */}
          {activeSection === "authentication" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Every request to INFRA_V1 needs an API key. This keeps your usage tracked, 
                your rate limits respected, and your data secure.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Think of your API key as your identity on our platform. It's how we know 
                which account to bill, which features you have access to, and how to route 
                your requests for optimal performance.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold">How It Works</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                When you make a request, your API key travels through our system like this:
              </p>

              <MermaidDiagram
                title="Authentication Flow"
                chart={`sequenceDiagram
    participant You as Your App
    participant Edge as INFRA_V1
    participant Chain as Blockchain
    
    You->>Edge: Request with API Key
    Edge->>Edge: Validate & Check Limits
    Edge->>Chain: Forward Request
    Chain-->>Edge: Response
    Edge-->>You: Return Data`}
              />

              <p className="text-muted-foreground leading-relaxed">
                The whole process takes milliseconds. Your key is validated, your rate limits 
                are checked, and your request is forwarded to the appropriate blockchain node.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Using Your API Key</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Include your API key directly in the endpoint URL. It's the simplest approach 
                and works everywhere — from cURL to your favorite programming language.
              </p>

              <CodeBlock
                code={`https://{network}.infra.v1/v2/{YOUR_API_KEY}`}
                language="url"
              />

              <p className="text-muted-foreground leading-relaxed">
                For example, to connect to Ethereum mainnet:
              </p>

              <CodeBlock
                code={`https://eth-mainnet.infra.v1/v2/infra_abc123xyz789`}
                language="url"
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Free vs Pro Keys</h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We offer two tiers of API keys, designed for different stages of your project.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-border p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Key className="w-6 h-6 text-green-400" />
                    <h3 className="font-bold text-xl">Free Tier</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Perfect for development, testing, and small projects. No credit card required.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>300 requests per second</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>10 million requests per month</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>All standard RPC methods</span>
                    </li>
                  </ul>
                </div>

                <div className="border-2 border-primary p-8 bg-primary/5 relative">
                  <div className="absolute -top-3 right-4 bg-primary text-black text-xs font-bold px-3 py-1">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h3 className="font-bold text-xl">Pro Tier</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    For production applications that need speed, reliability, and advanced features.
                  </p>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>3,000 requests per second</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Unlimited requests</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>Enhanced APIs (tokens, NFTs)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span>WebSocket subscriptions</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Callout type="warning" title="Keep Your Keys Secret">
                Never commit API keys to public repositories or expose them in client-side code. 
                Use environment variables and server-side proxies for production applications. 
                If a key is compromised, regenerate it immediately from your dashboard.
              </Callout>
            </motion.div>
          )}

          {/* Architecture */}
          {activeSection === "architecture" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Behind the simple API is a globally distributed infrastructure designed for 
                speed, reliability, and scale. Here's how it all works.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">The Big Picture</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                When you make a request, it travels through multiple layers optimized for 
                performance. Each layer adds value — caching, load balancing, failover — 
                without adding latency.
              </p>

              <MermaidDiagram
                title="System Architecture"
                chart={`flowchart TB
    subgraph Clients["Your Applications"]
        A[dApps]
        B[Backends]
        C[Wallets]
    end
    
    subgraph Edge["Global Edge Network"]
        D[Load Balancer]
        E[Cache Layer]
        F[Rate Limiter]
    end
    
    subgraph Nodes["Node Infrastructure"]
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
    F --> I`}
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Why This Matters</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Each component of our infrastructure serves a specific purpose. Together, 
                they deliver the reliability and performance your applications need.
              </p>

              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Globe className="w-8 h-8 text-primary" />
                    <h3 className="font-bold text-xl">Global Edge Network</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    With 50+ points of presence worldwide, your requests are routed to the 
                    nearest edge location. A user in Tokyo gets the same low latency as a 
                    user in New York. No matter where your users are, they get fast responses.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Database className="w-8 h-8 text-primary" />
                    <h3 className="font-bold text-xl">Intelligent Caching</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Many blockchain queries return the same data — block numbers, token 
                    metadata, historical transactions. We cache these responses at the edge, 
                    reducing latency by up to 10x and saving you compute units.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                    <h3 className="font-bold text-xl">Automatic Failover</h3>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    We run multiple node providers for every network we support. If one 
                    goes down, we automatically route to another. You never see the failure — 
                    just consistent, reliable responses.
                  </p>
                </div>
              </div>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Request Flow</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Here's exactly what happens when you make a request. The entire flow 
                typically completes in under 50 milliseconds.
              </p>

              <MermaidDiagram
                title="Request Lifecycle"
                chart={`sequenceDiagram
    participant App as Your App
    participant Edge as Edge PoP
    participant Cache as Cache
    participant Node as Blockchain
    
    App->>Edge: RPC Request
    Edge->>Edge: Authenticate
    Edge->>Cache: Check Cache
    alt Cache Hit
        Cache-->>Edge: Cached Data
        Edge-->>App: Response (~10ms)
    else Cache Miss
        Edge->>Node: Forward Request
        Node-->>Edge: Fresh Data
        Edge->>Cache: Store
        Edge-->>App: Response (~50ms)
    end`}
              />
            </motion.div>
          )}

          {/* Supported Networks */}
          {activeSection === "networks" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                One API, 80+ networks. Whether you're building on Ethereum, experimenting 
                with Layer 2s, or exploring Solana, we've got you covered.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">EVM Networks</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                All EVM-compatible chains share the same API interface. If you know how to 
                call Ethereum, you know how to call Polygon, Arbitrum, and every other EVM chain.
              </p>

              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-border">
                      <th className="p-5 text-left font-mono text-sm text-primary">Network</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Chain ID</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Endpoint</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    {[
                      { network: "Ethereum Mainnet", chainId: "1", endpoint: "eth-mainnet", latency: "23ms" },
                      { network: "Ethereum Sepolia", chainId: "11155111", endpoint: "eth-sepolia", latency: "28ms" },
                      { network: "Polygon", chainId: "137", endpoint: "polygon-mainnet", latency: "18ms" },
                      { network: "Arbitrum One", chainId: "42161", endpoint: "arb-mainnet", latency: "31ms" },
                      { network: "Optimism", chainId: "10", endpoint: "opt-mainnet", latency: "27ms" },
                      { network: "Base", chainId: "8453", endpoint: "base-mainnet", latency: "22ms" },
                      { network: "BSC", chainId: "56", endpoint: "bsc-mainnet", latency: "19ms" },
                    ].map((row, i) => (
                      <tr key={row.endpoint} className={`border-b border-border ${i % 2 === 0 ? 'bg-black' : 'bg-neutral-950/50'}`}>
                        <td className="p-5 font-sans">{row.network}</td>
                        <td className="p-5 text-muted-foreground">{row.chainId}</td>
                        <td className="p-5">
                          <code className="text-primary">{row.endpoint}.infra.v1</code>
                        </td>
                        <td className="p-5">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-green-400">{row.latency}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Non-EVM Networks</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We also support networks with their own unique architectures. The API differs 
                slightly, but our infrastructure provides the same reliability and performance.
              </p>

              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-border">
                      <th className="p-5 text-left font-mono text-sm text-primary">Network</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Endpoint</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Latency</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    <tr className="border-b border-border bg-black">
                      <td className="p-5 font-sans">Solana Mainnet</td>
                      <td className="p-5"><code className="text-primary">solana-mainnet.infra.v1</code></td>
                      <td className="p-5">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-green-400">45ms</span>
                        </span>
                      </td>
                    </tr>
                    <tr className="bg-neutral-950/50">
                      <td className="p-5 font-sans">Solana Devnet</td>
                      <td className="p-5"><code className="text-primary">solana-devnet.infra.v1</code></td>
                      <td className="p-5">
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-green-400">52ms</span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <Callout type="info" title="Need a network we don't support?">
                We're constantly adding new networks. Drop us a line and let us know 
                what you need — popular requests get prioritized.
              </Callout>
            </motion.div>
          )}

          {/* Ethereum Methods */}
          {activeSection === "eth-methods" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                These are the standard JSON-RPC methods for Ethereum and all EVM-compatible chains. 
                If you've used Web3 before, these will feel familiar.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                Click on any method below to see detailed documentation with examples 
                in multiple languages.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-6">Reading Blockchain Data</h2>

              <p className="text-muted-foreground leading-relaxed mb-8">
                These methods let you query the blockchain without making any changes. 
                They're safe to call as often as you need.
              </p>

              <ApiMethod
                method="POST"
                endpoint="eth_blockNumber"
                description="Returns the number of the most recent block on the chain. This is often the first method developers call to verify their connection is working."
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'`,
                  javascript: `const response = await fetch(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1
    })
  }
);

const { result } = await response.json();
console.log('Block:', parseInt(result, 16));`,
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

result = response.json()['result']
print(f"Block: {int(result, 16)}")`
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
                description="Returns the ETH balance of any address. The result is in wei (1 ETH = 10^18 wei), so you'll typically want to convert it to a human-readable format."
                params={[
                  { name: "address", type: "string", required: true, description: "The wallet address to check (20 bytes, hex-encoded with 0x prefix)" },
                  { name: "block", type: "string", required: true, description: "Block number or 'latest', 'earliest', 'pending'" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08","latest"],
    "id":1
  }'`,
                  javascript: `const response = await fetch(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [
        '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08',
        'latest'
      ],
      id: 1
    })
  }
);

const { result } = await response.json();
const balanceInEth = parseInt(result, 16) / 1e18;
console.log(\`Balance: \${balanceInEth} ETH\`);`,
                  python: `import requests

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_getBalance',
        'params': [
            '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08',
            'latest'
        ],
        'id': 1
    }
)

result = response.json()['result']
balance_eth = int(result, 16) / 1e18
print(f"Balance: {balance_eth} ETH")`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x2b12a9f3f7e8c00"
}`}
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-6">Sending Transactions</h2>

              <p className="text-muted-foreground leading-relaxed mb-8">
                These methods modify blockchain state and require a signed transaction. 
                You'll need a wallet with funds to pay for gas.
              </p>

              <ApiMethod
                method="POST"
                endpoint="eth_sendRawTransaction"
                description="Broadcasts a signed transaction to the network. The transaction must be signed offline before sending. Returns the transaction hash if successful."
                params={[
                  { name: "signedTx", type: "string", required: true, description: "The signed transaction data (hex-encoded with 0x prefix)" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_sendRawTransaction",
    "params":["0xf86c..."],
    "id":1
  }'`,
                  javascript: `// First, sign your transaction with ethers.js or similar
const signedTx = await wallet.signTransaction(tx);

const response = await fetch(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signedTx],
      id: 1
    })
  }
);

const { result: txHash } = await response.json();
console.log('Transaction sent:', txHash);`,
                  python: `import requests

# First, sign your transaction with web3.py
signed_tx = w3.eth.account.sign_transaction(tx, private_key)

response = requests.post(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'method': 'eth_sendRawTransaction',
        'params': [signed_tx.rawTransaction.hex()],
        'id': 1
    }
)

tx_hash = response.json()['result']
print(f"Transaction sent: {tx_hash}")`
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
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Standard RPC methods are powerful, but sometimes you need more. Our Enhanced APIs 
                give you indexed, queryable data that would take dozens of RPC calls to assemble yourself.
              </p>

              <Callout type="info" title="Pro Feature">
                Enhanced APIs are available on Pro and Enterprise plans. They're designed for 
                production applications that need rich, indexed blockchain data without the 
                complexity of running your own indexer.
              </Callout>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Token Balances</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Get all ERC-20 token balances for a wallet in a single call. No more looping 
                through contract addresses or missing tokens you didn't know about.
              </p>

              <ApiMethod
                method="POST"
                endpoint="infra_getTokenBalances"
                description="Returns a complete list of all ERC-20 tokens owned by an address, including metadata like symbol, name, and decimals. This replaces what would otherwise be hundreds of individual balance calls."
                params={[
                  { name: "address", type: "string", required: true, description: "The wallet address to query" },
                  { name: "pageSize", type: "number", required: false, description: "Number of results per page (default: 100, max: 1000)" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "method":"infra_getTokenBalances",
    "params":{"address":"0x742d..."},
    "id":1
  }'`,
                  javascript: `const response = await fetch(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'infra_getTokenBalances',
      params: { address: '0x742d...' },
      id: 1
    })
  }
);

const { result } = await response.json();

result.tokenBalances.forEach(token => {
  console.log(\`\${token.symbol}: \${token.tokenBalance}\`);
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
)

tokens = response.json()['result']['tokenBalances']

for token in tokens:
    print(f"{token['symbol']}: {token['tokenBalance']}")`
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
      },
      {
        "contractAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "tokenBalance": "5000000000",
        "name": "USD Coin",
        "symbol": "USDC",
        "decimals": 6
      }
    ]
  }
}`}
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">NFT Data</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Query NFT ownership, metadata, and collection data. Perfect for building 
                portfolios, marketplaces, or any application that works with digital collectibles.
              </p>

              <ApiMethod
                method="POST"
                endpoint="infra_getNFTs"
                description="Returns all NFTs owned by an address, complete with metadata, images, and collection information. Supports filtering by specific collections."
                params={[
                  { name: "owner", type: "string", required: true, description: "The wallet address to query" },
                  { name: "contractAddresses", type: "string[]", required: false, description: "Optional array of NFT contract addresses to filter by" }
                ]}
                examples={{
                  curl: `curl https://eth-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "method":"infra_getNFTs",
    "params":{"owner":"0x742d..."},
    "id":1
  }'`,
                  javascript: `const response = await fetch(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'infra_getNFTs',
      params: { owner: '0x742d...' },
      id: 1
    })
  }
);

const { result } = await response.json();

console.log(\`Total NFTs: \${result.totalCount}\`);
result.ownedNfts.forEach(nft => {
  console.log(\`- \${nft.title}\`);
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
)

result = response.json()['result']

print(f"Total NFTs: {result['totalCount']}")
for nft in result['ownedNfts']:
    print(f"- {nft['title']}")`
                }}
                response={`{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "ownedNfts": [
      {
        "contract": {
          "address": "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
          "name": "Bored Ape Yacht Club"
        },
        "tokenId": "1234",
        "title": "Bored Ape #1234",
        "description": "The Bored Ape Yacht Club...",
        "media": {
          "gateway": "https://ipfs.io/ipfs/..."
        }
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
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Solana uses a different architecture than Ethereum, but our infrastructure 
                provides the same reliability and performance you expect.
              </p>

              <p className="text-lg text-muted-foreground leading-relaxed">
                We support all standard Solana JSON-RPC methods. The examples below show 
                the most common operations.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-6">Common Methods</h2>

              <ApiMethod
                method="POST"
                endpoint="getBalance"
                description="Returns the balance of a Solana account in lamports. 1 SOL = 1 billion lamports."
                params={[
                  { name: "pubkey", type: "string", required: true, description: "Base-58 encoded public key of the account to query" }
                ]}
                examples={{
                  curl: `curl https://solana-mainnet.infra.v1/v2/YOUR_API_KEY \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"getBalance",
    "params":["83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri"]
  }'`,
                  javascript: `const response = await fetch(
  'https://solana-mainnet.infra.v1/v2/YOUR_API_KEY',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: ['83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri']
    })
  }
);

const { result } = await response.json();
const balanceInSol = result.value / 1e9;
console.log(\`Balance: \${balanceInSol} SOL\`);`,
                  python: `import requests

response = requests.post(
    'https://solana-mainnet.infra.v1/v2/YOUR_API_KEY',
    json={
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'getBalance',
        'params': ['83astBRguLMdt2h5U1Tpdq5tjFoJ6noeGwaY3mDLVcri']
    }
)

result = response.json()['result']
balance_sol = result['value'] / 1e9
print(f"Balance: {balance_sol} SOL")`
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
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Our JavaScript SDK makes working with INFRA_V1 even easier. 
                It handles the low-level details so you can focus on building.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-6">Installation</h2>

              <CodeBlock code="npm install @infra-v1/sdk" language="bash" />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Import the SDK, initialize it with your API key, and start making calls. 
                It's that simple.
              </p>

              <CodeBlock
                code={`import { Infra } from '@infra-v1/sdk';

// Initialize with your API key
const infra = new Infra({
  apiKey: 'YOUR_API_KEY',
  network: 'eth-mainnet'
});

// Get the current block number
const blockNumber = await infra.getBlockNumber();
console.log('Current block:', blockNumber);

// Check an account balance
const balance = await infra.getBalance(
  '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08'
);
console.log('Balance:', infra.utils.formatEther(balance), 'ETH');`}
                language="javascript"
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Using with ethers.js</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Already using ethers.js? You can use INFRA_V1 as your provider without 
                changing any of your existing code.
              </p>

              <CodeBlock
                code={`import { ethers } from 'ethers';

// Just swap in our URL as your provider
const provider = new ethers.JsonRpcProvider(
  'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY'
);

// All your existing ethers.js code works unchanged
const balance = await provider.getBalance('0x742d...');
const block = await provider.getBlock('latest');
const network = await provider.getNetwork();`}
                language="javascript"
              />

              <Callout type="success" title="Full TypeScript Support">
                The SDK includes complete TypeScript definitions for all methods 
                and responses. Your IDE will autocomplete everything.
              </Callout>
            </motion.div>
          )}

          {/* Python SDK */}
          {activeSection === "sdk-python" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Python developers get first-class support with our official SDK. 
                It works great with web3.py and standalone.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-6">Installation</h2>

              <CodeBlock code="pip install infra-v1" language="bash" />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>

              <CodeBlock
                code={`from infra_v1 import Infra

# Initialize with your API key
infra = Infra(
    api_key='YOUR_API_KEY',
    network='eth-mainnet'
)

# Get the current block number
block_number = infra.get_block_number()
print(f'Current block: {block_number}')

# Check an account balance
balance = infra.get_balance(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD08'
)
print(f'Balance: {infra.utils.format_ether(balance)} ETH')`}
                language="python"
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Using with web3.py</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                If you're already using web3.py, you can use INFRA_V1 as your provider 
                with just one line change.
              </p>

              <CodeBlock
                code={`from web3 import Web3

# Use INFRA_V1 as your HTTP provider
w3 = Web3(Web3.HTTPProvider(
    'https://eth-mainnet.infra.v1/v2/YOUR_API_KEY'
))

# All your existing web3.py code works unchanged
balance = w3.eth.get_balance('0x742d...')
block = w3.eth.get_block('latest')
is_connected = w3.is_connected()`}
                language="python"
              />
            </motion.div>
          )}

          {/* Deploy Contracts Tutorial */}
          {activeSection === "deploy-contracts" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Deploy smart contracts right from your browser. Our built-in IDE includes 
                everything you need — a code editor, compiler, and one-click deployment.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">How It Works</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                The deployment flow is straightforward: write your code, compile it, 
                connect your wallet, and deploy. If you hit any errors, our AI can help fix them.
              </p>

              <MermaidDiagram
                title="Deployment Flow"
                chart={`flowchart LR
    A[Write Code] --> B[Compile]
    B --> C{Errors?}
    C -->|Yes| D[AI Fix]
    D --> B
    C -->|No| E[Deploy]
    E --> F[Verify]`}
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Open the <a href="/deploy" className="text-primary hover:underline">Deploy page</a> to 
                access the IDE. You'll see a code editor on the left and tools on the right.
              </p>

              <p className="text-muted-foreground leading-relaxed mb-8">
                You can start with a simple contract like this one:
              </p>

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

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">AI-Powered Generation</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Don't want to write code from scratch? Just describe what you want in plain 
                English and our AI will generate the contract for you.
              </p>

              <p className="text-muted-foreground leading-relaxed">
                Try prompts like "Create a token with 1 million supply" or "Make a simple 
                NFT contract with minting". The AI handles the Solidity syntax and best practices.
              </p>

              <Callout type="warning" title="Test Before Mainnet">
                Always deploy to a testnet first (like Sepolia) to verify your contract works 
                correctly. Testnet deployments are free and let you catch issues before 
                spending real money on gas.
              </Callout>
            </motion.div>
          )}

          {/* AI Copilot Tutorial */}
          {activeSection === "ai-copilot" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Meet your AI pair programmer for blockchain development. The Copilot 
                understands Solidity, Web3, and the quirks of decentralized systems.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">What Can It Do?</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Think of it as having a senior blockchain developer on call 24/7. 
                Ask it anything from basic syntax questions to complex architectural decisions.
              </p>

              <MermaidDiagram
                title="Copilot Capabilities"
                chart={`mindmap
  root((AI Copilot))
    Smart Contracts
      Write new code
      Fix errors
      Optimize gas
      Security audit
    Web3 Development
      SDK help
      Best practices
      Integration tips
    Debugging
      Error analysis
      Transaction trace
      Log interpretation`}
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Example Conversations</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Here are some prompts that work well:
              </p>

              <div className="space-y-4">
                <div className="border border-border p-6">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Contract Generation
                  </h4>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "Create an ERC-20 token with a fixed supply of 10 million tokens. 
                    Include burn functionality and an owner who can pause transfers."
                  </p>
                </div>

                <div className="border border-border p-6">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Debugging Help
                  </h4>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "I'm getting a 'stack too deep' error in my contract. Here's the code... 
                    How can I refactor it to fix this?"
                  </p>
                </div>

                <div className="border border-border p-6">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Bot className="w-5 h-5 text-primary" />
                    Web3 Integration
                  </h4>
                  <p className="text-muted-foreground italic leading-relaxed">
                    "How do I listen for Transfer events on an ERC-20 contract using 
                    ethers.js? I want to update my UI in real-time."
                  </p>
                </div>
              </div>

              <Callout type="success" title="Try It Now">
                Open the <a href="/copilot" className="underline hover:text-primary">AI Copilot</a> and 
                start a conversation. It learns your context as you chat, so the more you 
                share, the better its suggestions become.
              </Callout>
            </motion.div>
          )}

          {/* Webhooks */}
          {activeSection === "webhooks" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Stop polling. Webhooks push blockchain events to your server the moment 
                they happen, so your app stays in sync without constant API calls.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">How Webhooks Work</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                You tell us what events you care about — wallet activity, specific 
                transactions, NFT sales — and we'll send an HTTP POST to your endpoint 
                whenever that event occurs.
              </p>

              <MermaidDiagram
                title="Webhook Flow"
                chart={`sequenceDiagram
    participant Chain as Blockchain
    participant INFRA as INFRA_V1
    participant You as Your Server
    
    Chain->>INFRA: New Transaction
    INFRA->>INFRA: Match Filters
    INFRA->>You: POST webhook
    You-->>INFRA: 200 OK
    Note over INFRA,You: Retry with backoff on failure`}
              />

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Available Event Types</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We support a variety of event types to cover common use cases:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FeatureCard 
                  icon={Activity}
                  title="Address Activity"
                  description="Get notified when any address you're watching sends or receives ETH or tokens."
                />
                <FeatureCard 
                  icon={Hash}
                  title="Transaction Mining"
                  description="Know immediately when a specific transaction gets confirmed on-chain."
                />
                <FeatureCard 
                  icon={Sparkles}
                  title="NFT Events"
                  description="Track mints, transfers, and sales for any NFT collection."
                />
              </div>
            </motion.div>
          )}

          {/* Rate Limits */}
          {activeSection === "rate-limits" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-2xl text-muted-foreground leading-relaxed">
                Rate limits ensure fair usage and keep the platform fast for everyone. 
                Here's what you need to know to stay within your limits.
              </p>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Limits by Plan</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Higher tiers get higher limits. If you're consistently hitting your ceiling, 
                it might be time to upgrade.
              </p>

              <div className="border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-neutral-950 border-b border-border">
                      <th className="p-5 text-left font-mono text-sm text-primary">Plan</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Req/Second</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Monthly</th>
                      <th className="p-5 text-left font-mono text-sm text-muted-foreground">Compute/Day</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-sm">
                    <tr className="border-b border-border bg-black">
                      <td className="p-5 font-sans">Free</td>
                      <td className="p-5">300</td>
                      <td className="p-5">10M</td>
                      <td className="p-5">300K</td>
                    </tr>
                    <tr className="border-b border-border bg-primary/5">
                      <td className="p-5 font-sans flex items-center gap-3">
                        Pro
                        <span className="text-xs bg-primary text-black px-2 py-0.5">POPULAR</span>
                      </td>
                      <td className="p-5 text-primary font-bold">3,000</td>
                      <td className="p-5 text-primary font-bold">Unlimited</td>
                      <td className="p-5 text-primary font-bold">5M</td>
                    </tr>
                    <tr className="bg-black">
                      <td className="p-5 font-sans">Enterprise</td>
                      <td className="p-5">Custom</td>
                      <td className="p-5">Unlimited</td>
                      <td className="p-5">Custom</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SectionDivider />

              <h2 className="text-2xl font-bold mb-4">Reading Rate Limit Headers</h2>

              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Every response includes headers that tell you your current rate limit status. 
                Use these to implement smart backoff in your application.
              </p>

              <CodeBlock
                code={`X-RateLimit-Limit: 300
X-RateLimit-Remaining: 297
X-RateLimit-Reset: 1640995200`}
                language="http"
              />

              <p className="text-muted-foreground leading-relaxed">
                <strong>Limit</strong> is your maximum requests per second. 
                <strong> Remaining</strong> is how many you have left in the current window. 
                <strong> Reset</strong> is when the window resets (Unix timestamp).
              </p>

              <Callout type="warning" title="Handling 429 Errors">
                If you exceed your limit, you'll get a 429 Too Many Requests response. 
                When this happens, wait a second and try again. For production apps, 
                implement exponential backoff: wait 1s, then 2s, then 4s, etc.
              </Callout>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
