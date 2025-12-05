# 0xinfra

<div align="center">

![0xinfra](https://img.shields.io/badge/0xinfra-CCFF00?style=for-the-badge&logo=ethereum&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

**The backbone for the next billion users. Uncensored. Unstoppable.**

[Live Demo](https://0xinfra.online) · [Documentation](#documentation) · [API Reference](#api-reference)

</div>

---

## Overview

**0xinfra** is a white-label blockchain RPC infrastructure platform with a brutalist design aesthetic. Deploy high-performance nodes in seconds, access multi-chain RPC endpoints, and build decentralized applications with enterprise-grade reliability.

```
┌──────────────────────────────────────────────────────────────┐
│  ██████╗ ██╗  ██╗██╗███╗   ██╗███████╗██████╗  █████╗       │
│ ██╔═████╗╚██╗██╔╝██║████╗  ██║██╔════╝██╔══██╗██╔══██╗      │
│ ██║██╔██║ ╚███╔╝ ██║██╔██╗ ██║█████╗  ██████╔╝███████║      │
│ ████╔╝██║ ██╔██╗ ██║██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║      │
│ ╚██████╔╝██╔╝ ██╗██║██║ ╚████║██║     ██║  ██║██║  ██║      │
│  ╚═════╝ ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝      │
│                                                              │
│  RAW POWER // ZERO LATENCY // DECENTRALIZED INFRASTRUCTURE  │
└──────────────────────────────────────────────────────────────┘
```

---

## Features

| Feature | Description |
|---------|-------------|
| 🔗 **Multi-Chain RPC** | Connect to Ethereum, Polygon, Arbitrum, Optimism, Base, BSC, and Solana |
| 📝 **Smart Contract IDE** | Remix-style editor with file management, compilation, and deployment |
| 🤖 **AI Copilot** | GPT-powered Solidity development assistant |
| 📊 **Live Logs** | Real-time RPC request monitoring with WebSocket streaming |
| 📚 **Documentation** | Alchemy-style docs with interactive examples and Mermaid diagrams |
| 🔐 **Auth System** | Email/password authentication with 7-day trial activation |
| 💰 **Tiered Pricing** | Free, Pro, and Enterprise plans with usage-based limits |

---

## Architecture

### System Overview

```mermaid
flowchart TB
    subgraph Client["🖥️ Client Layer"]
        UI[React Frontend]
        WS[WebSocket Client]
    end

    subgraph API["⚡ API Gateway"]
        Express[Express Server]
        Auth[Auth Middleware]
        RPC[RPC Proxy]
    end

    subgraph Services["🔧 Core Services"]
        Copilot[AI Copilot]
        Compiler[Solidity Compiler]
        Logger[Log Streamer]
    end

    subgraph Data["💾 Data Layer"]
        PG[(PostgreSQL)]
        Sessions[(Sessions)]
    end

    subgraph Chains["⛓️ Blockchain Networks"]
        ETH[Ethereum]
        POLY[Polygon]
        ARB[Arbitrum]
        SOL[Solana]
    end

    UI --> Express
    WS --> Logger
    Express --> Auth
    Auth --> RPC
    Auth --> Copilot
    Auth --> Compiler
    RPC --> ETH & POLY & ARB & SOL
    Express --> PG
    Auth --> Sessions
    Logger --> PG
```

### Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant S as Server
    participant DB as Database

    U->>C: Enter email/password
    C->>S: POST /api/auth/register
    S->>S: Hash password (bcrypt)
    S->>DB: Create user + 7-day trial
    DB-->>S: User created
    S->>S: Create session
    S-->>C: Set session cookie
    C-->>U: Redirect to dashboard

    Note over U,DB: Login Flow
    U->>C: Enter credentials
    C->>S: POST /api/auth/login
    S->>DB: Verify user exists
    S->>S: Compare password hash
    S->>S: Create session
    S-->>C: Set session cookie
    C-->>U: Access granted
```

### RPC Request Flow

```mermaid
sequenceDiagram
    participant dApp as Your dApp
    participant Proxy as 0xinfra Proxy
    participant Cache as Response Cache
    participant Node as Blockchain Node
    participant Log as Log System

    dApp->>Proxy: eth_call / eth_getBalance
    Proxy->>Proxy: Validate API Key
    Proxy->>Cache: Check cache
    
    alt Cache Hit
        Cache-->>Proxy: Cached response
    else Cache Miss
        Proxy->>Node: Forward request
        Node-->>Proxy: Response
        Proxy->>Cache: Store response
    end
    
    Proxy->>Log: Log request (async)
    Proxy-->>dApp: JSON-RPC response
```

### Smart Contract Deployment

```mermaid
flowchart LR
    subgraph IDE["📝 Contract IDE"]
        Write[Write Solidity]
        AI[AI Generate]
    end

    subgraph Compile["⚙️ Compilation"]
        Solc[solc Compiler]
        ABI[ABI + Bytecode]
    end

    subgraph Deploy["🚀 Deployment"]
        Wallet[MetaMask]
        TX[Sign Transaction]
    end

    subgraph Chain["⛓️ Network"]
        Contract[Deployed Contract]
        Explorer[Block Explorer]
    end

    Write --> Solc
    AI --> Write
    Solc --> ABI
    ABI --> Wallet
    Wallet --> TX
    TX --> Contract
    Contract --> Explorer
```

### AI Copilot Capabilities

```mermaid
mindmap
  root((AI Copilot))
    Smart Contracts
      Generate from description
      Fix compilation errors
      Optimize gas usage
      Security auditing
    Web3 Development
      ethers.js examples
      web3.js integration
      SDK usage guides
    DeFi & Tokens
      ERC-20 templates
      ERC-721 NFTs
      Liquidity pools
    RPC & Connections
      Endpoint setup
      Error debugging
      Rate limit handling
    Security
      Reentrancy prevention
      Access control
      Best practices
```

---

## Tech Stack

```
Frontend                Backend                 Database
────────────────────    ────────────────────    ────────────────────
React 18                Express.js              PostgreSQL (Neon)
TypeScript              Node.js                 Drizzle ORM
Tailwind CSS            WebSocket (ws)          
Framer Motion           solc (Solidity)         
TanStack Query          OpenAI API              
wouter (routing)        bcrypt (auth)           
Radix UI                express-session         
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key (for AI Copilot)

### Installation

```bash
# Clone the repository
git clone https://github.com/0xinfraAI/0xinfra.git
cd 0xinfra

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Start development server
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SESSION_SECRET=your-secure-session-secret
OPENAI_API_KEY=sk-...
ALCHEMY_API_KEY=your-alchemy-key
```

---

## API Reference

### Authentication

```bash
# Register
curl -X POST https://api.0xinfra.online/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@example.com", "password": "securepass123"}'

# Login
curl -X POST https://api.0xinfra.online/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "dev@example.com", "password": "securepass123"}'
```

### RPC Endpoints

```bash
# Ethereum - Get latest block number
curl -X POST https://rpc.0xinfra.online/v1/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Get ETH balance
curl -X POST https://rpc.0xinfra.online/v1/YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["0x742d35Cc6634C0532925a3b844Bc9e7595f3fE75", "latest"],
    "id":1
  }'
```

### JavaScript SDK

```javascript
import { ethers } from 'ethers';

// Connect to 0xinfra
const provider = new ethers.JsonRpcProvider(
  'https://rpc.0xinfra.online/v1/YOUR_API_KEY'
);

// Get latest block
const blockNumber = await provider.getBlockNumber();
console.log('Latest block:', blockNumber);

// Get balance
const balance = await provider.getBalance('0x742d35Cc...');
console.log('Balance:', ethers.formatEther(balance), 'ETH');
```

### Python SDK

```python
from web3 import Web3

# Connect to 0xinfra
w3 = Web3(Web3.HTTPProvider('https://rpc.0xinfra.online/v1/YOUR_API_KEY'))

# Check connection
print(f"Connected: {w3.is_connected()}")

# Get latest block
block = w3.eth.get_block('latest')
print(f"Block: {block.number}")
```

---

## Supported Networks

### EVM Chains

| Network | Chain ID | Status |
|---------|----------|--------|
| Ethereum Mainnet | 1 | 🟢 Live |
| Ethereum Sepolia | 11155111 | 🟢 Live |
| Polygon Mainnet | 137 | 🟢 Live |
| Polygon Mumbai | 80001 | 🟢 Live |
| Arbitrum One | 42161 | 🟢 Live |
| Optimism | 10 | 🟢 Live |
| Base | 8453 | 🟢 Live |
| BSC | 56 | 🟢 Live |

### Non-EVM

| Network | Status |
|---------|--------|
| Solana Mainnet | 🟢 Live |
| Solana Devnet | 🟢 Live |

---

## Pricing

| Plan | API Calls | Rate Limit | Price |
|------|-----------|------------|-------|
| **Free Trial** | 100K/month | 10 req/sec | $0 (7 days) |
| **Pro** | 10M/month | 100 req/sec | $49/month |
| **Enterprise** | Unlimited | Custom | Contact us |

---

## Project Structure

```
0xinfra/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities
│   └── index.html
├── server/                 # Express backend
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Database operations
│   ├── emailAuth.ts        # Authentication
│   └── index.ts            # Server entry
├── shared/                 # Shared types
│   └── schema.ts           # Drizzle schema
└── package.json
```

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/0xinfra.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m "Add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with 💚 by the 0xinfra team**

[Website](https://0xinfra.online) · [Twitter](https://twitter.com/0xinfra) · [Discord](https://discord.gg/0xinfra)

</div>
