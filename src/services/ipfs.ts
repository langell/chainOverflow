/**
 * Advanced Mock IPFS & Indexing Service with Local Cache Persistence
 */

interface IPFSObject {
    cid: string
    content: string
    timestamp: number
}

// Simulated IPFS Network Storage with LocalStorage Persistence
const STORAGE_KEY = 'chainoverflow_ipfs_mock'

const loadNetwork = (): Record<string, IPFSObject> => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        return saved ? JSON.parse(saved) : {}
    } catch {
        return {}
    }
}

let mockIPFSNetwork: Record<string, IPFSObject> = loadNetwork()

const saveNetwork = () => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockIPFSNetwork))
    } catch (e) {
        console.error('Failed to save IPFS network to localStorage', e)
    }
}

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

    saveNetwork()

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
