import React, { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'

const HandleModal: React.FC = () => {
  const account = useStore((state) => state.account)
  const handle = useStore((state) => state.handle)
  const updateUser = useStore((state) => state.updateUser)

  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Effect: Determine if modal should open
  useEffect(() => {
    // If logged in AND no handle AND haven't dismissed this session
    // Using v2 key to force reset for users who might have dismissed it
    const hasDismissed = sessionStorage.getItem(`dismiss_handle_prompt_v2_${account}`)

    if (account && !handle && !hasDismissed) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [account, handle])

  const handleClose = () => {
    setIsOpen(false)
    if (account) {
      sessionStorage.setItem(`dismiss_handle_prompt_v2_${account}`, 'true')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    setError('')
    setIsSaving(true)
    try {
      await updateUser(inputValue.trim())
      // Success: Modal will close automatically via useEffect (handle becomes set)
      setIsOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update handle')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div id="handleModal" className="modal active" style={{ zIndex: 9999 }}>
      <div className="modal-content card" style={{ maxWidth: '400px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}
        >
          <h2 className="gradient-text" style={{ fontSize: '1.5rem' }}>
            Set Your Username
          </h2>
          <button className="btn-close" onClick={handleClose}>
            &times;
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
          Choose a display name for the leaderboard and your profile.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username / Handle</label>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. SatoshiNakamoto"
              required
              minLength={3}
              maxLength={20}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)'
              }}
            />
            {error && (
              <p style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>{error}</p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              style={{ flex: 1 }}
            >
              Later
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSaving ? (
                <>
                  <span
                    className="spinner"
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  ></span>
                  Saving
                </>
              ) : (
                'Save Handle'
              )}
            </button>
          </div>
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

export default HandleModal
