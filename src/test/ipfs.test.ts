import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { uploadToIPFS, fetchFromIPFS, searchIPFSIndexer } from '../services/ipfs'

describe('IPFS Service (Mock Mode)', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should upload content and return a CID', async () => {
    const content = 'Hello IPFS'
    const cid = await uploadToIPFS(content)
    expect(cid).toBeDefined()
    expect(cid.startsWith('Qm')).toBe(true)
  })

  it('should fetch content by CID', async () => {
    const content = 'Secret Message'
    const cid = await uploadToIPFS(content)
    const fetched = await fetchFromIPFS(cid)
    expect(fetched).toBe(content)
  })

  it('should return null for non-existent CID', async () => {
    const fetched = await fetchFromIPFS('non-existent')
    expect(fetched).toBeNull()
  })

  it('should search through stored content', async () => {
    await uploadToIPFS('Deep Learning')
    await uploadToIPFS('Machine Learning')
    await uploadToIPFS('Blockchain Tech')

    const results = await searchIPFSIndexer('learning')
    expect(results.length).toBe(2)
  })

  it('should persist to localStorage', async () => {
    const content = 'Persistent Data'
    const cid = await uploadToIPFS(content)

    // CID should be in localStorage
    const saved = localStorage.getItem('chainoverflow_ipfs_mock')
    expect(saved).toContain(content)
    expect(saved).toContain(cid)
  })
})

describe('IPFS Service (Pinata Mode)', () => {
  const mockJwt = 'test-jwt'

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    // @ts-expect-error - Mocking import.meta.env for test
    import.meta.env.VITE_IPFS_PROVIDER = 'pinata'
    // @ts-expect-error - Mocking import.meta.env for test
    import.meta.env.VITE_PINATA_JWT = mockJwt
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // @ts-expect-error - Resetting env var
    import.meta.env.VITE_IPFS_PROVIDER = 'mock'
  })

  it('should upload to Pinata successfully', async () => {
    // @ts-expect-error - Mocking fetch
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ IpfsHash: 'QmPinata123' })
    })

    const cid = await uploadToIPFS('Hello Pinata')

    expect(fetch).toHaveBeenCalledWith(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: `Bearer ${mockJwt}`
        })
      })
    )
    expect(cid).toBe('QmPinata123')
  })

  it('should throw error if Pinata upload fails', async () => {
    // @ts-expect-error - Mocking fetch error response
    fetch.mockResolvedValue({
      ok: false,
      statusText: 'Unauthorized',
      json: () => Promise.resolve({ error: 'Invalid Token' })
    })

    await expect(uploadToIPFS('content')).rejects.toThrow('Pinata upload failed: Invalid Token')
  })

  it('should fetch from Pinata gateway', async () => {
    const mockContent = { text: 'Gateway Content' }
    // @ts-expect-error - Mocking fetch success
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockContent)
    })

    const content = await fetchFromIPFS('QmGateway123')
    expect(content).toBe('Gateway Content')
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('QmGateway123'))
  })

  it('should return null if Pinata fetch fails', async () => {
    // @ts-expect-error - Mocking fetch failure
    fetch.mockResolvedValue({ ok: false })
    const content = await fetchFromIPFS('QmFail')
    expect(content).toBeNull()
  })
})
