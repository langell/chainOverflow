import React from 'react'
import { useStore } from '../store/useStore'

const Navbar: React.FC = () => {
    const account = useStore((state) => state.account)
    const connectWallet = useStore((state) => state.connectWallet)
    const setIsModalOpen = useStore((state) => state.setIsModalOpen)
    const searchQuery = useStore((state) => state.searchQuery)
    const setSearchQuery = useStore((state) => state.setSearchQuery)

    return (
        <nav className="navbar">
            <div className="logo">
                <span className="gradient-text">⛓️ Chain</span>Overflow
            </div>
            <div className="search-container">
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search questions, tags, or authors..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>
            <div className="nav-links">
                <a href="#">Explore</a>
                <a href="#">Bounties</a>
                <a href="#">DAO</a>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>
                    Ask Question
                </button>
                <button
                    className="btn-primary"
                    onClick={connectWallet}
                    style={
                        account
                            ? { background: 'rgba(139, 92, 246, 0.2)', border: '1px solid var(--accent-violet)' }
                            : {}
                    }
                >
                    {account
                        ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}`
                        : 'Connect Wallet'}
                </button>
            </div>
        </nav>
    )
}

export default Navbar
