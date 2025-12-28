import React, { useState } from 'react'
import { useStore } from '../store/useStore'

const Hero: React.FC = () => {
    const seedLargeData = useStore((state) => state.seedLargeData)
    const [isSeeding, setIsSeeding] = useState(false)

    const handleSeed = async () => {
        setIsSeeding(true)
        await seedLargeData(20) // Seed 20 for a quick but visible impact
        setIsSeeding(false)
    }

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
                <button
                    className="btn-secondary"
                    onClick={handleSeed}
                    disabled={isSeeding}
                    style={{ fontSize: '0.8rem', opacity: 0.6 }}
                >
                    {isSeeding ? '📡 Seeding Decentralized Data...' : '🛠️ Seed 20 Peer Nodes (Stress Test)'}
                </button>
            </div>
        </header>
    )
}

export default Hero
