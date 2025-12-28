import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from '../store/useStore'

// Mock the IPFS service to avoid network/latency in store tests
vi.mock('../services/ipfs', () => ({
  uploadToIPFS: vi.fn().mockResolvedValue('QmTest123'),
  searchIPFSIndexer: vi.fn().mockResolvedValue(['QmTest123']),
  getIPFSUrl: vi.fn().mockReturnValue('https://ipfs.io/ipfs/QmTest123')
}))

describe('Zustand Store', () => {
  beforeEach(() => {
    // Reset store before each test
    // We can't easily reset a persisted store without clearing localStorage or using a helper
    localStorage.clear()
    // Trigger a fresh state - this is a bit hacky for persist middleware but works for basic tests
    useStore.setState({
      questions: [],
      account: null,
      isModalOpen: false,
      isUploading: false,
      searchQuery: '',
      searchResults: null
    })
  })

  it('should initialize with empty state (after reset)', () => {
    const state = useStore.getState()
    expect(state.questions.length).toBe(0)
    expect(state.account).toBeNull()
  })

  it('should toggle the modal', () => {
    const { setIsModalOpen } = useStore.getState()
    setIsModalOpen(true)
    expect(useStore.getState().isModalOpen).toBe(true)
    setIsModalOpen(false)
    expect(useStore.getState().isModalOpen).toBe(false)
  })

  it('should set an account', () => {
    const { setAccount } = useStore.getState()
    setAccount('0x123')
    expect(useStore.getState().account).toBe('0x123')
  })

  it('should add a question and upload to IPFS', async () => {
    const { addQuestion } = useStore.getState()
    const questionData = {
      title: 'Test Title',
      tags: 'test tags',
      bounty: '1 ETH',
      content: 'Test Content'
    }

    await addQuestion(questionData)

    const state = useStore.getState()
    expect(state.questions.length).toBe(1)
    expect(state.questions[0].title).toBe('Test Title')
    expect(state.questions[0].ipfsHash).toBe('QmTest123')
    expect(state.isUploading).toBe(false)
  })

  it('should handle votes', () => {
    const { voteQuestion } = useStore.getState()
    // Add a dummy question directly to state for speed
    const dummyId = 999
    useStore.setState({
      questions: [
        {
          id: dummyId,
          title: 'Voter',
          content: '...',
          tags: [],
          author: 'abc',
          votes: 10,
          answers: 0,
          timestamp: 'now'
        }
      ]
    })

    voteQuestion(dummyId, 1)
    expect(useStore.getState().questions[0].votes).toBe(11)

    voteQuestion(dummyId, -1)
    expect(useStore.getState().questions[0].votes).toBe(10)
  })

  it('should execute search and update results', async () => {
    const { executeSearch } = useStore.getState()

    // Setup state with a question matching the mock hash
    useStore.setState({
      questions: [
        {
          id: 1,
          title: 'Match',
          content: 'Content',
          tags: [],
          author: 'me',
          votes: 0,
          answers: 0,
          timestamp: 'now',
          ipfsHash: 'QmTest123'
        }
      ]
    })

    await executeSearch('query')

    expect(useStore.getState().searchResults).toEqual([1])
  })

  it('should seed large data', async () => {
    const { seedLargeData } = useStore.getState()
    await seedLargeData(5)

    expect(useStore.getState().questions.length).toBe(5)
    // Verify one of the titles contains a topic
    expect(useStore.getState().questions[0].title).toMatch(/scaling research paper/)
  })

  describe('connectWallet', () => {
    it('should connect wallet successfully', async () => {
      const mockRequest = vi.fn().mockResolvedValue(['0xWallet'])
      vi.stubGlobal('window', { ethereum: { request: mockRequest } })

      const { connectWallet } = useStore.getState()
      await connectWallet()

      expect(mockRequest).toHaveBeenCalledWith({ method: 'eth_requestAccounts' })
      expect(useStore.getState().account).toBe('0xWallet')

      vi.unstubAllGlobals()
    })

    it('should alert if wallet is missing', async () => {
      vi.stubGlobal('window', { ethereum: undefined })
      vi.stubGlobal('alert', vi.fn())

      const { connectWallet } = useStore.getState()
      await connectWallet()

      expect(alert).toHaveBeenCalledWith('Please install MetaMask or another Web3 wallet!')

      vi.unstubAllGlobals()
    })
  })
})
