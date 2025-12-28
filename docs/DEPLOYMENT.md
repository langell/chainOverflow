# Deployment Architecture

To transition ChainOverflow from a demonstration environment to a "real-world" production environment, the following decentralized deployment architecture is recommended.

## 🏗️ Production Tech Stack

| Layer | Component | Production Replacement |
|-------|-----------|------------------------|
| **Frontend** | Vite + React | Deployed to **4EVERLAND** (IPFS/Arweave) |
| **Storage** | Mock IPFS | Real IPFS via **Pinata** or **NFT.Storage** |
| **Logic/State** | Zustand (Local) | **Smart Contracts** (Solidity) on Polygon/Arbitrum |
| **Indexing** | Local Search | **The Graph** (Subgraphs) for deep content indexing |
| **Identity** | Mock Wallet | **WalletConnect** / **RainbowKit** |

## 🌐 Decentralized Workflow

### 1. Content Publication
- User writes a question.
- Question content is uploaded to **IPFS** via a pinning service (Pinata).
- The resulting **CID** is sent to a **Smart Contract** on-chain along with titles/tags.
- This ensures content is permanent and verifiable while keeping on-chain data costs low.

### 2. Deep Search & Indexing
- **The Graph** monitors the Smart Contract events.
- It fetches the content from IPFS using the CIDs and indexes it into a searchable GraphQL database.
- The frontend queries the **Subgraph** instead of filtering local state, allowing for millions of searchable entries.

## 📦 Deployment Strategy

### Continuous Integration (CI/CD)
- **GitHub Actions**: Automate testing and linting.
- **4EVERLAND**: Automatically deploys the frontend to IPFS directly on every merge to `main`. See [**4EVERLAND_SETUP.md**](./4EVERLAND_SETUP.md) for free-tier configuration.

### Environment Configuration
Production requires a `.env` file for:
- `VITE_PINATA_API_KEY`
- `VITE_CONTRACT_ADDRESS`
- `VITE_SUBGRAPH_URL`

## 🛠️ Step-by-Step Transition Plan

1. **Phase 1: Real IPFS**: Swap the `mockIPFSNetwork` for the Pinata API.
2. **Phase 2: Smart Contracts**: Replace the `addQuestion` store action with a contract call.
3. **Phase 3: The Graph**: Set up a subgraph to replace the store's `questions` array with live chain data.
4. **Phase 4: Global CDN**: Point `chainoverflow.eth` (ENS) to the 4EVERLAND IPFS deployment.
