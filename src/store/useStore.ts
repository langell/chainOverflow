import { create } from 'zustand'
import { ethers } from 'ethers'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Question, Answer } from '../types'
import { uploadToIPFS, searchIPFSIndexer } from '../services/ipfs'
import { logger } from '../utils/logger'

const API_BASE = '/api'
const BASE_SEPOLIA_CHAIN_ID = '0x14a34' // 84532
const HARDHAT_CHAIN_ID = '0x7a69' // 31337

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
  fetchFeed: (sort?: string) => Promise<void>
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

// Initial data removed to ensure production data is fetched from DB

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      questions: [],
      answers: [],
      account: null,
      isModalOpen: false,
      isUploading: false,
      searchQuery: '',
      isSearching: false,
      searchResults: null,
      isLoading: false,

      fetchFeed: async (sort?: string) => {
        set({ isLoading: true })
        try {
          const url = sort ? `${API_BASE}/feed?sort=${sort}` : `${API_BASE}/feed`
          const response = await fetch(url)
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
          logger.info({ msg: 'Feed fetched', count: questions.length, sort })
        } catch (error) {
          logger.error({ error, msg: 'Failed to fetch feed', sort })
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
          logger.info({ msg: 'Question fetched', id })
        } catch (error) {
          logger.error({ error, msg: 'Failed to fetch question', id })
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
          logger.info({ msg: 'Search executed', query, results: matchingIds.length })
        } catch (error) {
          logger.error({ error, msg: 'Search failed', query })
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
          logger.info({ msg: 'Question added', title: data.title })
        } catch (error) {
          logger.error({ error, msg: 'Add Question failed', data })
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
          logger.info({ data, msg: 'L402 ETH Payment Required' })

          const { payTo, price, macaroon, vaultAddress, method } = data

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

          // --- NEW: Network Switching Logic ---
          const isDev =
            window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          const targetChainId = isDev ? HARDHAT_CHAIN_ID : BASE_SEPOLIA_CHAIN_ID
          const currentChainId = await window.ethereum.request({ method: 'eth_chainId' })

          if (currentChainId !== targetChainId) {
            logger.info({
              msg: 'Requesting network switch',
              from: currentChainId,
              to: targetChainId
            })
            try {
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: targetChainId }]
              })
            } catch (switchError: any) {
              // This error code indicates that the chain has not been added to MetaMask.
              if (switchError.code === 4902) {
                logger.info({ msg: 'Adding Base Sepolia network to wallet' })
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [
                    {
                      chainId: BASE_SEPOLIA_CHAIN_ID,
                      chainName: 'Base Sepolia',
                      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
                      rpcUrls: ['https://sepolia.base.org'],
                      blockExplorerUrls: ['https://sepolia.basescan.org']
                    }
                  ]
                })
              } else {
                throw switchError
              }
            }
          }
          // -------------------------------------

          logger.info({
            msg: 'Requesting payment',
            price,
            strategy: vaultAddress ? 'Smart Contract' : 'Direct Transfer'
          })

          try {
            let txHash: string

            if (vaultAddress) {
              // Smart Contract Call Strategy
              const iface = new ethers.Interface([
                'function payForQuestion(string questionId) payable',
                'function payFee(string resourceId) payable'
              ])

              // Use a dummy ID if we don't have the final one yet,
              // or handle it based on path. For /questions, we might need the IPFS hash or similar.
              const resourceId = options.body
                ? JSON.parse(options.body as string).title || 'generic'
                : 'generic'
              const callData = iface.encodeFunctionData(method, [resourceId])

              logger.info({
                msg: 'Sending transaction to wallet',
                to: vaultAddress,
                value: price,
                method
              })
              txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: sender,
                    to: vaultAddress,
                    value: BigInt(price).toString(16),
                    data: callData
                  }
                ]
              })
            } else {
              // Direct Transfer Fallback
              logger.info({ msg: 'Sending direct transfer to wallet', to: payTo, value: price })
              txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                  {
                    from: sender,
                    to: payTo,
                    value: BigInt(price).toString(16)
                  }
                ]
              })
            }

            logger.info({ msg: 'Transaction submitted by user', txHash })

            // 3. Retry with Authorization header using txHash as proof
            logger.info({ msg: 'Retrying request with payment proof', txHash })
            response = await fetch(`${API_BASE}${path}`, {
              ...options,
              headers: {
                ...options.headers,
                'Content-Type': 'application/json',
                Authorization: `L402 ${macaroon}:${txHash}`
              }
            })
          } catch (err) {
            logger.error({ err, msg: 'Payment cycle failed' })
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
            logger.info({ msg: 'Wallet connected', account: accounts[0] })
          } catch (error) {
            logger.error({ error, msg: 'User denied account access' })
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
          logger.info({ msg: 'Answer added', questionId })
        } catch (error) {
          logger.error({ error, msg: 'Add Answer failed', questionId })
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

      markAnswerAccepted: async (_questionId, answerId) => {
        set({ isLoading: true })
        try {
          await fetch(`${API_BASE}/answers/${answerId}/accept`, {
            method: 'POST'
          })

          // Refresh state
          await get().fetchFeed()
          logger.info({ msg: 'Answer marked accepted', answerId })
        } catch (error) {
          logger.error({ error, msg: 'Accept Answer failed', answerId })
          alert('Failed to accept answer on-chain.')
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'chainoverflow-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        account: state.account
      })
    }
  )
)
