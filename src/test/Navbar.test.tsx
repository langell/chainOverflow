import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Navbar from '../components/Navbar'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
    useStore: vi.fn()
}))

describe('Navbar', () => {
    const mockConnectWallet = vi.fn()
    const mockSetIsModalOpen = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders correctly with no account connected', () => {
        ; (useStore as any).mockImplementation((selector: any) => selector({
            account: null,
            connectWallet: mockConnectWallet,
            setIsModalOpen: mockSetIsModalOpen
        }))

        render(<Navbar />)
        expect(screen.getByText('Connect Wallet')).toBeInTheDocument()
    })

    it('renders correctly with account connected', () => {
        const account = '0x1234567890123456789012345678901234567890'
            ; (useStore as any).mockImplementation((selector: any) => selector({
                account: account,
                connectWallet: mockConnectWallet,
                setIsModalOpen: mockSetIsModalOpen
            }))

        render(<Navbar />)
        expect(screen.getByText('0x1234...7890')).toBeInTheDocument()
    })

    it('calls setIsModalOpen when button is clicked', () => {
        ; (useStore as any).mockImplementation((selector: any) => selector({
            account: null,
            connectWallet: mockConnectWallet,
            setIsModalOpen: mockSetIsModalOpen
        }))

        render(<Navbar />)
        fireEvent.click(screen.getByText('Ask Question'))
        expect(mockSetIsModalOpen).toHaveBeenCalledWith(true)
    })

    it('calls connectWallet when button is clicked', () => {
        ; (useStore as any).mockImplementation((selector: any) => selector({
            account: null,
            connectWallet: mockConnectWallet,
            setIsModalOpen: mockSetIsModalOpen
        }))

        render(<Navbar />)
        fireEvent.click(screen.getByText('Connect Wallet'))
        expect(mockConnectWallet).toHaveBeenCalled()
    })
})
