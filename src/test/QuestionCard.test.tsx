import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

describe('QuestionCard', () => {
  const mockVoteQuestion = vi.fn()
  const mockQuestion = {
    id: 1,
    title: 'How to use Markdown?',
    content: '# Hello\nThis is **bold** and `code`.',
    tags: ['markdown', 'test'],
    author: 'tester.eth',
    votes: 10,
    answers: 2,
    timestamp: '1h ago',
    ipfsHash: 'QmHash123'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock implementation
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        voteQuestion: mockVoteQuestion
      })
    )
  })

  it('renders title and tags correctly', () => {
    render(
      <MemoryRouter>
        <QuestionCard question={mockQuestion} />
      </MemoryRouter>
    )
    expect(screen.getByText('How to use Markdown?')).toBeInTheDocument()
    expect(screen.getByText('#markdown')).toBeInTheDocument()
  })

  it('renders markdown content correctly', () => {
    render(
      <MemoryRouter>
        <QuestionCard question={mockQuestion} />
      </MemoryRouter>
    )
    // Use regex for flexible matching due to markdown node splitting
    expect(screen.getByText(/This is/)).toBeInTheDocument()
    expect(screen.getByText(/bold/)).toBeInTheDocument()
    expect(screen.getByText(/code/)).toBeInTheDocument()
  })

  it('toggles expansion when clicking Read More', () => {
    const longQuestion = {
      ...mockQuestion,
      content: 'A'.repeat(200) // Long enough to trigger "Read More"
    }
    render(
      <MemoryRouter>
        <QuestionCard question={longQuestion} />
      </MemoryRouter>
    )

    const readMoreBtn = screen.getByText('Read More...')
    expect(readMoreBtn).toBeInTheDocument()

    fireEvent.click(readMoreBtn)
    expect(screen.getByText('Show Less')).toBeInTheDocument()
  })

  it('calls voteQuestion when upvote is clicked', () => {
    render(
      <MemoryRouter>
        <QuestionCard question={mockQuestion} />
      </MemoryRouter>
    )
    const upvoteBtn = screen.getByText('▲')
    fireEvent.click(upvoteBtn)
    expect(mockVoteQuestion).toHaveBeenCalledWith(1, 1)
  })

  it('displays handle when available', () => {
    const questionWithHandle = { ...mockQuestion, handle: 'cool_dev' }
    render(
      <MemoryRouter>
        <QuestionCard question={questionWithHandle} />
      </MemoryRouter>
    )
    expect(screen.getByText('By cool_dev')).toBeInTheDocument()
  })

  it('displays shortened address when handle is missing', () => {
    const questionNoHandle = {
      ...mockQuestion,
      author: '0x1234567890abcdef1234567890abcdef12345678',
      handle: undefined
    }
    render(
      <MemoryRouter>
        <QuestionCard question={questionNoHandle} />
      </MemoryRouter>
    )
    // 0x1234...5678
    expect(screen.getByText('By 0x1234...5678')).toBeInTheDocument()
  })
})
