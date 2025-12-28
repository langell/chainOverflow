# IPFS & Indexing Integration

ChainOverflow supports both a **Mock IPFS** implementation for local development and direct integration with **Pinata** for real-world decentralized storage.

## 🏗️ Dual-Provider System (`src/services/ipfs.ts`)

The application can toggle between storage implementations using an environment variable in your `.env` file:

```bash
VITE_IPFS_PROVIDER=mock   # Uses localStorage persistence
# OR
VITE_IPFS_PROVIDER=pinata # Uses real Pinata API
```

### 1. Mock Implementation

The mock network is persisted in `localStorage`. This is ideal for development and testing without needing API keys or blockchain activation.

- **Uploads**: Simulate network latency.
- **Search**: Scans the mock network for content keyword matches.

### 2. Pinata Implementation

When enabled, the app communicates directly with Pinata's global IPFS network.

- **API**: Uses the `pinJSONToIPFS` endpoint.
- **Requirements**: Requires a `VITE_PINATA_JWT` in your `.env`.
- **Latency**: Real-world network speeds.

## 🔑 Pinata Setup

1. Create a free account at [Pinata.cloud](https://pinata.cloud).
2. Go to **API Keys** and create a new **Secret Key** with `Admin` permissions.
3. Copy the **JWT** (long token).
4. Add it to your `.env`:
   ```bash
   VITE_IPFS_PROVIDER=pinata
   VITE_PINATA_JWT=your_full_jwt_here
   ```

## 🔍 Search & Indexing Strategy

Searching decentralized data is challenging because content is hidden behind CIDs. ChainOverflow solves this using a **Two-Stage Search**:

1. **Metadata Filter**: Instantly filters titles and tags stored in the application state (Zustand).
2. **Indexer Search**: Queries the IPFS service to scan content bodies.
   - _Note: In "Pinata" mode, the indexer currently falls back to the mock indexer or local metadata, as real-time content indexing for IPFS usually requires a Subgraph (The Graph)._

## 🌐 Public Gateways

Every question card provides a link to a public gateway CID. In Pinata mode, these links point to real data that anyone in the world can resolve via the InterPlanetary File System.
