/**
 * Mock IPFS service for demonstration purposes.
 * In a real application, this would use Pinata, Infura, or a local IPFS node.
 */

export const uploadToIPFS = async (content: string): Promise<string> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Generate a mock CID (Content Identifier)
    // Real CIDs usually start with 'Qm' (v0) or 'ba' (v1)
    const randomStr = Math.random().toString(36).substring(2, 12)
    return `Qm${randomStr}mockCID${Date.now().toString(36)}`
}

export const getIPFSUrl = (hash: string): string => {
    return `https://gateway.pinata.cloud/ipfs/${hash}`
}
