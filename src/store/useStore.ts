import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Question, Answer } from '../types'
import { uploadToIPFS, searchIPFSIndexer } from '../services/ipfs'

const API_BASE = 'http://localhost:3001/api'

interface AppState {
  questions: Question[]
  answers: Answer[] // New: Store answers
  account: string | null
  isModalOpen: boolean
  isUploading: boolean
  searchQuery: string
  isSearching: boolean
  searchResults: number[] | null
  isLoading: boolean

  // Actions
  fetchFeed: () => Promise<void>
  fetchQuestion: (id: number) => Promise<void>
  setAccount: (account: string | null) => void
  setIsModalOpen: (isOpen: boolean) => void
  setSearchQuery: (query: string) => void
  executeSearch: (query: string) => Promise<void>
  addQuestion: (data: {
    title: string
    tags: string
    bounty: string
    content: string
  }) => Promise<void>
  voteQuestion: (id: number, delta: number) => void
  connectWallet: () => Promise<void>
  seedLargeData: (count: number) => Promise<void>

  // Answer Actions
  addAnswer: (questionId: number, content: string) => Promise<void>
  voteAnswer: (id: number, delta: number) => void
  markAnswerAccepted: (questionId: number, answerId: number) => void

  // Internal Helpers
  requestWithPayment: (path: string, options?: RequestInit) => Promise<any>
}

const INITIAL_QUESTIONS: Question[] = [
  {
    id: 1,
    title: 'How do I optimize loops in Solidity to avoid out-of-gas errors?',
    content:
      'I have a large array that I iterate over, and I keep hitting gas limits. What are the best practices for batching or off-chain computation?',
    tags: ['solidity', 'gas-optimization', 'evm'],
    author: 'vitalik.eth',
    votes: 42,
    answers: 2,
    bounty: '0.5 ETH',
    timestamp: '2h ago',
    ipfsHash: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
  },
  {
    id: 2,
    title: 'Difference between Transparent vs UUPS proxy patterns?',
    content: 'Thinking about upgradeability for my next project. Which one is safer/cheaper?',
    tags: ['proxies', 'upgradeability', 'security'],
    author: 'open_zeppelin.eth',
    votes: 28,
    answers: 1,
    timestamp: '5h ago',
    ipfsHash: 'QmT5NvUtoM5nWFfrQdVrFzGfCu9Ab1QYMD8yV7JkDvJp99'
  }
]

