import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bot,
  Send,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Zap,
  ChevronDown,
  Trash2,
  Globe,
  Code2,
  FileCode,
  Database,
  Shield,
  Wallet,
  ArrowRight,
  Rocket,
} from "lucide-react";

const NETWORKS = [
  { id: "eth-mainnet", name: "Ethereum", icon: "⟠", category: "mainnet" },
  { id: "polygon-mainnet", name: "Polygon", icon: "⬡", category: "mainnet" },
  { id: "arb-mainnet", name: "Arbitrum", icon: "◈", category: "mainnet" },
  { id: "opt-mainnet", name: "Optimism", icon: "◎", category: "mainnet" },
  { id: "base-mainnet", name: "Base", icon: "◉", category: "mainnet" },
  { id: "bsc-mainnet", name: "BSC", icon: "◆", category: "mainnet" },
  { id: "solana-mainnet", name: "Solana", icon: "◐", category: "mainnet" },
  { id: "eth-sepolia", name: "Sepolia", icon: "⟠", category: "testnet" },
  { id: "bsc-testnet", name: "BSC Testnet", icon: "◆", category: "testnet" },
  { id: "solana-devnet", name: "Solana Devnet", icon: "◐", category: "testnet" },
];

const TOPIC_CATEGORIES = [
  {
    title: "RPC & Connections",
    icon: Globe,
    topics: [
      "How do I connect to Ethereum using INFRA_V1?",
      "What's the difference between HTTP and WebSocket?",
      "How to handle RPC rate limits?",
      "Best practices for connection pooling",
    ],
  },
  {
    title: "Smart Contracts",
    icon: FileCode,
    topics: [
      "How to call a smart contract method?",
      "Reading vs writing to contracts",
      "Estimating gas for transactions",
      "ABI encoding and decoding",
    ],
  },
  {
    title: "Web3 Development",
    icon: Code2,
    topics: [
      "Setting up ethers.js with INFRA_V1",
      "Web3.py quickstart guide",
      "Listening to blockchain events",
      "Handling transaction confirmations",
    ],
  },
  {
    title: "DeFi & Tokens",
    icon: Wallet,
    topics: [
      "How to get token balances?",
      "Fetching ERC-20 token info",
      "Querying Uniswap prices",
      "NFT metadata retrieval",
    ],
  },
  {
    title: "Security",
    icon: Shield,
    topics: [
      "API key security best practices",
      "IP whitelisting setup",
      "Rate limiting strategies",
      "Protecting sensitive endpoints",
    ],
  },
  {
    title: "Data & Analytics",
    icon: Database,
    topics: [
      "Fetching historical blocks",
      "Transaction receipt analysis",
      "Log filtering and parsing",
      "Block timestamp queries",
    ],
  },
];

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-3 group">
      <div className="bg-black border border-primary/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-primary/20">
          <span className="font-mono text-xs text-primary/70 uppercase">{language}</span>
          <button
            onClick={copyCode}
            className="p-1.5 hover:bg-primary/20 transition-colors"
            data-testid="copy-code-block"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-green-400 font-mono">{code}</code>
        </pre>
      </div>
    </div>
  );
}

