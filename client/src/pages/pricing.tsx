import { motion } from "framer-motion";
import { Check, X, Zap, Shield, Globe, Users, ArrowRight, Cpu } from "lucide-react";

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

      <a href="/connect">
        <button className="bg-primary text-black font-mono font-bold px-6 py-2 text-sm hover:bg-white transition-colors flex items-center gap-2 border border-transparent hover:border-black">
          CONNECT <ArrowRight className="w-4 h-4" />
        </button>
      </a>
    </nav>
  );
}

const tiers = [
  {
    name: "FREE",
    price: "$0",
    period: "/forever",
    description: "Perfect for testing and small projects",
    requests: "100K requests/day",
    highlight: false,
    features: [
      { text: "Shared RPC endpoints", included: true },
      { text: "3 networks (ETH, Polygon, BSC)", included: true },
      { text: "Community Discord support", included: true },
      { text: "Basic analytics", included: true },
      { text: "Dedicated nodes", included: false },
      { text: "Custom SLA", included: false },
      { text: "Priority routing", included: false },
    ],
    cta: "Start Free",
    ctaLink: "/connect",
  },
  {
    name: "PRO",
    price: "$49",
    period: "/month",
    description: "For growing dApps and indie developers",
    requests: "3M requests/day",
    highlight: false,
    features: [
      { text: "Enhanced RPC endpoints", included: true },
      { text: "10+ networks supported", included: true },
      { text: "Email support (24hr response)", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "Archive node access", included: true },
      { text: "Dedicated nodes", included: false },
      { text: "Custom SLA", included: false },
    ],
    cta: "Get Pro",
    ctaLink: "/connect",
  },
  {
    name: "GROWTH",
    price: "$199",
    period: "/month",
    description: "For scaling applications with high traffic",
    requests: "15M requests/day",
    highlight: true,
    features: [
      { text: "Priority RPC endpoints", included: true },
      { text: "All 35+ networks", included: true },
      { text: "Priority support (4hr response)", included: true },
      { text: "Real-time analytics + alerts", included: true },
      { text: "Archive node access", included: true },
      { text: "Dedicated capacity pool", included: true },
      { text: "99.9% uptime SLA", included: true },
    ],
    cta: "Scale Now",
    ctaLink: "/connect",
  },
  {
    name: "ENTERPRISE",
    price: "Custom",
    period: "",
    description: "For mission-critical infrastructure",
    requests: "Unlimited",
    highlight: false,
    features: [
      { text: "Fully dedicated nodes", included: true },
      { text: "Private network deployment", included: true },
      { text: "24/7 dedicated support", included: true },
      { text: "Custom integrations", included: true },
      { text: "On-premise options", included: true },
      { text: "99.99% uptime SLA", included: true },
      { text: "Compliance & audit support", included: true },
    ],
    cta: "Contact Sales",
    ctaLink: "#",
  },
];

const faqs = [
  {
    q: "What counts as a request?",
    a: "Each JSON-RPC call to our endpoints counts as one request. Batch calls count as multiple requests based on the number of operations.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. Changes take effect immediately. Upgrades are prorated, and downgrades apply at the next billing cycle.",
  },
  {
    q: "What networks do you support?",
    a: "We support 35+ networks including Ethereum, Polygon, BSC, Arbitrum, Optimism, Solana, Avalanche, and more. Enterprise plans can request custom chains.",
  },
  {
    q: "Do you offer annual discounts?",
    a: "Yes. Annual plans receive 20% off. Contact sales for enterprise annual agreements.",
  },
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      {/* Header */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-16 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="font-mono text-primary text-sm mb-4 tracking-widest">[ PRICING_MATRIX ]</p>
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-6">
            Simple Pricing
          </h1>
          <p className="font-mono text-muted-foreground text-lg max-w-2xl mx-auto">
            No hidden fees. No surprise overages. Scale your infrastructure with predictable costs.
          </p>
        </motion.div>
      </div>

      {/* Pricing Grid */}
      <div className="px-6 md:px-12 max-w-7xl mx-auto mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`border p-6 flex flex-col relative ${
                tier.highlight
                  ? "border-primary bg-primary/5"
                  : "border-border bg-black"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 text-xs font-mono font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-bold text-xl mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black">{tier.price}</span>
                  <span className="text-muted-foreground font-mono text-sm">{tier.period}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2 font-mono">{tier.description}</p>
              </div>

              <div className="bg-white/5 border border-white/10 px-4 py-2 mb-6 font-mono text-sm">
                <Zap className="w-4 h-4 inline mr-2 text-primary" />
                {tier.requests}
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {tier.features.map((feature) => (
                  <li key={feature.text} className="flex items-start gap-3 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    ) : (
                      <X className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                    )}
                    <span className={feature.included ? "" : "text-muted-foreground/50"}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <a href={tier.ctaLink}>
                <button
                  className={`w-full py-3 font-mono font-bold uppercase text-sm transition-colors ${
                    tier.highlight
                      ? "bg-primary text-black hover:bg-white"
                      : "bg-white text-black hover:bg-primary"
                  }`}
                >
                  {tier.cta}
                </button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cost Calculator */}
      <div className="px-6 md:px-12 max-w-4xl mx-auto mb-24">
        <div className="border border-border p-8 md:p-12 bg-neutral-900">
          <div className="flex items-start gap-4 mb-8">
            <Cpu className="w-8 h-8 text-primary shrink-0" />
            <div>
              <h2 className="text-2xl font-bold uppercase mb-2">Cost Comparison</h2>
              <p className="font-mono text-muted-foreground text-sm">
                See how much you save vs running your own infrastructure
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border border-border p-6">
              <h3 className="font-mono text-sm text-muted-foreground mb-4">[ SELF-HOSTED ]</h3>
              <ul className="space-y-3 font-mono text-sm mb-6">
                <li className="flex justify-between">
                  <span>Cloud Server (8 CPU, 32GB)</span>
                  <span>$200/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>Storage (2TB NVMe)</span>
                  <span>$80/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>Bandwidth (5TB)</span>
                  <span>$50/mo</span>
                </li>
                <li className="flex justify-between">
                  <span>DevOps Time (10hrs)</span>
                  <span>$500/mo</span>
                </li>
                <li className="flex justify-between border-t border-border pt-3 font-bold text-lg">
                  <span>Total</span>
                  <span className="text-red-400">$830/mo</span>
                </li>
              </ul>
            </div>

            <div className="border border-primary p-6 bg-primary/5">
              <h3 className="font-mono text-sm text-primary mb-4">[ INFRA_V1 GROWTH ]</h3>
              <ul className="space-y-3 font-mono text-sm mb-6">
                <li className="flex justify-between">
                  <span>15M requests/day</span>
                  <span>Included</span>
                </li>
                <li className="flex justify-between">
                  <span>35+ Networks</span>
                  <span>Included</span>
                </li>
                <li className="flex justify-between">
                  <span>99.9% SLA</span>
                  <span>Included</span>
                </li>
                <li className="flex justify-between">
                  <span>Zero DevOps</span>
                  <span>Included</span>
                </li>
                <li className="flex justify-between border-t border-primary/30 pt-3 font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">$199/mo</span>
                </li>
              </ul>
              <div className="bg-black p-3 text-center font-mono text-sm">
                Save <span className="text-primary font-bold">$631/mo</span> (76%)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="px-6 md:px-12 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold uppercase mb-8 text-center">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border p-6 hover:bg-white/5 transition-colors">
              <h3 className="font-bold mb-2">{faq.q}</h3>
              <p className="font-mono text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}