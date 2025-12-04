import { useState, useEffect, useCallback } from "react";
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
  ChevronRight,
  Sparkles,
  FileCode,
  ArrowRight,
  Unplug,
  Bot,
  FolderOpen,
  FilePlus,
  Trash2,
  X,
  Edit3,
  Save,
  MoreVertical,
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

interface ContractFile {
  id: string;
  name: string;
  content: string;
  createdAt: number;
  modifiedAt: number;
}

const STORAGE_KEY = "infra_v1_contracts";

const DEFAULT_CONTRACT = `// SPDX-License-Identifier: MIT
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

function useFileSystem() {
  const [files, setFiles] = useState<ContractFile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFiles(JSON.parse(stored));
      } catch {
        const defaultFile: ContractFile = {
          id: crypto.randomUUID(),
          name: "SimpleStorage.sol",
          content: DEFAULT_CONTRACT,
          createdAt: Date.now(),
          modifiedAt: Date.now(),
        };
        setFiles([defaultFile]);
      }
    } else {
      const defaultFile: ContractFile = {
        id: crypto.randomUUID(),
        name: "SimpleStorage.sol",
        content: DEFAULT_CONTRACT,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
      };
      setFiles([defaultFile]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
    }
  }, [files, isLoaded]);

  const createFile = useCallback((name: string, content: string = "") => {
    const newFile: ContractFile = {
      id: crypto.randomUUID(),
      name: name.endsWith(".sol") ? name : `${name}.sol`,
      content: content || `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract ${name.replace(".sol", "")} {\n    \n}`,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
    };
    setFiles((prev) => [...prev, newFile]);
    return newFile;
  }, []);

  const updateFile = useCallback((id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, content, modifiedAt: Date.now() } : f
      )
    );
  }, []);

  const renameFile = useCallback((id: string, newName: string) => {
    const name = newName.endsWith(".sol") ? newName : `${newName}.sol`;
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, name, modifiedAt: Date.now() } : f
      )
    );
  }, []);

  const deleteFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const getFile = useCallback((id: string) => {
    return files.find((f) => f.id === id);
  }, [files]);

  return { files, createFile, updateFile, renameFile, deleteFile, getFile, isLoaded };
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

interface FileTabProps {
  file: ContractFile;
  isActive: boolean;
  hasUnsavedChanges: boolean;
  onClick: () => void;
  onClose: () => void;
}

function FileTab({ file, isActive, hasUnsavedChanges, onClick, onClose }: FileTabProps) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer group transition-colors ${
        isActive ? "bg-black text-primary" : "bg-neutral-900 hover:bg-neutral-800 text-muted-foreground"
      }`}
      onClick={onClick}
      data-testid={`file-tab-${file.id}`}
    >
      <FileCode className="w-4 h-4 flex-shrink-0" />
      <span className="font-mono text-xs truncate max-w-[120px]">{file.name}</span>
      {hasUnsavedChanges && (
        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="p-0.5 hover:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"
        data-testid={`close-tab-${file.id}`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

interface FileExplorerItemProps {
  file: ContractFile;
  isActive: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
}

function FileExplorerItem({ file, isActive, onSelect, onRename, onDelete }: FileExplorerItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [showMenu, setShowMenu] = useState(false);

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(newName.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div
      className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
        isActive ? "bg-primary/20 text-primary" : "hover:bg-neutral-800"
      }`}
      onClick={() => !isRenaming && onSelect()}
      data-testid={`file-item-${file.id}`}
    >
      <FileCode className="w-4 h-4 flex-shrink-0 text-primary" />
      
      {isRenaming ? (
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename();
            if (e.key === "Escape") {
              setNewName(file.name);
              setIsRenaming(false);
            }
          }}
          className="flex-1 bg-black border border-primary px-2 py-0.5 font-mono text-xs focus:outline-none"
          autoFocus
          onClick={(e) => e.stopPropagation()}
          data-testid={`rename-input-${file.id}`}
        />
      ) : (
        <span className="flex-1 font-mono text-xs truncate">{file.name}</span>
      )}

      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-primary/20 transition-opacity"
          data-testid={`file-menu-${file.id}`}
        >
          <MoreVertical className="w-3 h-3" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 bg-black border border-border z-20 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRenaming(true);
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/20 text-left"
                data-testid={`rename-file-${file.id}`}
              >
                <Edit3 className="w-3 h-3" />
                <span className="font-mono text-xs">Rename</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete "${file.name}"?`)) {
                    onDelete();
                  }
                  setShowMenu(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-500/20 text-red-400 text-left"
                data-testid={`delete-file-${file.id}`}
              >
                <Trash2 className="w-3 h-3" />
                <span className="font-mono text-xs">Delete</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function DeployPage() {
  const { files, createFile, updateFile, renameFile, deleteFile, getFile, isLoaded } = useFileSystem();
  
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, string>>({});
  const [showNewFileDialog, setShowNewFileDialog] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [explorerExpanded, setExplorerExpanded] = useState(true);

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("ethereum-sepolia");
  const [showNetworkDropdown, setShowNetworkDropdown] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResult | null>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiFixing, setIsAiFixing] = useState(false);

  useEffect(() => {
    if (isLoaded && files.length > 0 && !activeFileId) {
      const firstFile = files[0];
      setActiveFileId(firstFile.id);
      setOpenTabIds([firstFile.id]);
    }
  }, [isLoaded, files, activeFileId]);

  const activeFile = activeFileId ? getFile(activeFileId) : null;
  const currentContent = activeFileId 
    ? (unsavedChanges[activeFileId] ?? activeFile?.content ?? "")
    : "";

  const handleContentChange = (content: string) => {
    if (!activeFileId) return;
    setUnsavedChanges((prev) => ({ ...prev, [activeFileId]: content }));
  };

  const saveFile = (fileId: string) => {
    if (unsavedChanges[fileId] !== undefined) {
      updateFile(fileId, unsavedChanges[fileId]);
      setUnsavedChanges((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
    }
  };

  const saveAllFiles = () => {
    Object.keys(unsavedChanges).forEach((id) => {
      updateFile(id, unsavedChanges[id]);
    });
    setUnsavedChanges({});
  };

  const openFile = (fileId: string) => {
    if (!openTabIds.includes(fileId)) {
      setOpenTabIds((prev) => [...prev, fileId]);
    }
    setActiveFileId(fileId);
    setCompileResult(null);
    setDeploymentResult(null);
    setDeployError(null);
  };

  const closeTab = (fileId: string) => {
    if (unsavedChanges[fileId] !== undefined) {
      if (!confirm("You have unsaved changes. Discard them?")) {
        return;
      }
      setUnsavedChanges((prev) => {
        const next = { ...prev };
        delete next[fileId];
        return next;
      });
    }

    setOpenTabIds((prev) => prev.filter((id) => id !== fileId));
    if (activeFileId === fileId) {
      const remaining = openTabIds.filter((id) => id !== fileId);
      setActiveFileId(remaining.length > 0 ? remaining[remaining.length - 1] : null);
    }
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    const file = createFile(newFileName.trim());
    openFile(file.id);
    setShowNewFileDialog(false);
    setNewFileName("");
  };

  const handleDeleteFile = (fileId: string) => {
    closeTab(fileId);
    deleteFile(fileId);
    if (files.length === 1) {
      const newFile = createFile("NewContract");
      openFile(newFile.id);
    }
  };

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

  const selectedNetworkInfo = networks?.find((n) => n.slug === selectedNetwork);

  const generateContractMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const res = await fetch("/api/copilot/generate-contract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          network: selectedNetworkInfo?.name || "Ethereum",
        }),
      });
      if (!res.ok) throw new Error("Failed to generate contract");
      return res.json() as Promise<{ response: string }>;
    },
    onSuccess: (data) => {
      const codeMatch = data.response.match(/```(?:solidity)?\n([\s\S]*?)```/);
      const newContent = codeMatch && codeMatch[1] ? codeMatch[1].trim() : data.response;
      
      if (activeFileId) {
        handleContentChange(newContent);
      }
      setAiPrompt("");
      setCompileResult(null);
    },
  });

  const askAiToFix = async () => {
    if (!compileResult?.errors || compileResult.errors.length === 0) return;
    
    setIsAiFixing(true);
    try {
      const res = await fetch("/api/copilot/fix-errors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceCode: currentContent,
          errors: compileResult.errors.map(e => ({
            message: e.formattedMessage || e.message,
            severity: e.severity,
          })),
          network: selectedNetworkInfo?.name || "Ethereum",
        }),
      });
      if (!res.ok) throw new Error("Failed to get AI fix");
      const data = await res.json() as { response: string };
      
      const codeMatch = data.response.match(/```(?:solidity)?\n([\s\S]*?)```/);
      if (codeMatch && codeMatch[1] && activeFileId) {
        handleContentChange(codeMatch[1].trim());
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

  const hasAnyUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-background text-foreground pt-16">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Sidebar */}
          <div className="w-72 border-r border-border bg-neutral-950 flex flex-col">
            {/* File Explorer */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setExplorerExpanded(!explorerExpanded)}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    data-testid="toggle-explorer"
                  >
                    {explorerExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <FolderOpen className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs uppercase">Contracts</span>
                  </button>
                  <button
                    onClick={() => setShowNewFileDialog(true)}
                    className="p-1.5 hover:bg-primary/20 transition-colors"
                    title="New File"
                    data-testid="new-file-button"
                  >
                    <FilePlus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {explorerExpanded && (
                <div className="flex-1 overflow-y-auto">
                  {files.map((file) => (
                    <FileExplorerItem
                      key={file.id}
                      file={file}
                      isActive={activeFileId === file.id}
                      onSelect={() => openFile(file.id)}
                      onRename={(newName) => renameFile(file.id, newName)}
                      onDelete={() => handleDeleteFile(file.id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Deployment Tools */}
            <div className="border-t border-border flex flex-col">
              {/* Wallet & Network */}
              <div className="p-4 border-b border-border">
                {walletAddress ? (
                  <div className="bg-green-500/10 border border-green-500/30 p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs text-green-400 uppercase">Connected</span>
                      <button
                        onClick={disconnectWallet}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        data-testid="disconnect-wallet"
                      >
                        <Unplug className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-mono text-xs text-white truncate">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
                    data-testid="connect-wallet"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </>
                    )}
                  </button>
                )}

                {/* Network Selector */}
                <div className="relative mt-3">
                  <button
                    onClick={() => setShowNetworkDropdown(!showNetworkDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-black border border-border hover:border-primary/50 transition-colors text-sm"
                    data-testid="network-selector"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{selectedNetworkInfo?.name || "Select Network"}</span>
                      {selectedNetworkInfo?.type === "testnet" && (
                        <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400">TEST</span>
                      )}
                    </div>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showNetworkDropdown ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showNetworkDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute bottom-full left-0 w-full mb-1 bg-black border border-border z-10 max-h-48 overflow-y-auto"
                      >
                        {networks?.map((network) => (
                          <button
                            key={network.slug}
                            onClick={() => {
                              setSelectedNetwork(network.slug);
                              setShowNetworkDropdown(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 hover:bg-primary/10 transition-colors ${
                              selectedNetwork === network.slug ? "bg-primary/20 text-primary" : ""
                            }`}
                            data-testid={`network-option-${network.slug}`}
                          >
                            <span className="font-mono text-xs">{network.name}</span>
                            {network.type === "testnet" && (
                              <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400">TEST</span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* AI Generator */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-3 h-3 text-primary" />
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">AI Generator</span>
                </div>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Describe your contract..."
                  className="w-full h-16 bg-black border border-border p-2 font-mono text-xs resize-none focus:outline-none focus:border-primary"
                  data-testid="ai-prompt-input"
                />
                <button
                  onClick={() => generateContractMutation.mutate(aiPrompt)}
                  disabled={!aiPrompt.trim() || generateContractMutation.isPending}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 font-mono text-xs"
                  data-testid="generate-contract"
                >
                  {generateContractMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      Generate
                    </>
                  )}
                </button>
              </div>

              {/* Compile Status */}
              <div className="p-4 max-h-40 overflow-y-auto">
                {compileResult?.success && compileResult.contracts && (
                  <div className="space-y-1">
                    {Object.keys(compileResult.contracts).map((name) => (
                      <button
                        key={name}
                        onClick={() => setSelectedContract(name)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 border transition-colors text-xs ${
                          selectedContract === name
                            ? "border-green-500 bg-green-500/10 text-green-400"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`contract-${name}`}
                      >
                        <FileCode className="w-3 h-3" />
                        <span className="font-mono truncate">{name}</span>
                        {selectedContract === name && <CheckCircle className="w-3 h-3 ml-auto" />}
                      </button>
                    ))}
                  </div>
                )}

                {compileResult?.errors && compileResult.errors.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {compileResult.errors.slice(0, 2).map((error, i) => (
                      <div key={i} className="p-2 bg-red-500/10 border border-red-500/30 text-[10px] font-mono text-red-400 truncate">
                        {error.message}
                      </div>
                    ))}
                    {compileResult.errors.length > 2 && (
                      <div className="text-[10px] text-red-400 font-mono">
                        +{compileResult.errors.length - 2} more errors
                      </div>
                    )}
                  </div>
                )}

                {compileResult?.errors && compileResult.errors.length > 0 && (
                  <button
                    onClick={askAiToFix}
                    disabled={isAiFixing}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 font-mono text-xs"
                    data-testid="ask-ai-fix"
                  >
                    {isAiFixing ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Fixing...
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3" />
                        AI Fix Errors
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Deploy Button */}
              <div className="p-4 border-t border-border">
                <button
                  onClick={deployContract}
                  disabled={!walletAddress || !compileResult?.success || !selectedContract}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-black font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="deploy-contract"
                >
                  <Rocket className="w-4 h-4" />
                  Deploy
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col bg-neutral-950">
            {/* File Tabs */}
            <div className="flex items-center border-b border-border bg-neutral-900 overflow-x-auto">
              <div className="flex">
                {openTabIds.map((id) => {
                  const file = getFile(id);
                  if (!file) return null;
                  return (
                    <FileTab
                      key={id}
                      file={file}
                      isActive={activeFileId === id}
                      hasUnsavedChanges={unsavedChanges[id] !== undefined}
                      onClick={() => setActiveFileId(id)}
                      onClose={() => closeTab(id)}
                    />
                  );
                })}
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 px-4">
                {hasAnyUnsavedChanges && (
                  <button
                    onClick={saveAllFiles}
                    className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-primary hover:bg-primary/20 transition-colors"
                    data-testid="save-all"
                  >
                    <Save className="w-3 h-3" />
                    Save All
                  </button>
                )}
                <button
                  onClick={() => compileMutation.mutate(currentContent)}
                  disabled={compileMutation.isPending || !currentContent}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
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
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {activeFile ? (
                <div className="flex-1 flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-border">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-primary" />
                      <span className="font-mono text-xs text-primary">{activeFile.name}</span>
                      {unsavedChanges[activeFileId!] !== undefined && (
                        <span className="text-xs text-muted-foreground">(unsaved)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unsavedChanges[activeFileId!] !== undefined && (
                        <button
                          onClick={() => saveFile(activeFileId!)}
                          className="flex items-center gap-1 px-2 py-1 text-xs font-mono text-primary hover:bg-primary/20 transition-colors"
                          data-testid="save-file"
                        >
                          <Save className="w-3 h-3" />
                          Save
                        </button>
                      )}
                      <CopyButton text={currentContent} />
                    </div>
                  </div>
                  <textarea
                    value={currentContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="flex-1 w-full bg-black p-4 font-mono text-sm text-green-400 resize-none focus:outline-none"
                    spellCheck={false}
                    data-testid="source-code-editor"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="font-mono text-sm text-muted-foreground">
                      Select a file or create a new one
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Deployment Result */}
            <AnimatePresence>
              {deploymentResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="border-t border-border p-4 bg-green-500/5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-bold text-green-400">Deployed!</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-black border border-border p-3">
                      <span className="font-mono text-[10px] text-muted-foreground">Contract Address</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-white truncate">{deploymentResult.contractAddress}</span>
                        <CopyButton text={deploymentResult.contractAddress} />
                      </div>
                    </div>

                    <div className="bg-black border border-border p-3">
                      <span className="font-mono text-[10px] text-muted-foreground">Transaction</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-white truncate">{deploymentResult.transactionHash}</span>
                        <CopyButton text={deploymentResult.transactionHash} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {deploymentResult.explorerUrl && (
                      <a
                        href={deploymentResult.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary text-black font-bold text-xs hover:bg-white transition-colors"
                        data-testid="view-explorer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View Contract
                      </a>
                    )}
                    {deploymentResult.transactionUrl && (
                      <a
                        href={deploymentResult.transactionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white font-bold text-xs hover:bg-blue-400 transition-colors"
                        data-testid="view-transaction"
                      >
                        <ExternalLink className="w-3 h-3" />
                        View TX
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
                  className="border-t border-border p-4 bg-red-500/5"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500" />
                    <div>
                      <h3 className="font-bold text-red-400">Deployment Failed</h3>
                      <p className="font-mono text-xs text-red-400/70">{deployError}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New File Dialog */}
      <AnimatePresence>
        {showNewFileDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setShowNewFileDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 border border-border p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-mono text-lg font-bold mb-4">New Contract File</h2>
              <input
                type="text"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="ContractName.sol"
                className="w-full bg-black border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-primary"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFile();
                  if (e.key === "Escape") setShowNewFileDialog(false);
                }}
                data-testid="new-file-input"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowNewFileDialog(false)}
                  className="px-4 py-2 border border-border hover:bg-neutral-800 font-mono text-sm transition-colors"
                  data-testid="cancel-new-file"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFile}
                  disabled={!newFileName.trim()}
                  className="px-4 py-2 bg-primary text-black font-bold font-mono text-sm hover:bg-white transition-colors disabled:opacity-50"
                  data-testid="create-new-file"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
