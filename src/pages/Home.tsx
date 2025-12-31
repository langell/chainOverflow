import React, { useMemo, useEffect } from 'react'
import { useStore } from '../store/useStore'
import Hero from '../components/Hero'
import QuestionCard from '../components/QuestionCard'
import Sidebar from '../components/Sidebar'

const Home: React.FC = () => {
  const questions = useStore((state) => state.questions)
  const searchQuery = useStore((state) => state.searchQuery)
  const isSearching = useStore((state) => state.isSearching)
  const searchResults = useStore((state) => state.searchResults)
  const isLoading = useStore((state) => state.isLoading)
  const fetchFeed = useStore((state) => state.fetchFeed)

  useEffect(() => {
    fetchFeed()
  }, [fetchFeed])

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questions

    const query = searchQuery.toLowerCase()

    return questions.filter((q) => {
      const matchesLocal =
        q.title.toLowerCase().includes(query) ||
        q.author.toLowerCase().includes(query) ||
        q.tags.some((tag) => tag.toLowerCase().includes(query))
      const matchesDeep = searchResults?.includes(q.id)
      return matchesLocal || matchesDeep
    })
  }, [questions, searchQuery, searchResults])

  return (
    <>
      <Hero />
      <main className="question-grid">
        <section className="feed">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <h2>
                {searchQuery ? `Search Results (${filteredQuestions.length})` : 'Top Questions'}
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
            <div className="nav-links" style={{ fontSize: '0.8rem' }}>
              <a href="#" style={{ color: 'var(--text-main)' }}>
                Newest
              </a>
              <a href="#">Active</a>
              <a href="#">Unanswered</a>
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
    </>
  )
}

export default Home
