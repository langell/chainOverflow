import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

describe('Navbar', () => {
  const mockConnectWallet = vi.fn()
  const mockDisconnectWallet = vi.fn()
  const mockSetIsModalOpen = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with no account connected', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: null,
        connectWallet: mockConnectWallet,
        setIsModalOpen: mockSetIsModalOpen
      })
    )

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('Connect')).toBeInTheDocument()
  })

  it('renders correctly with account connected', () => {
    const account = '0x1234567890123456789012345678901234567890'
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: account,
        connectWallet: mockConnectWallet,
        disconnectWallet: mockDisconnectWallet,
        setIsModalOpen: mockSetIsModalOpen
      })
    )

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
  })

  it('opens dropdown and calls disconnectWallet', () => {
    const account = '0x1234567890123456789012345678901234567890'
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: account,
        connectWallet: mockConnectWallet,
        disconnectWallet: mockDisconnectWallet,
        setIsModalOpen: mockSetIsModalOpen
      })
    )

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )

    // Dropdown should be closed initially
    expect(screen.queryByText('Disconnect Wallet')).toBeNull()

    // Click the address button to open dropdown
    fireEvent.click(screen.getByText('0x1234...7890'))

    // Now Disconnect option should be visible
    expect(screen.getByText('Disconnect Wallet')).toBeInTheDocument()

    // Click disconnect
    fireEvent.click(screen.getByText('Disconnect Wallet'))
    expect(mockDisconnectWallet).toHaveBeenCalled()
  })

  it('does not show Ask Question button when logged out', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: null,
        connectWallet: mockConnectWallet,
        setIsModalOpen: mockSetIsModalOpen
      })
    )

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.queryByText('Ask Question')).toBeNull()
  })

  it('calls setIsModalOpen when Ask Question is clicked and logged in', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: '0x123',
        connectWallet: mockConnectWallet,
        setIsModalOpen: mockSetIsModalOpen
      })
    )

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Ask Question'))
    expect(mockSetIsModalOpen).toHaveBeenCalledWith(true)
  })

  it('calls connectWallet when button is clicked', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: null,
        connectWallet: mockConnectWallet,
        setIsModalOpen: mockSetIsModalOpen
      })
    )

    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Connect'))
    expect(mockConnectWallet).toHaveBeenCalled()
  })
})
