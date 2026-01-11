import { useSearchParams, Link } from 'react-router-dom'
import React, { useMemo, useEffect } from 'react'
import { useStore } from '../store/useStore'
import Hero from '../components/Hero'
import QuestionCard from '../components/QuestionCard'
import Sidebar from '../components/Sidebar'
import pkg from '../../package.json'
import { parseBountyToWei } from '../utils/format'

const Home: React.FC = () => {
  const [searchParams] = useSearchParams()
  const filterParam = searchParams.get('filter') || 'newest'

  const [currentSort, setCurrentSort] = React.useState(filterParam)

  // Sync URL param changes to local state
  useEffect(() => {
    setCurrentSort(searchParams.get('filter') || 'newest')
  }, [searchParams])

  const questions = useStore((state) => state.questions)
  const searchQuery = useStore((state) => state.searchQuery)
  const isSearching = useStore((state) => state.isSearching)
  const searchResults = useStore((state) => state.searchResults)
  const isLoading = useStore((state) => state.isLoading)
  const fetchFeed = useStore((state) => state.fetchFeed)

  // Determine what to fetch from backend based on sort
  // Note: 'bounties' filter might need specific backend handling or frontend filtering
  useEffect(() => {
    // If it's a standard sort the backend understands, send it.
    // Otherwise fetch 'active' or 'newest' and filter client side.
    if (['newest', 'active', 'unanswered'].includes(currentSort)) {
      fetchFeed(currentSort)
    } else {
      fetchFeed() // Default fetch for client-side filtering (like 'bounties')
    }
  }, [fetchFeed, currentSort])

  const filteredQuestions = useMemo(() => {
    let result = questions

    // Apply specific client-side filters
    if (currentSort === 'bounties') {
      result = result
        .filter((q) => q.bounty && parseBountyToWei(q.bounty) > 0n)
        // Sort bounties highest to lowest
        .sort((a, b) => {
          const ba = parseBountyToWei(a.bounty)
          const bb = parseBountyToWei(b.bounty)
          return bb > ba ? 1 : bb < ba ? -1 : 0
        })
    }

    if (!searchQuery) return result

    const query = searchQuery.toLowerCase()

    return result.filter((q) => {
      const matchesLocal =
        q.title.toLowerCase().includes(query) ||
        q.author.toLowerCase().includes(query) ||
        (q.handle && q.handle.toLowerCase().includes(query)) ||
        q.tags.some((tag) => tag.toLowerCase().includes(query))
      const matchesDeep = searchResults?.includes(q.id)
      return matchesLocal || matchesDeep
    })
  }, [questions, searchQuery, searchResults, currentSort])

  return (
    <>
      <Hero />
      <main className="question-grid">
        <section className="feed">
          <div className="feed-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2>
                {searchQuery
                  ? `Search Results (${filteredQuestions.length})`
                  : currentSort === 'newest'
                    ? 'Top Questions'
                    : currentSort === 'active'
                      ? 'Active Activity'
                      : currentSort === 'bounties'
                        ? 'Bounty Hunts'
                        : 'Unanswered Questions'}
              </h2>
              {isSearching && (
                <span
                  className="spinner"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.1)',
                    borderTopColor: 'var(--accent-cyan)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></span>
              )}
            </div>
            <div className="nav-links feed-nav" style={{ fontSize: '0.8rem' }}>
              <Link
                to="/?filter=newest"
                style={{ color: currentSort === 'newest' ? 'var(--text-main)' : 'inherit' }}
              >
                Newest
              </Link>
              <Link
                to="/?filter=active"
                style={{ color: currentSort === 'active' ? 'var(--text-main)' : 'inherit' }}
              >
                Active
              </Link>
              <Link
                to="/?filter=unanswered"
                style={{ color: currentSort === 'unanswered' ? 'var(--text-main)' : 'inherit' }}
              >
                Unanswered
              </Link>
              <Link
                to="/?filter=bounties"
                style={{ color: currentSort === 'bounties' ? 'var(--text-main)' : 'inherit' }}
              >
                Bounties
              </Link>
            </div>
          </div>

          <div id="questions-container">
            {isLoading ? (
              <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <span
                  className="spinner"
                  style={{
                    display: 'inline-block',
                    width: '40px',
                    height: '40px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTopColor: 'var(--accent-cyan)',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></span>
                <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading feed...</p>
              </div>
            ) : filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => <QuestionCard key={q.id} question={q} />)
            ) : (
              <div
                style={{
                  padding: '4rem 2rem',
                  textAlign: 'center',
                  background: 'var(--bg-card)',
                  borderRadius: '20px',
                  border: '1px dashed var(--border-glass)'
                }}
              >
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  {isSearching
                    ? 'Querying decentralized indexers...'
                    : `No questions found matching "${searchQuery}"`}
                </p>
                {!isSearching && (
                  <button
                    className="btn-secondary"
                    style={{ marginTop: '1.5rem' }}
                    onClick={() => useStore.getState().setSearchQuery('')}
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
        <Sidebar />
      </main>
      <footer
        style={{
          textAlign: 'center',
          padding: '2rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)'
        }}
      >
        v{pkg.version} - Decentralized Knowledge Base
      </footer>
    </>
  )
}

export default Home
