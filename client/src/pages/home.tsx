import { motion } from "framer-motion";
import { ArrowRight, Terminal, Zap, Shield, Network, Activity, Cpu, Globe } from "lucide-react";
import heroBg from "@assets/generated_images/abstract_wireframe_topographic_map_with_acid_green_lines_on_black.png";
import { Navigation } from "@/components/Navigation";

const Marquee = ({ text }: { text: string }) => (
  <div className="w-full overflow-hidden bg-primary text-black py-2 border-y border-black">
    <div className="animate-marquee whitespace-nowrap font-mono font-bold uppercase text-sm tracking-widest flex gap-8">
      {Array(10).fill(text).map((t, i) => (
        <span key={i}>{t}</span>
      ))}
    </div>
  </div>
);

const BrutalistCard = ({ title, icon: Icon, children, className = "" }: any) => (
  <div className={`border border-border p-6 md:p-8 hover:bg-white hover:text-black transition-colors duration-0 group relative overflow-hidden ${className}`}>
    <div className="absolute top-0 right-0 p-2 opacity-50 group-hover:opacity-100 font-mono text-xs">
      [ID_0{Math.floor(Math.random() * 9)}]
    </div>
    <Icon className="w-12 h-12 mb-6 text-primary group-hover:text-black transition-colors" strokeWidth={1.5} />
    <h3 className="text-2xl font-bold mb-2 uppercase font-sans tracking-tight">{title}</h3>
    <p className="font-mono text-sm opacity-70 group-hover:opacity-100 leading-relaxed">
      {children}
    </p>
  </div>
);

