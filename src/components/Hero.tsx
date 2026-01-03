import React from 'react'

const Hero: React.FC = () => {
  return (
    <header className="hero">
      <h1 style={{ fontSize: '4rem', textAlign: 'center', marginBottom: '1rem' }}>
        The Knowledge Engine of <br />
        <span className="gradient-text">Web3 Development</span>
      </h1>
      <p
        style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '1.25rem',
          maxWidth: '600px',
          margin: '0 auto 2rem'
        }}
      >
        The decentralized Q&A protocol where expertise is rewarded with on-chain reputation and
        bounties.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
        {/* Seed button hidden as requested */}
      </div>
    </header>
  )
}

export default Hero
