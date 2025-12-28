/**
 * Advanced Mock IPFS & Indexing Service
 * 
 * In a production dApp, searching IPFS content usually involves:
 * 1. Storage: Uploading JSON to IPFS (Metadata + Content)
 * 2. Indexering: A service (like The Graph or a custom node) monitors CIDs 
 *    and indexes their contents into a searchable database.
 */

interface IPFSObject {
    cid: string
    content: string
    timestamp: number
}

// Simulated IPFS Network Storage
const mockIPFSNetwork: Record<string, IPFSObject> = {}

/**
 * Uploads content to simulated IPFS.
 * Returns a CID.
 */
export const uploadToIPFS = async (content: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 600))

    const randomStr = Math.random().toString(36).substring(2, 12)
    const cid = `Qm${randomStr}${Date.now().toString(36)}`

    mockIPFSNetwork[cid] = {
        cid,
        content,
        timestamp: Date.now()
    }

    return cid
}

/**
 * Fetches content from simulated IPFS.
 */
export const fetchFromIPFS = async (cid: string): Promise<string | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockIPFSNetwork[cid]?.content || null
}

/**
 * Mock Global Indexer
 * Simulates searching through a massive decentralized dataset.
 * In reality, this would be a query to a Subgraph or an API.
 */
export const searchIPFSIndexer = async (query: string): Promise<string[]> => {
    // Simulate heavy indexing search
    await new Promise((resolve) => setTimeout(resolve, 400))

    const term = query.toLowerCase()
    return Object.values(mockIPFSNetwork)
        .filter(obj => obj.content.toLowerCase().includes(term))
        .map(obj => obj.cid)
}

export const getIPFSUrl = (hash: string): string => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
}