function parseMessageContent(content: string) {
  const parts: Array<{ type: "text" | "code"; content: string; language?: string }> = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: "code",
      content: match[2].trim(),
      language: match[1] || "code",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: "text", content: content.slice(lastIndex) });
  }

  return parts;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const parts = parseMessageContent(message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-primary text-black"
            : "bg-neutral-900 border border-border text-white"
        } p-5`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
            <Bot className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-primary uppercase tracking-wider">INFRA_V1 Copilot</span>
          </div>
        )}
        <div className="font-mono text-sm leading-relaxed">
          {parts.map((part, i) =>
            part.type === "code" ? (
              <CodeBlock key={i} code={part.content} language={part.language || "code"} />
            ) : (
              <span key={i} className="whitespace-pre-wrap">{part.content}</span>
            )
          )}
        </div>
        <div className={`text-xs mt-3 ${isUser ? "text-black/50" : "text-muted-foreground"}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState("eth-mainnet");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const context = {
    selectedNetwork,
    mode: "quick" as const,
  };

  const { data: suggestions } = useQuery({
    queryKey: ["/api/copilot/suggestions", context],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("network", selectedNetwork);
      const res = await fetch(`/api/copilot/suggestions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json() as Promise<{ suggestions: string[] }>;
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      setErrorMessage(null);
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          context,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response from AI Copilot");
      }
      return res.json() as Promise<{ response: string }>;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setErrorMessage(null);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message || "Something went wrong. Please try again.");
      console.error("Copilot chat error:", error);
    },
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setShowTopics(false);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  const handleTopicClick = (topic: string) => {
    setInput(topic);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([]);
    setShowTopics(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const selectedNetworkInfo = NETWORKS.find((n) => n.id === selectedNetwork);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background text-foreground pt-16">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-neutral-950 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-black text-xl uppercase tracking-tight">AI Copilot</h1>
                  <p className="text-xs text-muted-foreground font-mono">Blockchain Dev Assistant</p>
                </div>
              </div>

              {/* Deploy Contract Button */}
              <a
                href="/deploy"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-black font-bold hover:bg-green-400 transition-colors mb-4"
                data-testid="deploy-contract-link"
              >
                <Rocket className="w-5 h-5" />
                Deploy Contract
              </a>

              {/* Network Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-black border border-border hover:border-primary/50 transition-colors"
                  data-testid="network-selector"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{selectedNetworkInfo?.icon}</span>
                    <span className="font-mono text-sm">{selectedNetworkInfo?.name}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showNetworkDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showNetworkDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-1 bg-black border border-border z-10"
                    >
                      {NETWORKS.map((network) => (
                        <button
                          key={network.id}
                          onClick={() => {
                            setSelectedNetwork(network.id);
                            setShowNetworkDropdown(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-colors ${
                            selectedNetwork === network.id ? "bg-primary/20 text-primary" : ""
                          }`}
                          data-testid={`network-option-${network.id}`}
                        >
                          <span className="text-lg">{network.icon}</span>
                          <span className="font-mono text-sm">{network.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Quick Prompts</h3>
              </div>
              {suggestions?.suggestions?.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleTopicClick(suggestion)}
                  className="w-full text-left px-3 py-3 mb-2 bg-black border border-border hover:border-primary/50 text-sm font-mono transition-colors flex items-center gap-2 group"
                  data-testid={`quick-prompt-${i}`}
                >
                  <Zap className="w-3 h-3 text-primary shrink-0" />
                  <span className="flex-1 text-muted-foreground group-hover:text-white transition-colors">{suggestion}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>

            {/* Clear Chat Button */}
            {messages.length > 0 && (
              <div className="p-4 border-t border-border">
                <button
                  onClick={clearChat}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-colors font-mono text-sm"
                  data-testid="clear-chat"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Conversation
                </button>
              </div>
            )}
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-8">
              {messages.length === 0 && showTopics ? (
                <div className="max-w-4xl mx-auto">
                  {/* Welcome Header */}
                  <div className="text-center mb-12">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-6"
                    >
                      <Sparkles className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-3">
                      How can I help you build?
                    </h2>
                    <p className="text-muted-foreground font-mono max-w-lg mx-auto">
                      Ask me anything about blockchain development, RPC connections, smart contracts, or Web3 code.
                    </p>
                  </div>

                  {/* Topic Categories Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {TOPIC_CATEGORIES.map((category, i) => (
                      <motion.div
                        key={category.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-neutral-900 border border-border p-5 hover:border-primary/30 transition-colors group"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                            <category.icon className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-bold uppercase text-sm tracking-wide">{category.title}</h3>
                        </div>
                        <div className="space-y-2">
                          {category.topics.map((topic, j) => (
                            <button
                              key={j}
                              onClick={() => handleTopicClick(topic)}
                              className="w-full text-left text-sm font-mono text-muted-foreground hover:text-primary transition-colors py-1 truncate"
                              data-testid={`topic-${i}-${j}`}
                            >
                              → {topic}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {chatMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-3 text-muted-foreground p-4"
                    >
                      <div className="w-10 h-10 bg-neutral-900 border border-border flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </div>
                      <span className="font-mono text-sm">Thinking...</span>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6 bg-neutral-950">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Ask about Web3 development, RPC calls, smart contracts..."
                    className="flex-1 bg-black border border-border px-5 py-4 font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                    disabled={chatMutation.isPending}
                    data-testid="copilot-input"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || chatMutation.isPending}
                    className="px-6 bg-primary text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold uppercase tracking-wide"
                    data-testid="copilot-send"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {(chatMutation.isError || errorMessage) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 mt-3 p-3 bg-red-500/10 border border-red-500/30"
                  >
                    <span className="text-red-500 text-xs font-mono">
                      {errorMessage || "Failed to get response. Please try again."}
                    </span>
                    <button
                      onClick={() => {
                        setErrorMessage(null);
                        chatMutation.reset();
                      }}
                      className="text-red-500 hover:text-red-400 ml-auto text-xs font-mono underline"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                )}
                <p className="text-xs text-muted-foreground font-mono mt-3 text-center">
                  AI Copilot is context-aware of your selected network: <span className="text-primary">{selectedNetworkInfo?.name}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
