import express from 'express'
import { getDB } from './db'

const router = express.Router()

// GET /feed (Latest 20 questions with answers)
router.get('/feed', async (req, res) => {
  try {
    const db = getDB()

    // 1. Get latest 20 questions
    const questions = await db.all(`
            SELECT * FROM questions 
            ORDER BY timestamp DESC 
            LIMIT 20
        `)

    if (questions.length === 0) return res.json([])

    // 2. Get answers for these questions
    const questionIds = questions.map((q) => q.id)
    const placeholders = questionIds.map(() => '?').join(',')

    const answers = await db.all(
      `
            SELECT * FROM answers 
            WHERE question_id IN (${placeholders})
            ORDER BY timestamp ASC
        `,
      questionIds
    )

    // 3. Nest answers within questions
    const feed = questions.map((q) => ({
      ...q,
      answers: answers.filter((a) => a.question_id === q.id)
    }))

    res.json(feed)
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch feed' })
  }
})

// GET /questions/:id (Single question with all answers)
router.get('/questions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const db = getDB()

    const question = await db.get(`SELECT * FROM questions WHERE id = ?`, [id])
    if (!question) return res.status(404).json({ error: 'Question not found' })

    const answers = await db.all(
      `
            SELECT * FROM answers 
            WHERE question_id = ? 
            ORDER BY timestamp ASC
        `,
      [id]
    )

    res.json({
      ...question,
      answers
    })
  } catch (_error) {
    res.status(500).json({ error: 'Failed to fetch question' })
  }
})

// GET /search (Free access)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json([])

    const db = getDB()
    const query = `%${q}%`

    // Simple LIKE search
    const results = await db.all(
      `
            SELECT * FROM questions 
            WHERE title LIKE ? OR content LIKE ?
            ORDER BY votes DESC
        `,
      [query, query]
    )

    res.json(results)
  } catch (_error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

// POST /questions (Paid)
router.post('/questions', async (req, res) => {
  try {
    const { title, content, tags, author, bounty } = req.body
    const db = getDB()

    // In real app: Upload to IPFS here (server-side Pinata)
    // const ipfsHash = await uploadToPinata(content)
    const ipfsHash = 'QmServerMockHash' + Date.now()

    const result = await db.run(
      `
            INSERT INTO questions (title, content, tags, author, bounty, ipfsHash)
            VALUES (?, ?, ?, ?, ?, ?)
        `,
      [title, content, tags, author, bounty, ipfsHash]
    )

    res.status(201).json({
      id: result.lastID,
      message: 'Question created successfully',
      ipfsHash
    })
  } catch (_error) {
    res.status(500).json({ error: 'Failed to create question' })
  }
})

// POST /answers (Paid)
router.post('/answers', async (req, res) => {
  try {
    const { questionId, content, author } = req.body
    const db = getDB()

    const ipfsHash = 'QmServerAnswerHash' + Date.now()

    const result = await db.run(
      `
            INSERT INTO answers (question_id, content, author, ipfsHash)
            VALUES (?, ?, ?, ?)
        `,
      [questionId, content, author, ipfsHash]
    )

    res.status(201).json({
      id: result.lastID,
      message: 'Answer posted successfully',
      ipfsHash
    })
  } catch (_error) {
    res.status(500).json({ error: 'Failed to post answer' })
  }
})

export default router
