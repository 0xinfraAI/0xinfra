import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  Copy, 
  Check,
  Zap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface CopilotContext {
  selectedNetwork?: string;
  apiKey?: string;
  mode?: "quick" | "advanced";
}

interface CopilotProps {
  context?: CopilotContext;
  isOpen: boolean;
  onToggle: () => void;
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
        <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-primary/20">
          <span className="font-mono text-xs text-primary/70 uppercase">{language}</span>
          <button
            onClick={copyCode}
            className="p-1 hover:bg-primary/20 transition-colors"
            data-testid="copy-code"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-500" />
            ) : (
              <Copy className="w-3 h-3 text-muted-foreground" />
            )}
          </button>
        </div>
        <pre className="p-3 overflow-x-auto text-sm">
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
      language: match[1] || "code" 
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
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-primary text-black"
            : "bg-neutral-900 border border-border text-white"
        } p-4`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
            <Bot className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs text-primary uppercase tracking-wider">0xinfra Copilot</span>
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
        <div className={`text-xs mt-2 ${isUser ? "text-black/50" : "text-muted-foreground"}`}>
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  );
}

export function Copilot({ context, isOpen, onToggle }: CopilotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["/api/copilot/suggestions", context],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (context?.selectedNetwork) params.set("network", context.selectedNetwork);
      if (context?.apiKey) params.set("apiKey", context.apiKey);
      if (context?.mode) params.set("mode", context.mode);
      const res = await fetch(`/api/copilot/suggestions?${params}`);
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      return res.json() as Promise<{ suggestions: string[] }>;
    },
    enabled: isOpen,
  });

  const chatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: "user", content: userMessage },
          ],
          context,
        }),
      });
      if (!res.ok) throw new Error("Failed to get response");
      return res.json() as Promise<{ response: string }>;
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
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

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(input.trim());
    setInput("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary text-black flex items-center justify-center shadow-lg hover:bg-white transition-colors group"
        data-testid="copilot-toggle"
      >
        <Sparkles className="w-6 h-6 group-hover:animate-pulse" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-[420px] max-h-[600px] bg-background border border-primary/50 shadow-2xl flex flex-col overflow-hidden"
      style={{ boxShadow: "0 0 40px rgba(204, 255, 0, 0.15)" }}
    >
      {/* Header */}
      <div className="bg-black border-b border-primary/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider">AI Copilot</h3>
            <p className="text-xs text-muted-foreground font-mono">Blockchain Dev Assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-white/10 transition-colors"
            data-testid="copilot-close"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[400px] bg-neutral-950">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-bold uppercase mb-2">Welcome to AI Copilot</h4>
                  <p className="text-sm text-muted-foreground font-mono mb-4">
                    Your blockchain development assistant. Ask me anything about RPC connections, Web3 code, or 0xinfra.
                  </p>
                  
                  {/* Quick Suggestions */}
                  {suggestions?.suggestions && (
                    <div className="w-full space-y-2">
                      <p className="text-xs text-muted-foreground font-mono uppercase mb-2">Quick Start:</p>
                      {suggestions.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 bg-black border border-border hover:border-primary/50 text-sm font-mono transition-colors flex items-center gap-2"
                          data-testid={`suggestion-${i}`}
                        >
                          <Zap className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate">{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                  {chatMutation.isPending && (
                    <div className="flex items-center gap-2 text-muted-foreground p-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-mono text-sm">Thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-primary/30 p-3 bg-black">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about Web3, RPC, or code..."
                  className="flex-1 bg-neutral-900 border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/50"
                  disabled={chatMutation.isPending}
                  data-testid="copilot-input"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || chatMutation.isPending}
                  className="px-4 bg-primary text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="copilot-send"
                >
                  {chatMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              {chatMutation.isError && (
                <p className="text-red-500 text-xs font-mono mt-2">
                  Failed to get response. Please try again.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CopilotProvider({ children, context }: { children: React.ReactNode; context?: CopilotContext }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {children}
      <Copilot context={context} isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  );
}
