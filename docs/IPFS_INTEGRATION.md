# IPFS & Indexing Integration

ChainOverflow integrates with a simulated IPFS network to ensure data is handled in a decentralized-first manner.

## IPFS Service (`src/services/ipfs.ts`)

In this demonstrator, the IPFS service simulates the core behavior of a decentralized file system:

### Content Addressing (CIDs)
When content is uploaded via `uploadToIPFS`, it is assigned a **CID (Content Identifier)** based on its hash. This CID is used as the unique key for retrieving the data from the network.

### Persistent Network Storage
The "mock network" is persisted in `localStorage`. This means any data "pinned" to the network remains available even if the browser is restarted, simulating a permanent decentralized record.

## Search Indexing

Searching decentralized data is challenging because content is hidden behind CIDs. ChainOverflow solves this using a **Deep Search** strategy:

1. **Metadata Search**: Instantly filters titles and tags stored in the local state.
2. **Indexer Search**: Asynchronously queries the IPFS service (`searchIPFSIndexer`) to find keyword matches within the actual content bodies stored on the network.
3. **Combined Filtering**: The application merges these results to provide a comprehensive search experience.

## View on Gateway
Every question card provides a direct link to a public IPFS gateway (e.g., Pinata). While this is a mock implementation, it points to real gateway URLs to demonstrate how production dApps bridge IPFS and the web.
