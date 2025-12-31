import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useStore } from '../store/useStore'

// Mock the IPFS service to avoid network/latency in store tests
vi.mock('../services/ipfs', () => ({
  uploadToIPFS: vi.fn().mockResolvedValue('QmTest123'),
  searchIPFSIndexer: vi.fn().mockResolvedValue(['QmTest123']),
  getIPFSUrl: vi.fn().mockReturnValue('https://ipfs.io/ipfs/QmTest123')
}))

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Zustand Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset store before each test
    // We can't easily reset a persisted store without clearing localStorage or using a helper
    localStorage.clear()
    // Default mock response
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        })
      }
      if (url.includes('/api/questions')) {
        return Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 123, ipfsHash: 'QmTest123' })
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    })

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
    const { addQuestion, setAccount } = useStore.getState()
    setAccount('tester')

    // Mock feed to return the question after addQuestion calls it
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/feed')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                id: 123,
                title: 'Test Title',
                content: 'Test Content',
                tags: 'test,tags',
                author: 'tester',
                votes: 0,
                bounty: '1 ETH',
                timestamp: 'now',
                ipfsHash: 'QmTest123'
              }
            ])
        })
      }
      return Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: 123, ipfsHash: 'QmTest123' })
      })
    })

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

  it('should handle L402 payment retry logic', async () => {
    const { addQuestion, setAccount } = useStore.getState()
    setAccount('tester')

    let calls = 0
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/questions')) {
        calls++
        if (calls === 1) {
          return Promise.resolve({
            status: 402,
            ok: false,
            json: () =>
              Promise.resolve({
                message: 'Payment Required',
                invoice: 'lnbc...',
                macaroon: 'mock-mac'
              })
          })
        }
        return Promise.resolve({
          status: 201,
          ok: true,
          json: () => Promise.resolve({ id: 123, ipfsHash: 'QmTest' })
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    })

    const questionData = {
      title: 'Paid Q',
      tags: 'tags',
      bounty: '10',
      content: 'Content'
    }

    await addQuestion(questionData)

    expect(calls).toBe(2) // Initial + Retry
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/questions'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: expect.stringContaining('L402 mock-mac:')
        })
      })
    )
  })

  it('should fetch a specific question and its answers', async () => {
    const { fetchQuestion } = useStore.getState()

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          title: 'Single Q',
          content: 'Content',
          tags: 't1,t2',
          author: 'me',
          votes: 10,
          bounty: '5',
          timestamp: 'now',
          answers: [
            {
              id: 10,
              question_id: 1,
              content: 'Ans 1',
              author: 'him',
              votes: 2,
              is_accepted: 1,
              timestamp: 'then'
            }
          ]
        })
    })

    await fetchQuestion(1)

    const state = useStore.getState()
    const q = state.questions.find((q) => q.id === 1)
    expect(q).toBeDefined()
    expect(q?.title).toBe('Single Q')
    expect(q?.tags).toEqual(['t1', 't2'])

    const a = state.answers.find((ans) => ans.id === 10)
    expect(a).toBeDefined()
    expect(a?.isAccepted).toBe(true)
  })

  it('should add an answer via API', async () => {
    const { addAnswer, setAccount } = useStore.getState()
    setAccount('expert')

    mockFetch.mockResolvedValue({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: 99, message: 'Success' })
    })

    await addAnswer(1, 'Great Solution')

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/answers'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('should handle answer votes', () => {
    const { voteAnswer } = useStore.getState()
    const dummyId = 55
    useStore.setState({
      answers: [
        {
          id: dummyId,
          questionId: 1,
          content: '...',
          author: 'a',
          votes: 0,
          timestamp: 'now',
          isAccepted: false
        }
      ]
    })

    voteAnswer(dummyId, 1)
    expect(useStore.getState().answers[0].votes).toBe(1)
  })

  it('should mark answer as accepted', () => {
    const { markAnswerAccepted } = useStore.getState()
    const qId = 1
    const aId = 10
    useStore.setState({
      answers: [
        {
          id: aId,
          questionId: qId,
          content: '...',
          author: 'a',
          votes: 0,
          timestamp: 'now',
          isAccepted: false
        },
        {
          id: 11,
          questionId: qId,
          content: '...',
          author: 'b',
          votes: 0,
          timestamp: 'now',
          isAccepted: false
        }
      ]
    })

    markAnswerAccepted(qId, aId)
    const state = useStore.getState()
    expect(state.answers.find((a) => a.id === aId)?.isAccepted).toBe(true)
    expect(state.answers.find((a) => a.id === 11)?.isAccepted).toBe(false)
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
