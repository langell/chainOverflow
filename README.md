# ⛓️ ChainOverflow

**The Knowledge Engine of Web3 Development.**

ChainOverflow is a decentralized Q&A protocol where developers share expertise and earn on-chain reputation through transparency and decentralized storage.

## 🚀 Quick Start

1. **Install Dependencies**: `npm install`
2. **Run Dev Server**: `npm run dev`
3. **Run Tests**: `npm run test`

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

- **Decentralized Storage**: All question content is pinned to a mock IPFS network with persistent CIDs.
- **Deep Search**: Search through question metadata and content buried in the decentralized network.
- **Democratic Voting**: A reactive upvote/downvote system.
- **Persistent State**: Your wallet connection and questions survive page refreshes.
- **Premium Design**: Built with modern CSS, glassmorphism, and responsive layouts.
