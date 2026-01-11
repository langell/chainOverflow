import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import HandleModal from '../components/HandleModal'
import { useStore } from '../store/useStore'

// Mock the store
vi.mock('../store/useStore', () => ({
  useStore: vi.fn()
}))

describe('HandleModal', () => {
  const mockUpdateUser = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: '0x123',
        handle: null,
        updateUser: mockUpdateUser
      })
    )
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders when user is connected but has no handle', () => {
    render(<HandleModal />)
    expect(screen.getByText('Set Your Username')).toBeInTheDocument()
  })

  it('does not render if user is not connected', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: null,
        handle: null,
        updateUser: mockUpdateUser
      })
    )
    render(<HandleModal />)
    expect(screen.queryByText('Set Your Username')).not.toBeInTheDocument()
  })

  it('does not render if user already has a handle', () => {
    ;(useStore as any).mockImplementation((selector: any) =>
      selector({
        account: '0x123',
        handle: 'ExistingUser',
        updateUser: mockUpdateUser
      })
    )
    render(<HandleModal />)
    expect(screen.queryByText('Set Your Username')).not.toBeInTheDocument()
  })

  it('does not render if dismissed in session storage', () => {
    sessionStorage.setItem('dismiss_handle_prompt_v2_0x123', 'true')
    render(<HandleModal />)
    expect(screen.queryByText('Set Your Username')).not.toBeInTheDocument()
  })

  it('submits form and calls updateUser', async () => {
    mockUpdateUser.mockResolvedValue({})
    render(<HandleModal />)

    const input = screen.getByPlaceholderText('e.g. SatoshiNakamoto')
    fireEvent.change(input, { target: { value: 'NewUser' } })

    const submitBtn = screen.getByText('Save Handle')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith('NewUser')
    })
  })

  it('dismisses modal when Later is clicked', () => {
    render(<HandleModal />)

    const laterBtn = screen.getByText('Later')
    fireEvent.click(laterBtn)

    expect(sessionStorage.getItem('dismiss_handle_prompt_v2_0x123')).toBe('true')
    // Re-render check is tricky with internal state, but we verified the side effect
  })

  it('shows error message if update fails', async () => {
    mockUpdateUser.mockRejectedValue(new Error('Handle taken'))
    render(<HandleModal />)

    const input = screen.getByPlaceholderText('e.g. SatoshiNakamoto')
    fireEvent.change(input, { target: { value: 'TakenUser' } })

    const submitBtn = screen.getByText('Save Handle')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Handle taken')).toBeInTheDocument()
    })
  })
})
