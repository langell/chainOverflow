import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Wallet, LogOut, ChevronDown, User } from 'lucide-react'
import { useStore } from '../store/useStore'
import { shortenAddress } from '../utils/format'

const Navbar: React.FC = () => {
  const account = useStore((state) => state.account)
  const handle = useStore((state) => state.handle)
  const connectWallet = useStore((state) => state.connectWallet)
  const disconnectWallet = useStore((state) => state.disconnectWallet)
  const setIsModalOpen = useStore((state) => state.setIsModalOpen)
  const updateUser = useStore((state) => state.updateUser)
  const searchQuery = useStore((state) => state.searchQuery)
  const setSearchQuery = useStore((state) => state.setSearchQuery)
  const isSearching = useStore((state) => state.isSearching)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Prompt for handle if new user
  useEffect(() => {
    if (account && handle === null) {
      // Simple prompt for now - could be a modal
      // Check if we just connected (simple check: if we have account but no handle logic ran)
      // However, fetchUser runs on connect. If it returns null, handle is null.
      // So we should prompt.
      // Use a small timeout to ensure fetchUser completed? No, fetchUser is awaited in connectWallet.

      // Use a customized confirm/prompt interactions to not be annoying on every reload?
      // We can check if we already asked in session storage or just ask once.
      const hasAsked = sessionStorage.getItem(`asked_handle_${account}`)
      if (!hasAsked) {
        setTimeout(() => {
          const newHandle = window.prompt(
            'Welcome! Please enter a username/handle for the leaderboard:'
          )
          if (newHandle) {
            updateUser(newHandle).catch((err) => alert(err.message))
          }
          sessionStorage.setItem(`asked_handle_${account}`, 'true')
        }, 500)
      }
    }
  }, [account, handle, updateUser])

  return (
    <nav className="navbar">
      <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="gradient-text">⛓️ Chain</span>Overflow
      </Link>
      <div className="search-container">
        <div className="search-wrapper">
          <span className="search-icon" style={{ opacity: isSearching ? 1 : 0.5 }}>
            {isSearching ? '⏳' : <Search size={18} />}
          </span>
          <input
            type="text"
            placeholder="Search questions, tags, or authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            style={isSearching ? { borderColor: 'var(--accent-cyan)' } : {}}
          />
        </div>
      </div>
      <div className="nav-links">
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/?filter=bounties">Bounties</Link>
        <Link to="/dao">DAO</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
          Ask Question
        </button>

        <div style={{ position: 'relative' }}>
          {account ? (
            <button
              className="btn-primary"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                paddingRight: '0.75rem',
                background: isDropdownOpen ? 'rgba(139, 92, 246, 0.3)' : undefined
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-violet))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={14} color="white" />
              </div>
              <span style={{ fontSize: '0.9rem' }}>
                {handle ? handle : shortenAddress(account)}
              </span>
              <ChevronDown size={14} style={{ opacity: 0.7 }} />
            </button>
          ) : (
            <button
              className="btn-primary"
              onClick={connectWallet}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Wallet size={16} />
              <span>Connect Wallet</span>
            </button>
          )}

          {/* Dropdown Menu */}
          {isDropdownOpen && account && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                width: '220px',
                background: 'rgba(23, 23, 30, 0.95)',
                border: '1px solid var(--border-glass)',
                borderRadius: '12px',
                padding: '0.5rem',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease-out'
              }}
            >
              <div
                style={{
                  padding: '0.75rem',
                  borderBottom: '1px solid var(--border-glass)',
                  marginBottom: '0.5rem'
                }}
              >
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    marginBottom: '0.25rem'
                  }}
                >
                  Connected as
                </div>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.9rem' }}>
                  {shortenAddress(account)}
                </div>
              </div>

              <button
                onClick={() => {
                  disconnectWallet()
                  setIsDropdownOpen(false)
                }}
                className="dropdown-item"
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 50, 50, 0.1)'
                  e.currentTarget.style.color = '#ff4444'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-primary)'
                }}
              >
                <LogOut size={16} />
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
