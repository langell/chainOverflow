import React from 'react'

const Hero: React.FC = () => {
  return (
    <header className="hero" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
      <h1>
        The Knowledge Engine of <br />
        <span className="gradient-text">Web3 Development</span>
      </h1>
      <p
        style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          maxWidth: '800px',
          margin: '0 auto 1.5rem'
        }}
      >
        The decentralized Q&A protocol where expertise is rewarded with on-chain reputation and
        bounties.
      </p>
    </header>
  )
}

export default Hero