const Stat = ({ label, value }: { label: string, value: string }) => (
  <div className="border-r border-border last:border-r-0 p-8 flex flex-col justify-between h-full hover:bg-white/5 transition-colors">
    <span className="font-mono text-primary text-xs mb-4 block">[ {label} ]</span>
    <span className="text-5xl md:text-7xl font-bold tracking-tighter block">{value}</span>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black">
      <Navigation transparent />

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col pt-16 border-b border-border">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src={heroBg} alt="Background" className="w-full h-full object-cover grayscale contrast-125" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-4 md:px-12 max-w-[1800px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border-l-2 border-primary pl-6 mb-8"
          >
            <p className="font-mono text-primary text-sm md:text-base mb-2 tracking-widest">
              // DECENTRALIZED INFRASTRUCTURE PROTOCOL
            </p>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-9xl font-black uppercase leading-[0.85] tracking-tighter mb-8 mix-blend-difference"
            data-text="RAW POWER ZERO LATENCY"
          >
            RAW POWER<br/>
            <span className="text-stroke text-transparent hover:text-primary transition-colors duration-300">ZERO LATENCY</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-mono text-lg md:text-xl max-w-2xl text-muted-foreground mb-12 leading-relaxed"
          >
            The backbone for the next billion users. Uncensored. Unstoppable. 
            Deploy high-performance nodes in seconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <a href="/connect">
              <button className="bg-white text-black font-sans font-bold text-xl px-8 py-4 hover:bg-primary transition-colors border border-white hover:border-primary uppercase">
                Start Building
              </button>
            </a>
            <a href="/docs">
              <button className="bg-transparent text-white font-sans font-bold text-xl px-8 py-4 border border-white hover:bg-white hover:text-black transition-colors uppercase flex items-center gap-3 w-full md:w-auto justify-center">
                <Terminal className="w-5 h-5" />
                Read Docs
              </button>
            </a>
          </motion.div>
        </div>
        
        <div className="relative z-20 mt-auto">
          <Marquee text=" SYSTEM STATUS: ONLINE // LATENCY: 12MS // NODES: 4,201 // BLOCK HEIGHT: 19,203,122 // " />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 md:px-12 border-b border-border bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-mono text-primary text-sm mb-4 tracking-widest">[ HOW_IT_WORKS ]</p>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Three Steps to <span className="text-primary">Launch</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Connect",
                desc: "Sign up and generate your API key in seconds. No credit card required for the free tier.",
                icon: "→",
              },
              {
                step: "02",
                title: "Integrate",
                desc: "Drop our RPC endpoint into your dApp. Compatible with ethers.js, web3.js, and all major libraries.",
                icon: "⟨/⟩",
              },
              {
                step: "03",
                title: "Scale",
                desc: "We handle the infrastructure. You focus on building. Upgrade seamlessly as you grow.",
                icon: "↗",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative border border-border p-8 bg-black group hover:border-primary transition-colors"
              >
                <div className="absolute -top-4 left-8 bg-primary text-black px-3 py-1 font-mono font-bold text-sm">
                  STEP {item.step}
                </div>
                <div className="text-6xl mb-6 font-mono text-primary/30 group-hover:text-primary transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold uppercase mb-4">{item.title}</h3>
                <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <a href="/connect">
              <button className="bg-primary text-black font-mono font-bold text-lg px-12 py-4 hover:bg-white transition-colors uppercase">
                Get Started Now
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 md:p-16 border-b lg:border-b-0 lg:border-r border-border">
             <div className="sticky top-24">
                <p className="font-mono text-primary text-sm mb-4 tracking-widest">[ SYSTEM_CAPABILITIES ]</p>
                <h2 className="text-5xl md:text-7xl font-black uppercase leading-none mb-8">
                  ARCHITECT<br/>
                  THE <span className="text-stroke text-transparent">FUTURE</span>
                </h2>
                <p className="font-mono text-muted-foreground text-lg max-w-md mb-12">
                  Built for high-frequency trading, MEV protection, and zero-knowledge proof generation. This is not just a node provider. It's a weapon.
                </p>
                
                <ul className="space-y-4 font-mono text-sm">
                  <li className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-primary" />
                    <span>99.99% UPTIME SLA GUARANTEED</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-primary" />
                    <span>MULTI-REGION FAILOVER</span>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-primary" />
                    <span>24/7 ENGINEER SUPPORT CHANNEL</span>
                  </li>
                </ul>
             </div>
          </div>

          <div className="grid grid-cols-1 border-border">
            {[
              {
                id: "01",
                title: "Instant Finality",
                desc: "Sub-second block times with optimistic execution. Your transactions confirm before they even blink.",
                specs: ["< 400ms Latency", "Optimistic Rollups", "Instant Soft Confirm"]
              },
              {
                id: "02",
                title: "Infinite Scalability",
                desc: "Horizontal sharding allows the network to grow with demand. No bottlenecks. No gas wars.",
                specs: ["Dynamic Sharding", "Auto-Scaling", "Zero Gas Spikes"]
              },
              {
                id: "03",
                title: "Privacy Native",
                desc: "Zero-knowledge proofs integrated at the protocol level. Transact freely without being watched.",
                specs: ["zk-SNARKs", "Private Mempool", "Encrypted State"]
              },
              {
                id: "04",
                title: "Interchain Bridges",
                desc: "Native trustless bridges to Ethereum, Solana, and Bitcoin. Move assets without the risk.",
                specs: ["Trustless Relayers", "Multi-Sig Security", "Instant Settlement"]
              }
            ].map((item, i) => (
              <div key={item.id} className="group border-b border-border last:border-b-0 p-8 md:p-12 hover:bg-white hover:text-black transition-colors duration-300 cursor-crosshair">
                <div className="flex justify-between items-start mb-6">
                  <span className="font-mono text-xl font-bold opacity-50">/ {item.id}</span>
                  <ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                </div>
                <h3 className="text-3xl md:text-4xl font-bold uppercase mb-4">{item.title}</h3>
                <p className="font-mono text-sm md:text-base opacity-70 group-hover:opacity-100 mb-8 max-w-lg">
                  {item.desc}
                </p>
                <div className="flex flex-wrap gap-3">
                  {item.specs.map(spec => (
                    <span key={spec} className="font-mono text-xs border border-current px-2 py-1 uppercase">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-b border-border bg-background">
        <Stat label="UPTIME GUARANTEE" value="99.9%" />
        <Stat label="GLOBAL NODES" value="10K+" />
        <Stat label="AVG LATENCY" value="12MS" />
        <Stat label="TOTAL STAKED" value="$2.4B" />
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-b border-border">
        <div className="col-span-1 md:col-span-2 lg:col-span-1 p-8 md:p-12 border-b md:border-b-0 lg:border-r border-border flex flex-col justify-center">
          <h2 className="text-4xl md:text-6xl font-bold uppercase mb-6">
            Infrastructure<br/>
            <span className="text-primary">Reimagined</span>
          </h2>
          <p className="font-mono text-muted-foreground leading-relaxed">
            Stop relying on centralized providers. Our decentralized network ensures your dApp stays online, no matter what.
          </p>
        </div>
        
        <BrutalistCard title="Global RPC" icon={Globe} className="border-r border-b md:border-b-0 border-border">
          Low-latency RPC endpoints available in 35+ regions. Auto-failover included.
        </BrutalistCard>
        
        <BrutalistCard title="Dedicated Nodes" icon={Cpu} className="border-b md:border-b-0 border-border">
          Fully managed dedicated nodes for enterprise-grade performance and reliability.
        </BrutalistCard>
        
        <BrutalistCard title="Instant Sync" icon={Zap} className="border-r border-b md:border-b-0 lg:border-t border-border">
          Sync a full archival node in minutes, not days. Powered by our snapshot technology.
        </BrutalistCard>
        
        <BrutalistCard title="DDoS Protection" icon={Shield} className="border-r border-b md:border-b-0 lg:border-t border-border">
          Enterprise-grade DDoS mitigation specifically tuned for blockchain protocols.
        </BrutalistCard>
        
        <BrutalistCard title="Real-time Analytics" icon={Activity} className="lg:border-t border-border">
          Deep insights into your node performance, request volume, and error rates.
        </BrutalistCard>
      </section>

      {/* Terminal Section */}
      <section className="py-24 px-4 md:px-12 border-b border-border bg-neutral-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
           <Network className="w-64 h-64 text-neutral-800 opacity-50" />
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-4 h-4 bg-red-500 rounded-full" />
             <div className="w-4 h-4 bg-yellow-500 rounded-full" />
             <div className="w-4 h-4 bg-green-500 rounded-full" />
             <div className="flex-1 h-px bg-neutral-700" />
             <span className="font-mono text-neutral-500 text-sm">BASH</span>
          </div>
          
          <div className="font-mono text-sm md:text-lg space-y-4">
            <div className="flex gap-4">
               <span className="text-primary">$</span>
               <span className="text-white">npm install @0xinfra/sdk</span>
            </div>
            <div className="text-neutral-500">
               [+] Installing dependencies...<br/>
               [+] Verifying integrity...<br/>
               [+] Added 42 packages in 0.5s
            </div>
            <div className="flex gap-4">
               <span className="text-primary">$</span>
               <span className="text-white">infra deploy --region=us-east --type=validator</span>
            </div>
             <div className="text-primary">
               Success! Node deployed to us-east-1 (ID: node_8x92j)
            </div>
            <div className="flex gap-4">
               <span className="text-primary animate-pulse">_</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 text-center border-b border-border relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0" />
        <div className="relative z-10 group-hover:text-black transition-colors duration-300">
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-8">
            Ready to Scale?
          </h2>
          <button className="bg-white text-black font-mono font-bold text-xl px-12 py-6 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            START FREE TRIAL
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 px-4 md:px-12 flex flex-col md:flex-row justify-between items-start gap-12">
        <div>
          <h4 className="text-3xl font-black uppercase tracking-widest mb-4">0xinfra</h4>
          <p className="font-mono text-muted-foreground max-w-xs text-sm">
            Building the decentralized web, one block at a time.
            <br/><br/>
            © 2025 0xinfra
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-24 font-mono text-sm">
          <div className="flex flex-col gap-4">
            <span className="text-primary font-bold">[ PRODUCT ]</span>
            <a href="/nodes" className="hover:text-white text-neutral-400">Nodes</a>
            <a href="/connect" className="hover:text-white text-neutral-400">Start Building</a>
            <a href="/copilot" className="hover:text-white text-neutral-400">AI Copilot</a>
            <a href="/pricing" className="hover:text-white text-neutral-400">Pricing</a>
            <a href="/docs" className="hover:text-white text-neutral-400">API Docs</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-primary font-bold">[ RESOURCES ]</span>
            <a href="/dashboard" className="hover:text-white text-neutral-400">Dashboard</a>
            <a href="/docs" className="hover:text-white text-neutral-400">Documentation</a>
            <a href="/nodes" className="hover:text-white text-neutral-400">Network Status</a>
            <a href="/connect" className="hover:text-white text-neutral-400">Quick Start</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-primary font-bold">[ CONNECT ]</span>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-neutral-400">Twitter</a>
            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-neutral-400">Discord</a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white text-neutral-400">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}