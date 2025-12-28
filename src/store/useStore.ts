import { create } from 'zustand'
import type { Question } from '../types'
import { uploadToIPFS } from '../services/ipfs'

interface AppState {
    questions: Question[]
    account: string | null
    isModalOpen: boolean
    isUploading: boolean
    searchQuery: string

    // Actions
    setAccount: (account: string | null) => void
    setIsModalOpen: (isOpen: boolean) => void
    setSearchQuery: (query: string) => void
    addQuestion: (data: { title: string; tags: string; bounty: string; content: string }) => Promise<void>
    voteQuestion: (id: number, delta: number) => void
    connectWallet: () => Promise<void>
}

const INITIAL_QUESTIONS: Question[] = [
    {
        id: 1,
        title: 'How do I optimize loops in Solidity to avoid out-of-gas errors?',
        content: 'I have a large array that I iterate over, and I keep hitting gas limits. What are the best practices for batching or off-chain computation?',
        tags: ['solidity', 'gas-optimization', 'evm'],
        author: 'vitalik.eth',
        votes: 42,
        answers: 5,
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
        answers: 3,
        timestamp: '5h ago',
        ipfsHash: 'QmT5NvUtoM5nWFfrQdVrFzGfCu9Ab1QYMD8yV7JkDvJp99'
    },
    {
        id: 3,
        title: 'Best practice for handling reentrancy in EIP-712 signatures?',
        content: 'Is there a specific risk when using meta-transactions and signatures together?',
        tags: ['signatures', 'reentrancy', 'eip-712'],
        author: 'cryptodev.sol',
        votes: 15,
        answers: 2,
        bounty: '120 USDC',
        timestamp: '8h ago',
        ipfsHash: 'QmS4ustLMDvS2CPvev9p7n7JptY6K4x8vS2C6QvjY5nJp2'
    }
]

export const useStore = create<AppState>((set, get) => ({
    questions: INITIAL_QUESTIONS,
    account: null,
    isModalOpen: false,
    isUploading: false,
    searchQuery: '',

    setAccount: (account) => set({ account }),

    setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),

    setSearchQuery: (query) => set({ searchQuery: query }),

    voteQuestion: (id, delta) => {
        const { questions } = get()
        const updatedQuestions = questions.map((q) =>
            q.id === id ? { ...q, votes: q.votes + delta } : q
        )
        set({ questions: updatedQuestions })
    },

    addQuestion: async (data) => {
        const { questions, account } = get()

        set({ isUploading: true })

        try {
            // Store content on IPFS first
            const ipfsHash = await uploadToIPFS(data.content)

            const newQuestion: Question = {
                id: Date.now(), // Better ID generation
                title: data.title,
                content: data.content,
                tags: data.tags.split(' ').filter((t) => t),
                author: account
                    ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
                    : 'you.eth',
                votes: 0,
                answers: 0,
                bounty: data.bounty || undefined,
                timestamp: 'Just now',
                ipfsHash
            }

            set({
                questions: [newQuestion, ...questions],
                isModalOpen: false,
                isUploading: false
            })
        } catch (error) {
            console.error('Failed to upload to IPFS:', error)
            set({ isUploading: false })
            alert('IPFS upload failed. Please try again.')
        }
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
    }
}))
