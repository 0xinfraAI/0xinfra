import { motion } from "framer-motion";
import { ArrowRight, Terminal, ChevronRight, Hash, FileText, Code, Cpu, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const SidebarItem = ({ active, children, onClick }: { active?: boolean, children: React.ReactNode, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-2 font-mono text-sm border-l-2 transition-colors duration-200 ${
      active 
        ? "border-primary text-primary bg-primary/10" 
        : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
    }`}
  >
    {children}
  </button>
);

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-black border border-border p-4 font-mono text-sm overflow-x-auto my-6 relative group">
    <div className="absolute top-0 right-0 px-2 py-1 text-xs text-muted-foreground bg-border/50">BASH</div>
    <pre className="text-primary">
      {code}
    </pre>
  </div>
);

export default function Docs() {
  const [activeSection, setActiveSection] = useState("intro");

  const sections = [
    { id: "intro", title: "00_INTRODUCTION" },
    { id: "architecture", title: "01_ARCHITECTURE" },
    { id: "consensus", title: "02_CONSENSUS" },
    { id: "nodes", title: "03_NODE_SETUP" },
    { id: "api", title: "04_JSON_RPC" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-border bg-background/95 backdrop-blur fixed md:sticky top-0 z-40 h-auto md:h-screen overflow-y-auto">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-mono font-bold tracking-widest">INFRA_V1</span>
          </a>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold uppercase mb-4 text-sm text-muted-foreground tracking-widest">Documentation</h3>
          <div className="space-y-1">
            {sections.map((section) => (
              <SidebarItem 
                key={section.id} 
                active={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
              >
                {section.title}
              </SidebarItem>
            ))}
          </div>
        </div>

        <div className="p-6 mt-auto border-t border-border">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>v1.0.4-beta</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-0 min-w-0">
        <header className="border-b border-border p-6 md:p-12 bg-background sticky top-0 z-30">
          <div className="flex items-center gap-2 text-muted-foreground font-mono text-sm mb-2">
            <span>DOCS</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground uppercase">{sections.find(s => s.id === activeSection)?.title}</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
            {sections.find(s => s.id === activeSection)?.title.split('_')[1]}
          </h1>
        </header>

        <div className="p-6 md:p-12 max-w-4xl mx-auto pb-32">
          {activeSection === "intro" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-xl leading-relaxed font-mono text-muted-foreground">
                INFRA_V1 is a high-performance, decentralized infrastructure protocol designed for the next generation of web3 applications. It solves the "scalability trilemma" through a novel sharding mechanism and optimistic execution environment.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
                <div className="border border-border p-6 hover:bg-white/5 transition-colors">
                  <Cpu className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold uppercase mb-2">Parallel Execution</h3>
                  <p className="text-sm text-muted-foreground font-mono">Transactions are processed in parallel across multiple shards, allowing for linear scalability.</p>
                </div>
                <div className="border border-border p-6 hover:bg-white/5 transition-colors">
                  <Shield className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-bold uppercase mb-2">Native Privacy</h3>
                  <p className="text-sm text-muted-foreground font-mono">Zero-knowledge proofs are integrated at the protocol level, ensuring transaction privacy by default.</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "architecture" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                The INFRA_V1 network is composed of three distinct layers: the Settlement Layer, the Execution Layer, and the Data Availability Layer.
              </p>

              <div className="border border-border p-8 my-8 bg-black relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 font-mono text-xs text-muted-foreground">DIAGRAM_01</div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="border border-primary/30 p-4 text-center">
                    [ APPLICATION LAYER ]
                  </div>
                  <div className="flex justify-center">
                    <div className="h-8 w-px bg-border"></div>
                  </div>
                  <div className="border border-white/20 p-4 text-center bg-white/5">
                    [ EXECUTION SHARDS (1...n) ]
                  </div>
                  <div className="flex justify-center">
                    <div className="h-8 w-px bg-border"></div>
                  </div>
                  <div className="border border-white/20 p-4 text-center bg-white/5">
                    [ SETTLEMENT & CONSENSUS ]
                  </div>
                  <div className="flex justify-center">
                    <div className="h-8 w-px bg-border"></div>
                  </div>
                  <div className="border border-white/20 p-4 text-center bg-white/5">
                    [ DATA AVAILABILITY ]
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold uppercase mt-12 mb-4 flex items-center gap-2">
                <Hash className="w-6 h-6 text-primary" />
                The Sharding Model
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Unlike traditional blockchains where every node validates every transaction, INFRA_V1 assigns nodes to specific shards. This allows the network to process thousands of transactions simultaneously without congestion.
              </p>
            </motion.div>
          )}

          {activeSection === "nodes" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Running a node on INFRA_V1 is permissionless. You can join the network as a Validator, Executor, or Archival node.
              </p>

              <div className="mt-8">
                <h3 className="font-mono font-bold text-primary mb-4 text-sm uppercase">01. Install CLI</h3>
                <CodeBlock code="curl -sL https://infra.v1/install | bash" />
              </div>

              <div className="mt-8">
                <h3 className="font-mono font-bold text-primary mb-4 text-sm uppercase">02. Initialize Node</h3>
                <CodeBlock code="infra init --chain=mainnet --moniker=my-node" />
              </div>

              <div className="mt-8">
                <h3 className="font-mono font-bold text-primary mb-4 text-sm uppercase">03. Start Service</h3>
                <CodeBlock code="infra start --daemon" />
              </div>

              <div className="bg-primary/10 border border-primary p-6 mt-12">
                <h4 className="font-bold uppercase flex items-center gap-2 mb-2">
                  <Terminal className="w-4 h-4" />
                  System Requirements
                </h4>
                <ul className="list-disc list-inside font-mono text-sm space-y-1 text-muted-foreground">
                  <li>CPU: 8 Cores (AMD EPYC / Intel Xeon)</li>
                  <li>RAM: 32GB DDR4</li>
                  <li>Storage: 2TB NVMe SSD</li>
                  <li>Network: 1Gbps symmetric</li>
                </ul>
              </div>
            </motion.div>
          )}

          {activeSection === "api" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <p className="text-lg leading-relaxed text-muted-foreground">
                Interact with the INFRA_V1 network using standard JSON-RPC 2.0 methods.
              </p>

              <div className="space-y-12">
                <div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-4 mb-4">
                    <h3 className="font-mono text-xl font-bold">eth_getBlockByNumber</h3>
                    <span className="text-xs bg-primary text-black px-2 py-0.5 font-bold font-mono">POST</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Returns information about a block by block number.</p>
                  <CodeBlock code={`curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBlockByNumber","params":["0x1b4", true],"id":1}' https://rpc.infra.v1`} />
                </div>

                <div>
                  <div className="flex items-baseline gap-4 border-b border-border pb-4 mb-4">
                    <h3 className="font-mono text-xl font-bold">infra_getShardStatus</h3>
                    <span className="text-xs bg-primary text-black px-2 py-0.5 font-bold font-mono">POST</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">Returns the current health and load status of a specific shard.</p>
                  <CodeBlock code={`curl -X POST --data '{"jsonrpc":"2.0","method":"infra_getShardStatus","params":["shard_01"],"id":1}' https://rpc.infra.v1`} />
                </div>
              </div>
            </motion.div>
          )}
          
          {activeSection === "consensus" && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <p className="text-lg leading-relaxed text-muted-foreground">
                  INFRA_V1 utilizes a unique Proof-of-Reliability (PoR) consensus mechanism that rewards nodes not just for staking tokens, but for consistent uptime and low-latency performance.
                </p>
                
                <h3 className="text-2xl font-bold uppercase mt-12 mb-6">Slashing Conditions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-mono text-sm">
                        <th className="p-4 font-normal">OFFENSE</th>
                        <th className="p-4 font-normal">PENALTY</th>
                        <th className="p-4 font-normal">JAIL TIME</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                      <tr className="border-b border-border hover:bg-white/5">
                        <td className="p-4">Double Signing</td>
                        <td className="p-4 text-red-500">5% Slash</td>
                        <td className="p-4">Permanent Ban</td>
                      </tr>
                      <tr className="border-b border-border hover:bg-white/5">
                        <td className="p-4">Downtime {'>'} 1hr</td>
                        <td className="p-4 text-yellow-500">0.1% Slash</td>
                        <td className="p-4">24 Hours</td>
                      </tr>
                       <tr className="border-b border-border hover:bg-white/5">
                        <td className="p-4">Invalid Block Proposal</td>
                        <td className="p-4 text-red-500">1% Slash</td>
                        <td className="p-4">7 Days</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
             </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}