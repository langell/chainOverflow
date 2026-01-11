import React, { useEffect, useState } from 'react'
import { formatBounty, shortenAddress } from '../utils/format'

interface LeaderboardData {
  topSolvers: { author: string; accepted: number; earned: string }[]
  topEarners: { author: string; accepted: number; earned: string }[]
}

const Leaderboard: React.FC = () => {
  const [data, setData] = useState<LeaderboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard')
        if (!res.ok) throw new Error('Failed to fetch leaderboard')
        const json = await res.json()
        setData(json)
      } catch (_err) {
        setError('Could not load leaderboard data.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchLeaderboard()
  }, [])

  return (
    <>
      <div style={{ paddingTop: '80px', minHeight: '100vh', paddingBottom: '4rem' }}>
        <div className="container">
          <h1
            className="gradient-text"
            style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}
          >
            Community Leaderboard
          </h1>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Calculating stats...</p>
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', color: '#ff4444' }}>{error}</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem'
              }}
            >
              {/* Top Solvers Column */}
              <div className="card">
                <h2
                  style={{
                    fontSize: '1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🧠 Top Solvers
                </h2>
                <div className="list">
                  {data?.topSolvers.map((user, index) => (
                    <div
                      key={user.author}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background:
                          index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        marginBottom: '0.75rem',
                        border: index === 0 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color:
                              index === 0
                                ? '#ffd700'
                                : index === 1
                                  ? '#c0c0c0'
                                  : index === 2
                                    ? '#cd7f32'
                                    : 'var(--text-muted)',
                            width: '24px'
                          }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{shortenAddress(user.author)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {user.accepted} Solutions
                          </div>
                        </div>
                      </div>
                      {index === 0 && <span>👑</span>}
                    </div>
                  ))}
                  {data?.topSolvers.length === 0 && (
                    <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>
                  )}
                </div>
              </div>

              {/* Top Earners Column */}
              <div className="card">
                <h2
                  style={{
                    fontSize: '1.5rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  💎 Top Earners
                </h2>
                <div className="list">
                  {data?.topEarners.map((user, index) => (
                    <div
                      key={user.author}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        background:
                          index === 0 ? 'rgba(0, 255, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                        borderRadius: '12px',
                        marginBottom: '0.75rem',
                        border: index === 0 ? '1px solid rgba(0, 255, 255, 0.3)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span
                          style={{
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color:
                              index === 0
                                ? 'var(--accent-cyan)'
                                : index === 1
                                  ? '#c0c0c0'
                                  : index === 2
                                    ? '#cd7f32'
                                    : 'var(--text-muted)',
                            width: '24px'
                          }}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <div style={{ fontWeight: 600 }}>{shortenAddress(user.author)}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Earned total
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                        {formatBounty(user.earned)} ETH
                      </div>
                    </div>
                  ))}
                  {data?.topEarners.length === 0 && (
                    <p style={{ color: 'var(--text-muted)' }}>No data yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Leaderboard
