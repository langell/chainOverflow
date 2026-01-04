import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ethers } from 'ethers'
import { useStore } from '../store/useStore'

const QuestionModal: React.FC = () => {
  const isModalOpen = useStore((state) => state.isModalOpen)
  const setIsModalOpen = useStore((state) => state.setIsModalOpen)
  const addQuestion = useStore((state) => state.addQuestion)
  const isUploading = useStore((state) => state.isUploading)

  const [formData, setFormData] = useState({
    title: '',
    tags: '',
    bounty: '',
    content: ''
  })
  const [viewMode, setViewMode] = useState<'write' | 'preview'>('write')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Default fee 0.0001 ETH in Wei
    const DEFAULT_FEE = '100000000000000'
    let bountyInWei = DEFAULT_FEE

    try {
      if (formData.bounty) {
        const parsed = ethers.parseEther(formData.bounty)
        // Ensure it's at least the default fee
        bountyInWei = parsed > BigInt(DEFAULT_FEE) ? parsed.toString() : DEFAULT_FEE
      }
    } catch (_err) {
      alert('Invalid bounty amount. Please enter a valid number (e.g. 0.05)')
      return
    }

    await addQuestion({ ...formData, bounty: bountyInWei })
    setFormData({ title: '', tags: '', bounty: '', content: '' })
  }

  if (!isModalOpen) return null

  return (
    <div
      id="questionModal"
      className="modal active"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isUploading) setIsModalOpen(false)
      }}
    >
      <div className="modal-content card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}
        >
          <h2 className="gradient-text">Post a New Question</h2>
          <button
            className="btn-close"
            onClick={() => setIsModalOpen(false)}
            disabled={isUploading}
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What is your blockchain question?"
              required
              disabled={isUploading}
            />
          </div>
          <div className="form-group">
            <label>Tags (space separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="solidity gas security"
              disabled={isUploading}
            />
          </div>
          <div className="form-group">
            <label>Bounty ( in ETH )</label>
            <input
              type="text"
              value={formData.bounty}
              onChange={(e) => {
                const val = e.target.value
                if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
                  setFormData({ ...formData, bounty: val })
                }
              }}
              placeholder="0.1"
              disabled={isUploading}
            />
            {formData.bounty && !isNaN(parseFloat(formData.bounty)) && (
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginTop: '0.25rem',
                  fontFamily: 'monospace'
                }}
              >
                Equivalent to:{' '}
                {(() => {
                  try {
                    return ethers.parseEther(formData.bounty).toString()
                  } catch {
                    return 'Invalid amount'
                  }
                })()}{' '}
                Wei
              </p>
            )}
          </div>
          <div className="form-group">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}
            >
              <label style={{ marginBottom: 0 }}>Content (Markdown Supported)</label>
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
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Explain your problem in detail... Use markdown for code fragments!"
                disabled={isUploading}
                style={{ fontSize: '0.9rem', fontFamily: "'JetBrains Mono', monospace" }}
              ></textarea>
            ) : (
              <div className="markdown-content preview-box">
                {formData.content ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formData.content}</ReactMarkdown>
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
            style={{
              width: '100%',
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isUploading ? 0.7 : 1,
              cursor: isUploading ? 'not-allowed' : 'pointer'
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span
                  className="spinner"
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}
                ></span>
                Uploading to IPFS...
              </>
            ) : (
              'Post to Chain'
            )}
          </button>
        </form>
      </div>
      <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
    </div>
  )
}

export default QuestionModal
