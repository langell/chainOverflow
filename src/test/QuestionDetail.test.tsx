import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import QuestionDetail from '../pages/QuestionDetail'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

// Mock Sidebar
vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar-mock">Sidebar</div>
}))

describe('QuestionDetail Page', () => {
  const mockFetchQuestion = vi.fn()
  const mockAddAnswer = vi.fn()
  const mockVoteQuestion = vi.fn()
  const mockVoteAnswer = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithRouter = (id: string) => {
    return render(
      <MemoryRouter initialEntries={[`/question/${id}`]}>
        <Routes>
          <Route path="/question/:id" element={<QuestionDetail />} />
        </Routes>
      </MemoryRouter>
    )
  }

  it('renders loading state', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [],
        answers: [],
        isLoading: true,
        fetchQuestion: mockFetchQuestion,
        isUploading: false,
        account: null,
        voteQuestion: mockVoteQuestion,
        voteAnswer: mockVoteAnswer,
        addAnswer: mockAddAnswer
      })
    )

    renderWithRouter('1')
    expect(screen.getByText('Loading question...')).toBeInTheDocument()
  })

  it('renders question and answers correctly', () => {
    const question = {
      id: 1,
      title: 'Test Q',
      content: 'Q Content',
      tags: ['tag1'],
      author: 'A1',
      votes: 5,
      bounty: '100',
      timestamp: 'now',
      ipfsHash: 'Qm123'
    }
    const answers = [
      {
        id: 10,
        questionId: 1,
        content: 'Ans 1',
        author: 'U1',
        votes: 2,
        timestamp: 'then',
        isAccepted: true
      }
    ]

    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [question],
        answers: answers,
        isLoading: false,
        fetchQuestion: mockFetchQuestion,
        isUploading: false,
        account: '0xabc',
        voteQuestion: mockVoteQuestion,
        voteAnswer: mockVoteAnswer,
        addAnswer: mockAddAnswer
      })
    )

    renderWithRouter('1')
    expect(screen.getByText('Test Q')).toBeInTheDocument()
    expect(screen.getByText('Ans 1')).toBeInTheDocument()
    expect(screen.getByText('✓ Accepted Solution')).toBeInTheDocument()
    expect(screen.getByText('1 Answers')).toBeInTheDocument()
  })

  it('handles question not found', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [],
        answers: [],
        isLoading: false,
        fetchQuestion: mockFetchQuestion
      })
    )

    renderWithRouter('999')
    expect(screen.getByText('Question not found')).toBeInTheDocument()
  })

  it('submits a new answer', async () => {
    const question = {
      id: 1,
      title: 'Test Q',
      content: 'Q Content',
      tags: [],
      author: 'A1',
      votes: 0,
      timestamp: 'now'
    }

    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [question],
        answers: [],
        isLoading: false,
        fetchQuestion: mockFetchQuestion,
        isUploading: false,
        account: '0xabc',
        addAnswer: mockAddAnswer
      })
    )

    renderWithRouter('1')

    const textarea = screen.getByPlaceholderText('Type your solution here...')
    fireEvent.change(textarea, { target: { value: 'My new solution' } })

    const submitBtn = screen.getByText('Post Answer')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockAddAnswer).toHaveBeenCalledWith(1, 'My new solution')
    })
  })
})
