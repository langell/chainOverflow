/**
 * IPFS Service Layer - Supports Mock and Pinata Implementations
 */

interface IPFSObject {
  cid: string
  content: string
  timestamp: number
}

// ---------------------------------------------------------
// 1. Mock Implementation
// ---------------------------------------------------------
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

const mockProvider = {
  upload: async (content: string): Promise<string> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    const randomStr = Math.random().toString(36).substring(2, 12)
    const cid = `Qm${randomStr}${Date.now().toString(36)}`
    mockIPFSNetwork[cid] = { cid, content, timestamp: Date.now() }
    saveNetwork()
    return cid
  },
  fetch: async (cid: string): Promise<string | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockIPFSNetwork[cid]?.content || null
  },
  search: async (query: string): Promise<string[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const term = query.toLowerCase()
    return Object.values(mockIPFSNetwork)
      .filter((obj) => obj.content.toLowerCase().includes(term))
      .map((obj) => obj.cid)
  }
}

// ---------------------------------------------------------
// 2. Pinata Implementation
// ---------------------------------------------------------
const pinataProvider = {
  upload: async (content: string): Promise<string> => {
    const jwt = import.meta.env.VITE_PINATA_JWT
    if (!jwt) throw new Error('Pinata JWT is not configured')

    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`
      },
      body: JSON.stringify({
        pinataContent: { text: content },
        pinataMetadata: { name: `ChainOverflow_${Date.now()}` }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Pinata upload failed: ${error.error || response.statusText}`)
    }

    const data = await response.json()
    return data.IpfsHash
  },
  fetch: async (cid: string): Promise<string | null> => {
    const gateway = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
    try {
      const response = await fetch(`${gateway}/ipfs/${cid}`)
      if (!response.ok) return null
      const data = await response.json()
      return data.text || JSON.stringify(data)
    } catch (e) {
      console.error('IPFS Fetch Error:', e)
      return null
    }
  },
  search: async (query: string): Promise<string[]> => {
    /**
     * Note: Pinata does not provide a full-text search index for file content.
     * Real-world dApps use Indexing Layers (The Graph) or a separate database.
     * For now, we fall back to searching our local mock network to show UI functionality.
     */
    return mockProvider.search(query)
  }
}

// ---------------------------------------------------------
// 3. Export Logic
// ---------------------------------------------------------
const getActiveProvider = () => {
  const PROVIDER = import.meta.env.VITE_IPFS_PROVIDER || 'mock'
  return PROVIDER === 'pinata' ? pinataProvider : mockProvider
}

export const uploadToIPFS = (content: string) => getActiveProvider().upload(content)
export const fetchFromIPFS = (cid: string) => getActiveProvider().fetch(cid)
export const searchIPFSIndexer = (query: string) => getActiveProvider().search(query)

export const getIPFSUrl = (hash: string): string => {
  const gateway = import.meta.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud'
  return `${gateway}/ipfs/${hash}`
}
