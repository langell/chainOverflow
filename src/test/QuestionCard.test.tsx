import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
    render(<QuestionCard question={mockQuestion} />)
    expect(screen.getByText('How to use Markdown?')).toBeInTheDocument()
    expect(screen.getByText('#markdown')).toBeInTheDocument()
  })

  it('renders markdown content correctly', () => {
    render(<QuestionCard question={mockQuestion} />)
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
    render(<QuestionCard question={longQuestion} />)

    const readMoreBtn = screen.getByText('Read More...')
    expect(readMoreBtn).toBeInTheDocument()

    fireEvent.click(readMoreBtn)
    expect(screen.getByText('Show Less')).toBeInTheDocument()
  })

  it('calls voteQuestion when upvote is clicked', () => {
    render(<QuestionCard question={mockQuestion} />)
    const upvoteBtn = screen.getByText('▲')
    fireEvent.click(upvoteBtn)
    expect(mockVoteQuestion).toHaveBeenCalledWith(1, 1)
  })
})
