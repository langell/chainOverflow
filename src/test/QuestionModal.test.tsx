import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import QuestionModal from '../components/QuestionModal'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

describe('QuestionModal', () => {
  const mockSetIsModalOpen = vi.fn()
  const mockAddQuestion = vi.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountWithState = (overrides = {}) => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        isModalOpen: true,
        isUploading: false,
        setIsModalOpen: mockSetIsModalOpen,
        addQuestion: mockAddQuestion,
        ...overrides
      })
    )
    return render(<QuestionModal />)
  }

  it('does not render when isModalOpen is false', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        isModalOpen: false,
        setIsModalOpen: mockSetIsModalOpen,
        addQuestion: mockAddQuestion
      })
    )

    const { container } = render(<QuestionModal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders when isModalOpen is true', () => {
    mountWithState()
    expect(screen.getByText('Post a New Question')).toBeInTheDocument()
  })

  it('submits form data correctly', async () => {
    vi.stubGlobal('alert', vi.fn())
    mountWithState()

    fireEvent.change(screen.getByPlaceholderText('What is your blockchain question?'), {
      target: { value: 'Test Question' }
    })
    fireEvent.change(screen.getByPlaceholderText('solidity gas security'), {
      target: { value: 'tag1 tag2' }
    })
    fireEvent.change(screen.getByPlaceholderText('e.g. 0.1 ETH'), {
      target: { value: '0.5' }
    })

    fireEvent.submit(screen.getByRole('button', { name: /Post to Chain/i }))

    expect(mockAddQuestion).toHaveBeenCalledWith({
      title: 'Test Question',
      tags: 'tag1 tag2',
      bounty: '500000000000000000',
      content: ''
    })
  })

  it('shows uploading state and disables button', () => {
    mountWithState({ isUploading: true })

    const button = screen.getByRole('button', { name: /Uploading to IPFS.../i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()

    // Inputs should also be disabled
    expect(screen.getByPlaceholderText('What is your blockchain question?')).toBeDisabled()
  })

  it('calls setIsModalOpen with false when close button is clicked', () => {
    mountWithState()
    fireEvent.click(screen.getByText('×'))
    expect(mockSetIsModalOpen).toHaveBeenCalledWith(false)
  })
})
