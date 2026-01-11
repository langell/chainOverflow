import React from 'react'

const Hero: React.FC = () => {
  return (
    <header className="hero" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <h1>
        The Knowledge Engine of <br />
        <span className="gradient-text">Web3 Development</span>
      </h1>
      <p
        style={{
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
