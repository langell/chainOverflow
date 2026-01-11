import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Wallet, LogOut, ChevronDown, User, Menu, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { shortenAddress } from '../utils/format'

const Navbar: React.FC = () => {
  const account = useStore((state) => state.account)
  const handle = useStore((state) => state.handle)
  const connectWallet = useStore((state) => state.connectWallet)
  const disconnectWallet = useStore((state) => state.disconnectWallet)
  const setIsModalOpen = useStore((state) => state.setIsModalOpen)
  const searchQuery = useStore((state) => state.searchQuery)
  const setSearchQuery = useStore((state) => state.setSearchQuery)
  const isSearching = useStore((state) => state.isSearching)

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleMobileLinkClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="navbar-container" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="navbar">
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

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn-secondary ask-btn"
            onClick={() => {
              setIsModalOpen(true)
              setIsMobileMenuOpen(false)
            }}
          >
            Ask Question
          </button>

          <div style={{ position: 'relative' }}>
            {account ? (
              <button
                className="btn-primary wallet-btn"
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
                <span className="account-text" style={{ fontSize: '0.9rem' }}>
                  {handle ? handle : shortenAddress(account)}
                </span>
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>
            ) : (
              <button
                className="btn-primary wallet-btn"
                onClick={connectWallet}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Wallet size={16} />
                <span className="connect-text">Connect</span>
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
                  zIndex: 1100,
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
                    setIsMobileMenuOpen(false)
                  }}
                  className="dropdown-item"
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <LogOut size={16} />
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>

          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${isMobileMenuOpen ? 'active' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            className="search-wrapper"
            style={{
              marginBottom: '1rem',
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              border: '1px solid var(--border-glass)'
            }}
          >
            <span
              className="search-icon"
              style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center' }}
            >
              <Search size={18} opacity={0.5} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ background: 'transparent', border: 'none' }}
            />
          </div>
          <Link
            to="/leaderboard"
            onClick={handleMobileLinkClick}
            className="btn-secondary"
            style={{ textAlign: 'center' }}
          >
            Leaderboard
          </Link>
          <Link
            to="/?filter=bounties"
            onClick={handleMobileLinkClick}
            className="btn-secondary"
            style={{ textAlign: 'center' }}
          >
            Bounties
          </Link>
          <Link
            to="/dao"
            onClick={handleMobileLinkClick}
            className="btn-secondary"
            style={{ textAlign: 'center' }}
          >
            DAO
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
