import React from 'react'

const DAO: React.FC = () => {
  return (
    <div style={{ padding: '4rem 0', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>
          <span className="gradient-text">DAO Governance</span>
        </h1>

        <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>🏛️</div>

        <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>
          ChainOverflow DAO is Coming Soon
        </h2>

        <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
          We are building a decentralized governance system where community members can propose
          updates, vote on protocol parameters, and manage the community treasury.
        </p>

        <div
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'rgba(139, 92, 246, 0.1)',
            border: '1px solid var(--accent-violet)',
            borderRadius: '12px',
            color: 'var(--accent-violet)',
            fontWeight: '600'
          }}
        >
          Phase 1: Token Distribution in Progress
        </div>
      </div>
    </div>
  )
}

export default DAO
