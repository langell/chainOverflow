import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Question } from '../types'
import { getIPFSUrl } from '../services/ipfs'
import { useStore } from '../store/useStore'

interface QuestionCardProps {
  question: Question
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const voteQuestion = useStore((state) => state.voteQuestion)

  return (
    <div className="card question-card">
      <div className="vote-controls">
        <button className="btn-vote" onClick={() => voteQuestion(question.id, 1)}>
          ▲
        </button>
        <span className="vote-count">{question.votes}</span>
        <button className="btn-vote" onClick={() => voteQuestion(question.id, -1)}>
          ▼
        </button>
      </div>

      <div className="question-content-wrapper">
        <div className="question-meta">
          <span>By {question.author}</span>
          <span>•</span>
          <span>{question.timestamp}</span>
          {question.bounty && <span className="bounty-badge">💎 {question.bounty} Bounty</span>}
        </div>
        <h3
          style={{ marginBottom: '1rem', cursor: 'pointer' }}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {question.title}
        </h3>

        <div className={`markdown-content ${!isExpanded ? 'line-clamp' : ''}`}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{question.content}</ReactMarkdown>
        </div>

        {question.content.length > 150 && (
          <button
            className="btn-text-link"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ marginBottom: '1rem', display: 'block' }}
          >
            {isExpanded ? 'Show Less' : 'Read More...'}
          </button>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              {question.tags.map((tag) => (
                <span key={tag} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <div
            style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}
          >
            <span>
              <strong>{question.answers}</strong> answers
            </span>
          </div>
        </div>

        {question.ipfsHash && (
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-glass)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>
              Content CID:{' '}
              <code style={{ color: 'var(--accent-cyan)' }}>
                {question.ipfsHash.substring(0, 10)}...
              </code>
            </span>
            <a
              href={getIPFSUrl(question.ipfsHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="gradient-text"
              style={{ fontWeight: 600, textDecoration: 'none' }}
            >
              View on IPFS ↗
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionCard
