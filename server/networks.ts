export interface NetworkConfig {
  name: string;
  slug: string;
  alchemyPath: string;
  chainId: number | null;
  type: "mainnet" | "testnet";
  ecosystem: "evm" | "solana";
}

export const NETWORKS: Record<string, NetworkConfig> = {
  "ethereum": {
    name: "Ethereum Mainnet",
    slug: "ethereum",
    alchemyPath: "eth-mainnet",
    chainId: 1,
    type: "mainnet",
    ecosystem: "evm",
  },
  "ethereum-sepolia": {
    name: "Ethereum Sepolia",
    slug: "ethereum-sepolia",
    alchemyPath: "eth-sepolia",
    chainId: 11155111,
    type: "testnet",
    ecosystem: "evm",
  },
  "ethereum-goerli": {
    name: "Ethereum Goerli",
    slug: "ethereum-goerli",
    alchemyPath: "eth-goerli",
    chainId: 5,
    type: "testnet",
    ecosystem: "evm",
  },
  "polygon": {
    name: "Polygon Mainnet",
    slug: "polygon",
    alchemyPath: "polygon-mainnet",
    chainId: 137,
    type: "mainnet",
    ecosystem: "evm",
  },
  "polygon-mumbai": {
    name: "Polygon Mumbai",
    slug: "polygon-mumbai",
    alchemyPath: "polygon-mumbai",
    chainId: 80001,
    type: "testnet",
    ecosystem: "evm",
  },
  "arbitrum": {
    name: "Arbitrum One",
    slug: "arbitrum",
    alchemyPath: "arb-mainnet",
    chainId: 42161,
    type: "mainnet",
    ecosystem: "evm",
  },
  "arbitrum-sepolia": {
    name: "Arbitrum Sepolia",
    slug: "arbitrum-sepolia",
    alchemyPath: "arb-sepolia",
    chainId: 421614,
    type: "testnet",
    ecosystem: "evm",
  },
  "optimism": {
    name: "Optimism Mainnet",
    slug: "optimism",
    alchemyPath: "opt-mainnet",
    chainId: 10,
    type: "mainnet",
    ecosystem: "evm",
  },
  "optimism-sepolia": {
    name: "Optimism Sepolia",
    slug: "optimism-sepolia",
    alchemyPath: "opt-sepolia",
    chainId: 11155420,
    type: "testnet",
    ecosystem: "evm",
  },
  "base": {
    name: "Base Mainnet",
    slug: "base",
    alchemyPath: "base-mainnet",
    chainId: 8453,
    type: "mainnet",
    ecosystem: "evm",
  },
  "base-sepolia": {
    name: "Base Sepolia",
    slug: "base-sepolia",
    alchemyPath: "base-sepolia",
    chainId: 84532,
    type: "testnet",
    ecosystem: "evm",
  },
  "bsc": {
    name: "BNB Smart Chain",
    slug: "bsc",
    alchemyPath: "bnb-mainnet",
    chainId: 56,
    type: "mainnet",
    ecosystem: "evm",
  },
  "bsc-testnet": {
    name: "BNB Smart Chain Testnet",
    slug: "bsc-testnet",
    alchemyPath: "bnb-testnet",
    chainId: 97,
    type: "testnet",
    ecosystem: "evm",
  },
  "solana": {
    name: "Solana Mainnet",
    slug: "solana",
    alchemyPath: "solana-mainnet",
    chainId: null,
    type: "mainnet",
    ecosystem: "solana",
  },
  "solana-devnet": {
    name: "Solana Devnet",
    slug: "solana-devnet",
    alchemyPath: "solana-devnet",
    chainId: null,
    type: "testnet",
    ecosystem: "solana",
  },
};

export function getAlchemyUrl(networkSlug: string, alchemyApiKey: string): string | null {
  const network = NETWORKS[networkSlug.toLowerCase()];
  if (!network) return null;
  return `https://${network.alchemyPath}.g.alchemy.com/v2/${alchemyApiKey}`;
}

export function getNetworkBySlug(slug: string): NetworkConfig | null {
  return NETWORKS[slug.toLowerCase()] || null;
}

export function getAllNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS);
}

export function getMainnetNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS).filter(n => n.type === "mainnet");
}

export function getTestnetNetworks(): NetworkConfig[] {
  return Object.values(NETWORKS).filter(n => n.type === "testnet");
}