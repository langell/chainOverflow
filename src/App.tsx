import React, { useMemo } from 'react'
import './style.css'
import { useStore } from './store/useStore'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import QuestionCard from './components/QuestionCard'
import Sidebar from './components/Sidebar'
import QuestionModal from './components/QuestionModal'

declare global {
  interface Window {
    ethereum?: any
  }
}

const App: React.FC = () => {
  const questions = useStore((state) => state.questions)
  const searchQuery = useStore((state) => state.searchQuery)

  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questions

    const query = searchQuery.toLowerCase()
    return questions.filter((q) => {
      return (
        q.title.toLowerCase().includes(query) ||
        q.content.toLowerCase().includes(query) ||
        q.author.toLowerCase().includes(query) ||
        q.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
  }, [questions, searchQuery])

  return (
    <div id="app">
      <Navbar />
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
            <h2>{searchQuery ? `Search Results (${filteredQuestions.length})` : 'Top Questions'}</h2>
            <div className="nav-links" style={{ fontSize: '0.8rem' }}>
              <a href="#" style={{ color: 'var(--text-main)' }}>
                Newest
              </a>
              <a href="#">Active</a>
              <a href="#">Unanswered</a>
            </div>
          </div>

          <div id="questions-container">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q) => (
                <QuestionCard key={q.id} question={q} />
              ))
            ) : (
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
                background: 'var(--bg-card)',
                borderRadius: '20px',
                border: '1px dashed var(--border-glass)'
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                  No questions found matching "<span style={{ color: 'var(--text-main)' }}>{searchQuery}</span>"
                </p>
                <button
                  className="btn-secondary"
                  style={{ marginTop: '1.5rem' }}
                  onClick={() => useStore.getState().setSearchQuery('')}
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </section>

        <Sidebar />
      </main>

      <QuestionModal />
    </div>
  )
}

export default App
