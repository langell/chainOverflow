import React from 'react'
import { useStore } from '../store/useStore'

const Sidebar: React.FC = () => {
    const questions = useStore((state) => state.questions)
    const hotBounties = questions.filter((q) => q.bounty)

    return (
        <aside className="sidebar">
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🔥 Hot Bounties</h3>
                <div id="bounties-list">
                    {hotBounties.map((b) => (
                        <div
                            key={b.id}
                            style={{
                                marginBottom: '1rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid var(--border-glass)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                                    {b.bounty}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.timestamp}</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>
                                {b.title.substring(0, 50)}...
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>📊 Network Health</h3>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Gas (Mainnet)</span>
                        <span style={{ color: 'var(--accent-cyan)' }}>12 Gwei</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span>Active Devs</span>
                        <span style={{ color: 'var(--accent-violet)' }}>4,281</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Total Staked</span>
                        <span style={{ color: 'white' }}>12.5 ETH</span>
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
