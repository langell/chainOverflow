# ⛓️ ChainOverflow

**The Knowledge Engine of Web3 Development.**

ChainOverflow is a Q&A protocol where developers share expertise and earn through on-chain bounties and **x402-powered monetization**. Built for speed and transparency, it combines the best of Web2 performance with Web3 trust.

## 🚀 Quick Start

1.  **Install Dependencies**: `npm run setup`
2.  **Start All Layers**: `npm run dev:all`
    - Starts Hardhat (localhost:8545), Express Server (3001), and Vite (5173).
3.  **Deploy Locally**: `npm run deploy:local` (in a separate terminal)
4.  **Seed Data**: `npm run db:seed`

## 🏗️ Technical Architecture

ChainOverflow is built across three primary layers:

### 1. Smart Contracts (`/contracts`)

The protocol logic for on-chain bounties and vault management.

- **Framework**: Hardhat
- **Network**: Local or Base Sepolia
- **Key Commands**:
  - `npm run compile`: Compile Solidity contracts.
  - `npm run dev:node`: Start local Ethereum node.
  - `npm run deploy:local`: Deploy to localhost.
  - `npm run deploy:base-sepolia`: Deploy to Base Sepolia testnet.

### 2. Backend Server (`/server`)

An Express-based L402-enabled gateway and database.

- **Tech Stack**: TypeScript, Express, SQLite, L402 (Lightning Payments).
- **Key Commands**:
  - `npm run dev:server`: Start backend with hot reload.
  - `npm run db:seed`: Reset and seed the local database.
  - `npm run test:server`: Run server-side unit/integration tests.

### 3. Frontend Web (`/src`)

A modern React application with Web3 integration.

- **Tech Stack**: React 19, TypeScript, Vite, Zustand, Tailwind/CSS Modules.
- **Key Commands**:
  - `npm run dev`: Start frontend dev server.
  - `npm run test`: Run frontend tests.

## 🛠️ Full CLI Reference

| Command            | Layer    | Description                                           |
| :----------------- | :------- | :---------------------------------------------------- |
| `npm run setup`    | Root     | Installs all packages across root and server folders. |
| `npm run dev:all`  | Full App | Starts Web, Server, and Chain node concurrently.      |
| `npm run test:all` | Testing  | Runs both frontend and backend test suites.           |
| `npm run lint`     | General  | Lints the entire codebase.                            |
| `npm run format`   | General  | Formats all files with Prettier.                      |

## 📖 Documentation

Detailed information about the platform can be found in the `docs` folder:

- [**System Architecture**](./docs/ARCHITECTURE.md) - High-level overview.
- [**Deployment Architecture**](./docs/DEPLOYMENT.md) - Real-world production roadmap.
- [**Hosting Alternatives**](./docs/HOSTING_ALTERNATIVES.md) - Comparison with Cloudflare and more.
- [**Vercel Setup Guide**](./docs/VERCEL_SETUP.md) - Automated zero-barrier hosting.
- [**State Management**](./docs/STATE_MANAGEMENT.md) - How we handle global data with Zustand.
- [**IPFS & Indexing**](./docs/IPFS_INTEGRATION.md) - Decentralized storage and deep search.
- [**Component Library**](./docs/COMPONENTS.md) - Overview of our React components.

## 🚢 Deployment

- **GitHub Actions**: Automate testing and linting.
- **Vercel**: Automatically deploys the frontend on every push. See [**VERCEL_SETUP.md**](./docs/VERCEL_SETUP.md) for $0 setup.

### 1. Vercel (Zero-Barrier Choice)

- **Workflow**: Automated GitHub deployments with zero configuration or cost.
- **Setup Guide**: See [**VERCEL_SETUP.md**](./docs/VERCEL_SETUP.md) for instructions.

### 2. 4EVERLAND (Web3 Choice)

- **Mechanism**: Supports IPFS, Arweave, and BNB Greenfield.
- **Requires**: Small gas payment (Polygon MATIC) to activate API tokens.
- **Decentralized Alternatives**: See [**HOSTING_ALTERNATIVES.md**](./docs/HOSTING_ALTERNATIVES.md) for providers like 4EVERLAND or Fleek.

## ✨ Key Features

- **x402 Monetization**: Integrated with the `@coinbase/x402` protocol to enable programmatic payments and L402-gated access to premium knowledge.
- **High-Speed Storage**: Questions and answers are stored in a performant centralized database to ensure sub-millisecond search and retrieval, avoiding the latency of decentralized storage.
- **On-Chain Bounties**: Trustless fund management and bounty distribution using Solidty smart contracts on the Base network.
- **Democratic Voting**: A reactive upvote/downvote system for reputation.
- **Premium Design**: Built with modern CSS, glassmorphism, and responsive layouts.
