import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

// Mock components to simplify App test
vi.mock('../components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }))
vi.mock('../components/QuestionModal', () => ({
  default: () => <div data-testid="modal">Modal</div>
}))
vi.mock('../pages/Home', () => ({ default: () => <div data-testid="home">Home</div> }))

describe('App Component', () => {
  it('renders navbar, modal and home page by default', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: null,
        isModalOpen: false
      })
    )

    render(<App />)

    expect(screen.getByTestId('navbar')).toBeInTheDocument()
    expect(screen.getByTestId('modal')).toBeInTheDocument()
    expect(screen.getByTestId('home')).toBeInTheDocument()
  })
})
