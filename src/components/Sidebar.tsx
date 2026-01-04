import React from 'react'
import { useStore } from '../store/useStore'
import { formatBounty, formatDate } from '../utils/format'

const Sidebar: React.FC = () => {
  const questions = useStore((state) => state.questions)

  // Filter questions with bounties, sort by bounty descending, and take top 5
  const hotBounties = [...questions]
    .filter((q) => q.bounty && BigInt(q.bounty) > 0n)
    .sort((a, b) => {
      const bountyA = BigInt(a.bounty || '0')
      const bountyB = BigInt(b.bounty || '0')
      return bountyB > bountyA ? 1 : bountyB < bountyA ? -1 : 0
    })
    .slice(0, 5)

  return (
    <aside className="sidebar">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>🔥 Hot Bounties</h3>
        <div id="bounties-list">
          {hotBounties.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active bounties</p>
          ) : (
            hotBounties.map((b) => (
              <div
                key={b.id}
                style={{
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-glass)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <span
                    style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-cyan)' }}
                  >
                    💎 {formatBounty(b.bounty!)} ETH
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {formatDate(b.timestamp)}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 500 }}>
                  {b.title.length > 50 ? `${b.title.substring(0, 50)}...` : b.title}
                </p>
              </div>
            ))
          )}
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
