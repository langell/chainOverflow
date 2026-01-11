import { describe, it, expect, vi, beforeEach } from 'vitest'
import { triggerAIAnswers } from '../src/services/llm'
import { initDB, getDB } from '../src/db'

// Mock global fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('LLM Service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await initDB()
    const db = getDB()
    await db.run('DELETE FROM questions')
    await db.run('DELETE FROM answers')
    await db.run('DELETE FROM users')

    // Mock environment variables
    process.env.OPENAI_API_KEY = 'test-key'
    process.env.ANTHROPIC_API_KEY = 'test-key'
    process.env.GOOGLE_API_KEY = 'test-key'
  })

  it('should fetch answers from all configured LLMs and save them', async () => {
    const db = getDB()
    const qResult = await db.run(
      'INSERT INTO questions (title, content, author) VALUES (?, ?, ?)',
      ['How to code?', 'Please help', 'user1']
    )
    const questionId = qResult.lastID

    // Mock responses for ChatGPT, Claude, Gemini
    mockFetch.mockImplementation((url) => {
      if (url.includes('openai')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ choices: [{ message: { content: 'ChatGPT Answer' } }] })
        })
      }
      if (url.includes('anthropic')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ content: [{ text: 'Claude Answer' }] })
        })
      }
      if (url.includes('googleapis')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({ candidates: [{ content: { parts: [{ text: 'Gemini Answer' }] } }] })
        })
      }
      return Promise.reject('Unknown URL')
    })

    // Trigger AI answers
    await triggerAIAnswers(questionId, 'How to code?', 'Please help')

    // Wait for async operations to complete (since they are fire-and-forget inside triggerAIAnswers)
    // Actually, triggerAIAnswers awaits the loop in my implementation if I use for...of,
    // but I fire getAIAnswer without await.
    // Let's adjust the test to wait.
    await new Promise((r) => setTimeout(r, 100))

    const answers = await db.all('SELECT * FROM answers WHERE question_id = ?', [questionId])

    // We expect 3 answers
    expect(answers.length).toBe(3)

    const contents = answers.map((a) => a.content)
    expect(contents).toContain('ChatGPT Answer')
    expect(contents).toContain('Claude Answer')
    expect(contents).toContain('Gemini Answer')

    const authors = answers.map((a) => a.author)
    expect(authors).toContain('0x0chatgpt')
    expect(authors).toContain('0x0claude')
    expect(authors).toContain('0x0gemini')
  })

  it('should skip AI if API key is missing', async () => {
    delete process.env.OPENAI_API_KEY

    const db = getDB()
    const qResult = await db.run(
      'INSERT INTO questions (title, content, author) VALUES (?, ?, ?)',
      ['Q', 'C', 'u']
    )
    const questionId = qResult.lastID

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          content: [{ text: 'Answer' }],
          choices: [{ message: { content: 'Answer' } }],
          candidates: [{ content: { parts: [{ text: 'Answer' }] } }]
        })
    })

    await triggerAIAnswers(questionId, 'Q', 'C')
    await new Promise((r) => setTimeout(r, 100))

    const answers = await db.all('SELECT * FROM answers WHERE question_id = ?', [questionId])
    // Only Claude and Gemini should have answered
    expect(answers.length).toBe(2)
  })
})
