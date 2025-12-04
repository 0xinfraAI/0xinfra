import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Wallet,
  Code2,
  Rocket,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  FileCode,
  ArrowRight,
  Unplug,
  Bot,
} from "lucide-react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

interface Network {
  name: string;
  slug: string;
  chainId: number;
  type: "mainnet" | "testnet";
}

interface CompileResult {
  success: boolean;
  contracts?: {
    [contractName: string]: {
      abi: any[];
      bytecode: string;
    };
  };
  errors?: Array<{
    severity: string;
    message: string;
    formattedMessage: string;
  }>;
  warnings?: Array<{
    severity: string;
    message: string;
    formattedMessage: string;
  }>;
}

interface DeploymentResult {
  contractAddress: string;
  transactionHash: string;
  network: string;
  verificationUrl: string | null;
  explorerUrl: string | null;
  transactionUrl: string | null;
}

const SAMPLE_CONTRACT = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private storedValue;
    address public owner;
    
    event ValueChanged(uint256 newValue, address changedBy);
    
    constructor() {
        owner = msg.sender;
    }
    
    function set(uint256 value) public {
        storedValue = value;
        emit ValueChanged(value, msg.sender);
    }
    
    function get() public view returns (uint256) {
        return storedValue;
    }
}`;

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={copy} className="p-1.5 hover:bg-primary/20 transition-colors" data-testid="copy-button">
      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
    </button>
  );
}

export default function DeployPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceCode, setSourceCode] = useState(SAMPLE_CONTRACT);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum-sepolia");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiFixing, setIsAiFixing] = useState(false);

  const { data: networks } = useQuery<Network[]>({
    queryKey: ["/api/contracts/networks"],
    queryFn: async () => {
      const res = await fetch("/api/contracts/networks");
      if (!res.ok) throw new Error("Failed to fetch networks");
      return res.json();
    },
  });

  const compileMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await fetch("/api/contracts/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceCode: code }),
      });
      if (!res.ok) throw new Error("Compilation failed");
      return res.json() as Promise<CompileResult>;
    },
    onSuccess: (result) => {
      setCompileResult(result);
      if (result.success && result.contracts) {
        const contractNames = Object.keys(result.contracts);
        if (contractNames.length > 0) {
          setSelectedContract(contractNames[0]);
        }
      }
    },
  });

  const generateContractMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Generate a complete, production-ready Solidity smart contract based on this request: "${prompt}". 
              
IMPORTANT: Return ONLY the Solidity code wrapped in a code block. No explanations before or after.
Start with // SPDX-License-Identifier and pragma solidity.
Include all necessary imports if using OpenZeppelin.
Add proper events and error handling.
Make it deployable as-is.`,
            },
          ],
          context: { selectedNetwork, mode: "quick" },
        }),
      });
      if (!res.ok) throw new Error("Failed to generate contract");
      return res.json() as Promise<{ response: string }>;
    },
    onSuccess: (data) => {
      const codeMatch = data.response.match(/```(?:solidity)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setSourceCode(codeMatch[1].trim());
      } else {
        setSourceCode(data.response);
      }
      setAiPrompt("");
    },
  });

  const askAiToFix = async () => {
    if (!compileResult?.errors || compileResult.errors.length === 0) return;
    
    setIsAiFixing(true);
    try {
      const errorMessages = compileResult.errors.map(e => e.message).join("\n");
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `Fix the following Solidity compilation errors in this contract.

ERRORS:
${errorMessages}

CURRENT CONTRACT:
\`\`\`solidity
${sourceCode}
\`\`\`

IMPORTANT: Return ONLY the corrected Solidity code wrapped in a code block. No explanations before or after.
Fix all the errors while preserving the original contract's functionality.`,
            },
          ],
          context: { selectedNetwork, mode: "quick" },
        }),
      });
      if (!res.ok) throw new Error("Failed to get AI fix");
      const data = await res.json() as { response: string };
      
      const codeMatch = data.response.match(/```(?:solidity)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        setSourceCode(codeMatch[1].trim());
        setCompileResult(null);
      }
    } catch (error) {
      console.error("AI fix failed:", error);
    } finally {
      setIsAiFixing(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this feature");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setDeploymentResult(null);
    setDeployError(null);
  };

  const switchNetwork = async (chainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        console.error("Network not found in wallet");
      }
      throw error;
    }
  };

  const deployContract = async () => {
    if (!walletAddress || !compileResult?.contracts || !selectedContract) return;

    const contractData = compileResult.contracts[selectedContract];
    if (!contractData) return;

    const network = networks?.find(n => n.slug === selectedNetwork);
    if (!network) return;

    setDeployError(null);
    setDeploymentResult(null);

    try {
      await switchNetwork(network.chainId);

      const transactionParams = {
        from: walletAddress,
        data: "0x" + contractData.bytecode,
        gas: "0x" + (3000000).toString(16),
      };

      const txHash = await window.ethereum!.request({
        method: "eth_sendTransaction",
        params: [transactionParams],
      });

      let receipt = null;
      let attempts = 0;
      while (!receipt && attempts < 60) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        receipt = await window.ethereum!.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });
        attempts++;
      }

      if (receipt && receipt.contractAddress) {
        const verifyRes = await fetch(
          `/api/contracts/verification-url?network=${selectedNetwork}&address=${receipt.contractAddress}&txHash=${txHash}`
        );
        const verifyData = await verifyRes.json();

        setDeploymentResult({
          contractAddress: receipt.contractAddress,
          transactionHash: txHash,
          network: network.name,
          verificationUrl: verifyData.verificationUrl,
          explorerUrl: verifyData.explorerUrl,
          transactionUrl: verifyData.transactionUrl,
        });
      } else {
        throw new Error("Failed to get contract address from transaction receipt");
      }
    } catch (error: any) {
      console.error("Deployment error:", error);
      setDeployError(error.message || "Deployment failed");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      });

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress(null);
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      };
    }
  }, []);

  const selectedNetworkInfo = networks?.find((n) => n.slug === selectedNetwork);

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background text-foreground pt-16">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-border bg-neutral-950 flex flex-col">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-black text-xl uppercase tracking-tight">Deploy</h1>
                  <p className="text-xs text-muted-foreground font-mono">Smart Contracts</p>
                </div>
              </div>

              {/* Wallet Connection */}
              {walletAddress ? (
                <div className="bg-green-500/10 border border-green-500/30 p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-green-400 uppercase">Connected</span>
                    <button
                      onClick={disconnectWallet}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      data-testid="disconnect-wallet"
                    >
                      <Unplug className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-mono text-sm text-white truncate">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-black font-bold hover:bg-white transition-colors disabled:opacity-50"
                  data-testid="connect-wallet"
                >
                  {isConnecting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Wallet className="w-5 h-5" />
                      Connect Wallet
                    </>
                  )}
                </button>
              )}

              {/* Network Selector */}
              <div className="relative mt-4">
                <button
                  onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-black border border-border hover:border-primary/50 transition-colors"
                  data-testid="network-selector"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm">{selectedNetworkInfo?.name || "Select Network"}</span>
                    {selectedNetworkInfo?.type === "testnet" && (
                      <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400">TESTNET</span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showNetworkDropdown ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showNetworkDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-1 bg-black border border-border z-10 max-h-60 overflow-y-auto"
                    >
                      {networks?.map((network) => (
                        <button
                          key={network.slug}
                          onClick={() => {
                            setSelectedNetwork(network.slug);
                            setShowNetworkDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-3 hover:bg-primary/10 transition-colors ${
                            selectedNetwork === network.slug ? "bg-primary/20 text-primary" : ""
                          }`}
                          data-testid={`network-option-${network.slug}`}
                        >
                          <span className="font-mono text-sm">{network.name}</span>
                          {network.type === "testnet" && (
                            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400">TEST</span>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* AI Contract Generator */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground uppercase">AI Contract Generator</span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the contract you want to create..."
                className="w-full h-24 bg-black border border-border p-3 font-mono text-sm resize-none focus:outline-none focus:border-primary"
                data-testid="ai-prompt-input"
              />
              <button
                onClick={() => generateContractMutation.mutate(aiPrompt)}
                disabled={!aiPrompt.trim() || generateContractMutation.isPending}
                className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 font-mono text-sm"
                data-testid="generate-contract"
              >
                {generateContractMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Contract
                  </>
                )}
              </button>
            </div>

            {/* Compile Status */}
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3">
                <Code2 className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs text-muted-foreground uppercase">Compilation Status</span>
              </div>

              {compileResult?.success && compileResult.contracts && (
                <div className="space-y-2">
                  {Object.keys(compileResult.contracts).map((name) => (
                    <button
                      key={name}
                      onClick={() => setSelectedContract(name)}
                      className={`w-full flex items-center gap-2 px-3 py-2 border transition-colors ${
                        selectedContract === name
                          ? "border-green-500 bg-green-500/10 text-green-400"
                          : "border-border hover:border-primary/50"
                      }`}
                      data-testid={`contract-${name}`}
                    >
                      <FileCode className="w-4 h-4" />
                      <span className="font-mono text-sm">{name}</span>
                      {selectedContract === name && <CheckCircle className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
                </div>
              )}

              {compileResult?.errors && compileResult.errors.length > 0 && (
                <div className="mt-4 space-y-2">
                  {compileResult.errors.map((error, i) => (
                    <div key={i} className="p-3 bg-red-500/10 border border-red-500/30 text-xs font-mono text-red-400">
                      {error.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Ask AI to Fix - Always visible, enabled when errors exist */}
              <div className="mt-4">
                <button
                  onClick={askAiToFix}
                  disabled={isAiFixing || !compileResult?.errors || compileResult.errors.length === 0}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-mono text-sm transition-colors ${
                    compileResult?.errors && compileResult.errors.length > 0
                      ? "bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30"
                      : "bg-neutral-800 border border-border text-muted-foreground cursor-not-allowed"
                  } disabled:opacity-50`}
                  data-testid="ask-ai-fix"
                >
                  {isAiFixing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI is fixing...
                    </>
                  ) : (
                    <>
                      <Bot className="w-4 h-4" />
                      Ask AI to Fix Errors
                    </>
                  )}
                </button>
                {(!compileResult?.errors || compileResult.errors.length === 0) && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Compile first to check for errors
                  </p>
                )}
              </div>

              {compileResult?.warnings && compileResult.warnings.length > 0 && (
                <div className="mt-4 space-y-2">
                  {compileResult.warnings.map((warning, i) => (
                    <div key={i} className="p-3 bg-yellow-500/10 border border-yellow-500/30 text-xs font-mono text-yellow-400">
                      {warning.message}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deploy Button */}
            <div className="p-4 border-t border-border">
              <button
                onClick={deployContract}
                disabled={!walletAddress || !compileResult?.success || !selectedContract}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-black font-bold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="deploy-contract"
              >
                <Rocket className="w-5 h-5" />
                Deploy Contract
              </button>
              {!walletAddress && (
                <p className="text-xs text-muted-foreground mt-2 text-center font-mono">
                  Connect wallet to deploy
                </p>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Code Editor */}
            <div className="flex-1 p-6 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-mono text-sm text-muted-foreground uppercase">Solidity Source Code</h2>
                <button
                  onClick={() => compileMutation.mutate(sourceCode)}
                  disabled={compileMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold hover:bg-white transition-colors disabled:opacity-50"
                  data-testid="compile-button"
                >
                  {compileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Code2 className="w-4 h-4" />
                      Compile
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 bg-black border border-border overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-border">
                  <span className="font-mono text-xs text-primary">Contract.sol</span>
                  <CopyButton text={sourceCode} />
                </div>
                <textarea
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  className="w-full h-[calc(100%-40px)] bg-black p-4 font-mono text-sm text-green-400 resize-none focus:outline-none"
                  spellCheck={false}
                  data-testid="source-code-editor"
                />
              </div>
            </div>

            {/* Deployment Result */}
            <AnimatePresence>
              {deploymentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="border-t border-border p-6 bg-green-500/5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h3 className="font-bold text-lg text-green-400">Contract Deployed Successfully!</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black border border-border p-4">
                      <span className="font-mono text-xs text-muted-foreground">Contract Address</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-sm text-white truncate">{deploymentResult.contractAddress}</span>
                        <CopyButton text={deploymentResult.contractAddress} />
                      </div>
                    </div>

                    <div className="bg-black border border-border p-4">
                      <span className="font-mono text-xs text-muted-foreground">Transaction Hash</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-sm text-white truncate">{deploymentResult.transactionHash}</span>
                        <CopyButton text={deploymentResult.transactionHash} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    {deploymentResult.explorerUrl && (
                      <a
                        href={deploymentResult.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold hover:bg-white transition-colors"
                        data-testid="view-explorer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Contract
                      </a>
                    )}
                    {deploymentResult.transactionUrl && (
                      <a
                        href={deploymentResult.transactionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-bold hover:bg-blue-400 transition-colors"
                        data-testid="view-transaction"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Transaction
                      </a>
                    )}
                    {deploymentResult.verificationUrl && (
                      <a
                        href={deploymentResult.verificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-neutral-800 text-white font-bold hover:bg-neutral-700 transition-colors"
                        data-testid="verify-contract"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify Contract
                      </a>
                    )}
                  </div>
                </motion.div>
              )}

              {deployError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="border-t border-border p-6 bg-red-500/5"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-500" />
                    <div>
                      <h3 className="font-bold text-lg text-red-400">Deployment Failed</h3>
                      <p className="font-mono text-sm text-red-400/70">{deployError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
