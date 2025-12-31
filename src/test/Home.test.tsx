import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Home from '../pages/Home'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn(),
  API_BASE: 'http://localhost:3001/api'
}))

// Mock components used in Home
vi.mock('../components/Hero', () => ({
  default: () => <div data-testid="hero-mock">Hero</div>
}))

vi.mock('../components/Sidebar', () => ({
  default: () => <div data-testid="sidebar-mock">Sidebar</div>
}))

vi.mock('../components/QuestionCard', () => ({
  default: ({ question }: any) => <div data-testid="question-card">{question.title}</div>
}))

describe('Home Page', () => {
  const mockFetchFeed = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [],
        isLoading: true,
        fetchFeed: mockFetchFeed,
        searchQuery: '',
        searchResults: null
      })
    )

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByText('Loading feed...')).toBeInTheDocument()
  })

  it('renders questions from store', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [
          {
            id: 1,
            title: 'Q1',
            content: 'C1',
            tags: [],
            author: 'A1',
            votes: 0,
            answers: 0,
            timestamp: 'now'
          }
        ],
        isLoading: false,
        fetchFeed: mockFetchFeed,
        searchQuery: '',
        searchResults: null
      })
    )

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByTestId('hero-mock')).toBeInTheDocument()
    expect(screen.getByText('Q1')).toBeInTheDocument()
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument()
  })

  it('filters questions based on search query', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        questions: [
          {
            id: 1,
            title: 'Match',
            content: '...',
            tags: [],
            author: 'A1',
            votes: 0,
            answers: 0,
            timestamp: 'now'
          },
          {
            id: 2,
            title: 'Other',
            content: '...',
            tags: [],
            author: 'A1',
            votes: 0,
            answers: 0,
            timestamp: 'now'
          }
        ],
        isLoading: false,
        fetchFeed: mockFetchFeed,
        searchQuery: 'Match',
        searchResults: [1]
      })
    )

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByText('Search Results (1)')).toBeInTheDocument()
    expect(screen.getByText('Match')).toBeInTheDocument()
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })
})
