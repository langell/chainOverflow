import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useStore } from '../store/useStore'
import Sidebar from '../components/Sidebar'
import { getIPFSUrl } from '../services/ipfs'
import { formatBounty, formatDate, shortenAddress } from '../utils/format'

const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)

  const questions = useStore((state) => state.questions)
  const allAnswers = useStore((state) => state.answers)
  const voteQuestion = useStore((state) => state.voteQuestion)
  const voteAnswer = useStore((state) => state.voteAnswer)
  const addAnswer = useStore((state) => state.addAnswer)
  const isUploading = useStore((state) => state.isUploading)
  const fetchQuestion = useStore((state) => state.fetchQuestion)
  const isLoading = useStore((state) => state.isLoading)
  const account = useStore((state) => state.account)

  const question = React.useMemo(
    () => questions.find((q) => q.id === numericId),
    [questions, numericId]
  )
  const answers = React.useMemo(
    () => allAnswers.filter((a) => a.questionId === numericId),
    [allAnswers, numericId]
  )

  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write')

  React.useEffect(() => {
    if (numericId) {
      fetchQuestion(numericId)
    }
  }, [numericId, fetchQuestion])

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
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
        <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading question...</p>
      </div>
    )
  }

  if (!question) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Question not found</h2>
        <Link
          to="/"
          className="btn-secondary"
          style={{ marginTop: '1rem', display: 'inline-block' }}
        >
          Go Home
        </Link>
      </div>
    )
  }

  const handleVoteQuestion = (delta: number) => {
    voteQuestion(numericId, delta)
  }

  const handleVoteAnswer = (answerId: number, delta: number) => {
    voteAnswer(answerId, delta)
  }

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAnswerContent.trim()) return

    await addAnswer(numericId, newAnswerContent)
    setNewAnswerContent('')
  }

  return (
    <main className="question-grid">
      <section className="feed">
        {/* Question Header */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div className="vote-controls">
              <button className="btn-vote" onClick={() => handleVoteQuestion(1)}>
                ▲
              </button>
              <span className="vote-count">{question.votes}</span>
              <button className="btn-vote" onClick={() => handleVoteQuestion(-1)}>
                ▼
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <div className="question-meta">
                <span>By {shortenAddress(question.author)}</span>
                <span>•</span>
                <span>{formatDate(question.timestamp)}</span>
                {question.bounty && (
                  <span className="bounty-badge">
                    💎 {formatBounty(question.bounty)} ETH Bounty
                  </span>
                )}
              </div>
              <h1 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', lineHeight: '1.3' }}>
                {question.title}
              </h1>

              <div className="markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.content}</ReactMarkdown>
              </div>

              <div
                style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}
              >
                {question.tags.map((tag) => (
                  <span key={tag} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>

              {question.ipfsHash && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-glass)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  IPFS CID:{' '}
                  <a
                    href={getIPFSUrl(question.ipfsHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-text-link"
                  >
                    {question.ipfsHash}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <h3 style={{ marginBottom: '1.5rem' }}>{answers.length} Answers</h3>

        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}
        >
          {answers.map((answer) => (
            <div
              key={answer.id}
              className="card"
              style={{
                border: answer.isAccepted ? '1px solid var(--accent-cyan)' : undefined,
                background: answer.isAccepted ? 'rgba(6, 182, 212, 0.05)' : undefined
              }}
            >
              {answer.isAccepted && (
                <div
                  style={{
                    marginBottom: '1rem',
                    color: 'var(--accent-cyan)',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ✓ Accepted Solution
                </div>
              )}
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div className="vote-controls">
                  <button className="btn-vote" onClick={() => handleVoteAnswer(answer.id, 1)}>
                    ▲
                  </button>
                  <span className="vote-count">{answer.votes}</span>
                  <button className="btn-vote" onClick={() => handleVoteAnswer(answer.id, -1)}>
                    ▼
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  <div className="question-meta">
                    <span>Answered by {shortenAddress(answer.author)}</span>
                    <span>•</span>
                    <span>{formatDate(answer.timestamp)}</span>
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{answer.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Post Answer Form */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Your Answer</h3>
          {!account ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                You must connect your wallet to post an answer.
              </p>
              <button className="btn-primary" onClick={() => useStore.getState().connectWallet()}>
                Connect Wallet
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitAnswer}>
              <div className="form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}
                >
                  <label style={{ marginBottom: 0 }}>Markdown Supported</label>
                  <div className="tab-group">
                    <button
                      type="button"
                      className={`tab-btn ${viewMode === 'write' ? 'active' : ''}`}
                      onClick={() => setViewMode('write')}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      className={`tab-btn ${viewMode === 'preview' ? 'active' : ''}`}
                      onClick={() => setViewMode('preview')}
                    >
                      Preview
                    </button>
                  </div>
                </div>
                {viewMode === 'write' ? (
                  <textarea
                    rows={6}
                    value={newAnswerContent}
                    onChange={(e) => setNewAnswerContent(e.target.value)}
                    placeholder="Type your solution here..."
                    disabled={isUploading}
                    style={{ fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}
                    required
                  ></textarea>
                ) : (
                  <div className="markdown-content preview-box">
                    {newAnswerContent ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{newAnswerContent}</ReactMarkdown>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Nothing to preview...
                      </span>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUploading || !newAnswerContent.trim()}
              >
                {isUploading ? 'Posting...' : 'Post Answer'}
              </button>
            </form>
          )}
        </div>
      </section>

      <Sidebar />
    </main>
  )
}

export default QuestionDetail
