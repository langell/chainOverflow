import React, { useState } from 'react'
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await addQuestion(formData)
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
                        <label>Bounty (Optional)</label>
                        <input
                            type="text"
                            value={formData.bounty}
                            onChange={(e) => setFormData({ ...formData, bounty: e.target.value })}
                            placeholder="e.g. 0.1 ETH"
                            disabled={isUploading}
                        />
                    </div>
                    <div className="form-group">
                        <label>Content</label>
                        <textarea
                            rows={5}
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Explain your problem in detail..."
                            disabled={isUploading}
                        ></textarea>
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
                                <span className="spinner" style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTopColor: 'white',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Uploading to IPFS...
                            </>
                        ) : 'Post to Chain'}
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