const INITIAL_ANSWERS: Answer[] = [
  {
    id: 101,
    questionId: 1,
    content:
      'You should avoid iterating over unbounded arrays in your transactions. Instead, consider using a **pagination** pattern where you process a chunk of the array at a time.\n\nAlternatively, move the computation off-chain and verify the result on-chain using a Merkle Proof or ZK-SNARK if applicable.',
    author: 'gavin.eth',
    votes: 15,
    timestamp: '1h ago',
    isAccepted: true
  },
  {
    id: 102,
    questionId: 1,
    content:
      'Check out the "Pull over Push" payment pattern as well. If this is for distributing rewards, let users claim them instead of sending to everyone in a loop.',
    author: 'andreas.eth',
    votes: 8,
    timestamp: '30m ago'
  },
  {
    id: 103,
    questionId: 2,
    content:
      'UUPS is generally cheaper to deploy because the upgrade logic is in the implementation contract, not the proxy. However, it carries a risk: if you deploy a broken implementation that lacks the upgrade logic, you brick the contract forever.',
    author: 'sam.eth',
    votes: 12,
    timestamp: '4h ago'
  }
]

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      questions: INITIAL_QUESTIONS,
      answers: INITIAL_ANSWERS,
      account: null,
      isModalOpen: false,
      isUploading: false,
      searchQuery: '',
      isSearching: false,
      searchResults: null,
      isLoading: false,

      fetchFeed: async () => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${API_BASE}/feed`)
          const data = await response.json()

          // Transform backend data to frontend types
          const questions: Question[] = data.map((q: any) => ({
            id: q.id,
            title: q.title,
            content: q.content,
            tags: typeof q.tags === 'string' ? q.tags.split(',').filter(Boolean) : q.tags || [],
            author: q.author,
            votes: q.votes,
            bounty: q.bounty,
            timestamp: q.timestamp,
            ipfsHash: q.ipfsHash,
            answers: q.answers ? q.answers.length : 0
          }))

          const answers: Answer[] = data.flatMap((q: any) =>
            (q.answers || []).map((a: any) => ({
              id: a.id,
              questionId: a.question_id,
              content: a.content,
              author: a.author,
              votes: a.votes,
              timestamp: a.timestamp,
              isAccepted: Boolean(a.is_accepted)
            }))
          )

          set({ questions, answers, isLoading: false })
        } catch (error) {
          console.error('Failed to fetch feed:', error)
          set({ isLoading: false })
        }
      },

      fetchQuestion: async (id: number) => {
        set({ isLoading: true })
        try {
          const response = await fetch(`${API_BASE}/questions/${id}`)
          if (!response.ok) throw new Error('Question not found')
          const q = await response.json()

          // Transform backend data
          const question: Question = {
            id: q.id,
            title: q.title,
            content: q.content,
            tags: typeof q.tags === 'string' ? q.tags.split(',').filter(Boolean) : q.tags || [],
            author: q.author,
            votes: q.votes,
            bounty: q.bounty,
            timestamp: q.timestamp,
            ipfsHash: q.ipfsHash,
            answers: q.answers ? q.answers.length : 0
          }

          const questionAnswers: Answer[] = (q.answers || []).map((a: any) => ({
            id: a.id,
            questionId: a.question_id,
            content: a.content,
            author: a.author,
            votes: a.votes,
            timestamp: a.timestamp,
            isAccepted: Boolean(a.is_accepted)
          }))

          // Update local state: merge existing answers, update question
          const { questions, answers } = get()
          const otherQuestions = questions.filter((prev) => prev.id !== id)
          const otherAnswers = answers.filter((prev) => prev.questionId !== id)

          set({
            questions: [question, ...otherQuestions],
            answers: [...otherAnswers, ...questionAnswers],
            isLoading: false
          })
        } catch (error) {
          console.error('Failed to fetch question:', error)
          set({ isLoading: false })
        }
      },

      setAccount: (account) => set({ account }),

      setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

      setSearchQuery: (query) => {
        set({ searchQuery: query })
        if (query.length > 2) {
          get().executeSearch(query)
        } else {
          set({ searchResults: null })
        }
      },

      executeSearch: async (query) => {
        set({ isSearching: true })
        try {
          const matchingCIDs = await searchIPFSIndexer(query)
          const { questions } = get()
          const matchingIds = questions
            .filter((q) => q.ipfsHash && matchingCIDs.includes(q.ipfsHash))
            .map((q) => q.id)
          set({ searchResults: matchingIds, isSearching: false })
        } catch (error) {
          console.error('Search failed', error)
          set({ isSearching: false })
        }
      },

      voteQuestion: (id, delta) => {
        const { questions } = get()
        const updatedQuestions = questions.map((q) =>
          q.id === id ? { ...q, votes: q.votes + delta } : q
        )
        set({ questions: updatedQuestions })
      },

      addQuestion: async (data) => {
        const { account } = get()
        set({ isUploading: true })
        try {
          // 1. Upload to IPFS (Simulated/Mock)
          const ipfsHash = await uploadToIPFS(data.content)

          // 2. Post to Backend with Payment Handling
          await get().requestWithPayment('/questions', {
            method: 'POST',
            body: JSON.stringify({
              title: data.title,
              content: data.content,
              tags: data.tags,
              author: account || 'anonymous',
              bounty: data.bounty,
              ipfsHash
            })
          })

          // 3. Refresh feed from DB
          await get().fetchFeed()
          set({ isModalOpen: false, isUploading: false })
        } catch (error) {
          console.error('Add Question failed:', error)
          set({ isUploading: false })
          alert(error instanceof Error ? error.message : 'Failed to add question')
        }
      },

      requestWithPayment: async (path: string, options: RequestInit = {}) => {
        // Initial attempt
        let response = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers: {
            ...options.headers,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 402) {
          const data = await response.json()
          console.log('L402 ETH Payment Required', data)

          const { payTo, price, macaroon } = data

          if (!window.ethereum) {
            throw new Error('MetaMask required for ETH L402 payments')
          }

          // 1. Prompt user for ETH payment
          const from = get().account
          if (!from) {
            await get().connectWallet()
          }

          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
          const sender = accounts[0]

          console.log(`Requesting payment of ${price} Wei to ${payTo}`)

          try {
            // 2. Execute ETH transaction
            const txHash = await window.ethereum.request({
              method: 'eth_sendTransaction',
              params: [
                {
                  from: sender,
                  to: payTo,
                  value: BigInt(price).toString(16) // Convert to hex for standard RPC
                }
              ]
            })

            console.log('Payment successful, TX Hash:', txHash)

            // 3. Retry with Authorization header using txHash as proof
            response = await fetch(`${API_BASE}${path}`, {
              ...options,
              headers: {
                ...options.headers,
                'Content-Type': 'application/json',
                Authorization: `L402 ${macaroon}:${txHash}`
              }
            })
          } catch (err) {
            console.error('Payment failed or cancelled', err)
            throw new Error('Payment required to complete this action.')
          }
        }

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Request failed' }))
          throw new Error(err.error || `Request failed with ${response.status}`)
        }

        return response.json()
      },

      connectWallet: async () => {
        if (typeof window.ethereum !== 'undefined') {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
            set({ account: accounts[0] })
          } catch (error) {
            console.error('User denied account access', error)
          }
        } else {
          alert('Please install MetaMask or another Web3 wallet!')
        }
      },

      seedLargeData: async (count) => {
        const { questions } = get()
        const newQuestions: Question[] = []
        for (let i = 0; i < count; i++) {
          const topic = ['DeFi', 'NFT', 'DAO', 'Bridge', 'L2', 'ZK'][Math.floor(Math.random() * 6)]
          const content = `Massive data sample #${i}: Discussing the future of ${topic} protocols.`
          const cid = await uploadToIPFS(content)
          newQuestions.push({
            id: Date.now() + i,
            title: `${topic} scaling research paper #${i}`,
            content,
            tags: [topic.toLowerCase(), 'scaling', 'research'],
            author: `researcher_${i}.eth`,
            votes: Math.floor(Math.random() * 100),
            answers: 0,
            timestamp: `${Math.floor(Math.random() * 24)}h ago`,
            ipfsHash: cid
          })
        }
        set({ questions: [...newQuestions, ...questions] })
      },

      // Answer Logic
      addAnswer: async (questionId, content) => {
        const { account } = get()
        set({ isLoading: true })
        try {
          await get().requestWithPayment('/answers', {
            method: 'POST',
            body: JSON.stringify({
              questionId,
              content,
              author: account || 'anonymous'
            })
          })

          await get().fetchFeed()
        } catch (error) {
          console.error('Add Answer failed:', error)
          alert(error instanceof Error ? error.message : 'Failed to post answer')
        } finally {
          set({ isLoading: false })
        }
      },

      voteAnswer: (id, delta) => {
        const { answers } = get()
        const updatedAnswers = answers.map((a) =>
          a.id === id ? { ...a, votes: a.votes + delta } : a
        )
        set({ answers: updatedAnswers })
      },

      markAnswerAccepted: (questionId, answerId) => {
        const { answers } = get()
        // Ensure only one accepted answer per question? Use logic here if needed.
        const updatedAnswers = answers.map((a) => {
          if (a.questionId === questionId) {
            // Uncheck others if we want single-select
            if (a.id === answerId) return { ...a, isAccepted: true }
            return { ...a, isAccepted: false }
          }
          return a
        })
        set({ answers: updatedAnswers })
      }
    }),
    {
      name: 'chainoverflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        questions: state.questions,
        answers: state.answers,
        account: state.account
      })
    }
  )
)
