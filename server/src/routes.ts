import express, { type Request, type Response } from 'express'
import { getDB, seedDB } from './db.js'
import { releaseBounty, payoutReward } from './services/contract.js'
import { logger } from './utils/logger.js'

const router = express.Router()

// Health check
router.get('/ping', (_req: Request, res: Response) => {
  res.json({
    status: 'alive',
    db: 'Vercel Postgres',
    time: new Date().toISOString()
  })
})

// Debug database
router.get('/debug-db', async (_req: Request, res: Response) => {
  try {
    const db = getDB()
    const url = process.env.POSTGRES_URL || 'NOT_SET'
    const maskedUrl = url.replace(/:[^@:]+@/, ':****@')

    // Check tables in public schema
    const tables = await db.all(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    const questionsCount = await db
      .get('SELECT COUNT(*) as count FROM questions')
      .catch(() => ({ count: 'TABLE_NOT_FOUND' }))

    res.json({
      url: maskedUrl,
      env: process.env.NODE_ENV,
      tables: tables.map((t) => t.table_name),
      questionsCount: questionsCount.count,
      vercelEnv: process.env.VERCEL_ENV || 'local'
    })
  } catch (error) {
    res.status(500).json({
      error: 'Debug failed',
      message: (error as any).message,
      stack: (error as any).stack
    })
  }
})

// Debug AI configuration
router.get('/debug-ai', async (_req: Request, res: Response) => {
  res.json({
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    google: !!process.env.GOOGLE_API_KEY,
    xai: !!process.env.XAI_API_KEY,
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  })
})

// Seed database
router.get('/seed', async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true'
    const result = await seedDB(force)
    res.json(result)
  } catch (error) {
    logger.error({ error, msg: 'SEED_ERROR' })
    res.status(500).json({ error: 'Seed failed', message: (error as any).message })
  }
})

// GET /feed (Latest 20 questions with answers)
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const db = getDB()
    const sort = (req.query.sort as string) || 'newest'

    let questionsQuery = ''
    if (sort === 'unanswered') {
      questionsQuery = `
        SELECT q.* FROM questions q 
        LEFT JOIN answers a ON q.id = a.question_id 
        GROUP BY q.id 
        HAVING COUNT(a.id) = 0 
        ORDER BY q.timestamp DESC 
        LIMIT 20
      `
    } else if (sort === 'active') {
      // Sort by most recent activity (latest question or latest answer)
      questionsQuery = `
        SELECT q.*, GREATEST(q.timestamp, COALESCE(MAX(a.timestamp), q.timestamp)) as last_activity
        FROM questions q
        LEFT JOIN answers a ON q.id = a.question_id
        GROUP BY q.id
        ORDER BY last_activity DESC
        LIMIT 20
      `
    } else {
      // Default: newest
      questionsQuery = `
        SELECT * FROM questions 
        ORDER BY timestamp DESC 
        LIMIT 20
      `
    }

    const questions = await db.all(questionsQuery)

    if (questions.length === 0) return res.json([])

    // 2. Get answers for these questions
    const questionIds = questions.map((q) => q.id)
    const qMarkPlaceholders = questionIds.map(() => '?').join(',')

    const answers = await db.all(
      `
            SELECT * FROM answers 
            WHERE question_id IN (${qMarkPlaceholders})
            ORDER BY timestamp ASC
        `,
      questionIds
    )

    // 3. Get all users for mapping
    const allUsers = await db.all('SELECT * FROM users')
    const userHandleMap = new Map<string, string>()
    allUsers.forEach((u) => {
      if (u.address && u.handle) {
        userHandleMap.set(u.address.toLowerCase(), u.handle)
      }
    })

    // 4. Nest answers within questions and attach handles
    const feed = questions.map((q) => ({
      ...q,
      handle: userHandleMap.get(q.author.toLowerCase()),
      answers: answers
        .filter((a) => a.question_id === q.id)
        .map((a) => ({
          ...a,
          handle: userHandleMap.get(a.author.toLowerCase())
        }))
    }))

    res.json(feed)
  } catch (error) {
    logger.error({ error, msg: 'FEED_ERROR' })
    res.status(500).json({
      error: 'Failed to fetch feed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
})

// GET /questions/:id (Single question with all answers)
router.get('/questions/:id', async (req: Request, res: Response) => {
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

    // Map authors to handles
    const allUsers = await db.all('SELECT * FROM users')
    const userHandleMap = new Map<string, string>()
    allUsers.forEach((u) => {
      if (u.address && u.handle) {
        userHandleMap.set(u.address.toLowerCase(), u.handle)
      }
    })

    res.json({
      ...question,
      handle: userHandleMap.get(question.author.toLowerCase()),
      answers: answers.map((a: any) => ({
        ...a,
        handle: userHandleMap.get(a.author.toLowerCase())
      }))
    })
  } catch (error) {
    logger.error({ error, msg: 'QUESTION_ID_ERROR', id: req.params.id })
    res.status(500).json({ error: 'Failed to fetch question' })
  }
})

// GET /search (Free access)
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query
    if (!q) return res.json([])

    const db = getDB()
    const query = `%${q}%`

    // Search title, content, or author handle
    const results = await db.all(
      `
            SELECT q.* FROM questions q
            LEFT JOIN users u ON LOWER(q.author) = LOWER(u.address)
            WHERE q.title LIKE ? OR q.content LIKE ? OR u.handle LIKE ?
            ORDER BY q.votes DESC
        `,
      [query, query, query]
    )

    res.json(results)
  } catch (_error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

// POST /questions (Paid)
router.post('/questions', async (req: Request, res: Response) => {
  try {
    const { title, content, tags, author, bounty } = req.body
    const db = getDB()

    const result = await db.run(
      `
            INSERT INTO questions (title, content, tags, author, bounty)
            VALUES (?, ?, ?, ?, ?)
        `,
      [title, content, tags, author, bounty]
    )

    logger.info({ msg: 'Question created', id: result.lastID, author, bounty })

    // Automatically trigger AI answers (Awaited for stability in serverless environments like Vercel)
    try {
      const { triggerAIAnswers } = await import('./services/llm.js')
      await triggerAIAnswers(result.lastID, title, content)
    } catch (triggerErr) {
      logger.error({ err: triggerErr, msg: 'AI answer trigger failed', questionId: result.lastID })
    }

    res.status(201).json({
      id: result.lastID,
      message: 'Question created successfully'
    })
  } catch (error) {
    logger.error({ error, msg: 'CREATE_QUESTION_ERROR', body: req.body })
    res.status(500).json({ error: 'Failed to create question' })
  }
})

// POST /answers (Paid)
router.post('/answers', async (req: Request, res: Response) => {
  try {
    const { questionId, content, author } = req.body
    const db = getDB()

    const result = await db.run(
      `
            INSERT INTO answers (question_id, content, author)
            VALUES (?, ?, ?)
        `,
      [questionId, content, author]
    )

    logger.info({ msg: 'Answer posted', id: result.lastID, questionId, author })

    res.status(201).json({
      id: result.lastID,
      message: 'Answer posted successfully'
    })
  } catch (error) {
    logger.error({ error, msg: 'CREATE_ANSWER_ERROR', body: req.body })
    res.status(500).json({ error: 'Failed to post answer' })
  }
})

// POST /answers/:id/accept (Release Bounty)
router.post('/answers/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { asker } = req.body
    const db = getDB()

    // 1. Get details first
    const answer = await db.get(`SELECT * FROM answers WHERE id = ?`, [id])
    if (!answer) return res.status(404).json({ error: 'Answer not found' })

    const question = await db.get(`SELECT * FROM questions WHERE id = ?`, [answer.question_id])
    if (!question) return res.status(404).json({ error: 'Question not found' })

    // Security Check: Only the asker can accept
    if (!asker || question.author.toLowerCase() !== asker.toLowerCase()) {
      return res.status(403).json({ error: 'Only the question author can accept answers' })
    }

    // Check if already accepted
    if (answer.is_accepted) {
      return res.status(400).json({ error: 'Answer already accepted' })
    }

    // 2. Mark as accepted in DB
    await db.run(`UPDATE answers SET is_accepted = TRUE WHERE id = ?`, [id])

    // 3. Trigger smart contract payout
    // Release the bounty on-chain (using title as key to match how it was paid in useStore.ts)
    try {
      const txHash = await releaseBounty(question.title, answer.author)
      logger.info({
        msg: 'Bounty released',
        questionId: question.id,
        winner: answer.author,
        txHash
      })
      res.json({
        message: 'Answer accepted and bounty release triggered',
        txHash
      })
    } catch (contractError) {
      logger.error({ err: contractError, msg: 'Failed to release bounty on-chain' })
      res.status(500).json({ error: 'Failed to release bounty on-chain' })
    }
  } catch (error) {
    logger.error({ error, msg: 'ACCEPT_ANSWER_ERROR', id: req.params.id })
    res.status(500).json({ error: 'Failed to accept answer' })
  }
})

// GET /leaderboard
router.get('/leaderboard', async (_req: Request, res: Response) => {
  try {
    const db = getDB()

    // Fetch all answers and questions to support MockDatabase which lacks JOIN
    // In production with real SQL, a JOIN would be more efficient, but this ensures test compatibility
    const allAnswers = await db.all('SELECT * FROM answers')
    const allQuestions = await db.all('SELECT * FROM questions')
    const allUsers = await db.all('SELECT * FROM users')

    const userHandleMap = new Map<string, string>()
    allUsers.forEach((u) => {
      if (u.address && u.handle) {
        userHandleMap.set(u.address.toLowerCase(), u.handle)
      }
    })

    const questionBounties = new Map<number, string>()
    allQuestions.forEach((q) => {
      questionBounties.set(q.id, q.bounty)
    })

    const stats: Record<string, { accepted: number; earned: bigint }> = {}

    for (const a of allAnswers) {
      // Handle varying formats of truthiness (Mock uses boolean, some SQL uses 1/0)
      const isAccepted = a.is_accepted === 1 || a.is_accepted === true || a.is_accepted === 'true'

      if (!isAccepted) continue

      const address = a.author
      if (!stats[address]) {
        stats[address] = { accepted: 0, earned: 0n }
      }

      stats[address].accepted += 1

      const bountyStr = questionBounties.get(a.question_id)
      if (bountyStr) {
        try {
          const cleanBounty = bountyStr.toString().split(' ')[0]
          // Simple heuristic: if it contains '.', it's likely ETH, otherwise Wei
          const val = cleanBounty.includes('.') ? 0n : BigInt(cleanBounty)
          stats[address].earned += val
        } catch (_e) {
          // ignore parsing error
        }
      }
    }

    // Convert to arrays and sort
    const allUsersStats = Object.entries(stats).map(([address, data]) => {
      const handle = userHandleMap.get(address.toLowerCase())
      return {
        author: handle || address, // Use handle if available, else address
        accepted: data.accepted,
        earned: data.earned.toString()
      }
    })

    const topSolvers = [...allUsersStats].sort((a, b) => b.accepted - a.accepted).slice(0, 10)

    // Sort by earned amount (BigInt comparison)
    const topEarners = [...allUsersStats]
      .sort((a, b) => {
        const valA = BigInt(a.earned)
        const valB = BigInt(b.earned)
        return valA < valB ? 1 : valA > valB ? -1 : 0
      })
      .slice(0, 10)

    res.json({ topSolvers, topEarners })
  } catch (error) {
    logger.error({ error, msg: 'LEADERBOARD_ERROR' })
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// POST /rewards (Manual Payout)
// TODO: Protect this with admin middleware in production
router.post('/rewards', async (req: Request, res: Response) => {
  try {
    const { winner, amount } = req.body
    if (!winner || !amount) {
      return res.status(400).json({ error: 'Missing winner or amount' })
    }

    const txHash = await payoutReward(winner, amount)
    res.json({ message: 'Reward payout triggered', txHash })
  } catch (error) {
    logger.error({ error, msg: 'REWARD_PAYOUT_ERROR', body: req.body })
    res.status(500).json({ error: 'Failed to payout reward' })
  }
})

// GET /users/:address
router.get('/users/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params
    const db = getDB()
    const user = await db.get('SELECT * FROM users WHERE address = ?', [address])

    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (error) {
    logger.error({ error, msg: 'GET_USER_ERROR' })
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /users
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { address, handle } = req.body

    if (!address || !handle) {
      return res.status(400).json({ error: 'Address and handle are required' })
    }

    const db = getDB()

    // Check if handle is already taken by another address
    const existingUser = await db.get('SELECT * FROM users WHERE handle = ?', [handle])
    if (existingUser && existingUser.address.toLowerCase() !== address.toLowerCase()) {
      return res.status(409).json({ error: 'Handle already taken' })
    }

    // Simple upsert by deleting first (mock/sqlite friendly for this setup)
    // In production postgres, we'd use ON CONFLICT DO UPDATE
    // But since we have a mock DB that is simplistic, let's keep it robust for both

    // For real DB (postgres), let's use standard INSERT ON CONFLICT
    let query = `
      INSERT INTO users (address, handle) 
      VALUES (?, ?)
      ON CONFLICT (address) DO UPDATE SET handle = EXCLUDED.handle
      RETURNING address
    `

    // Adjust for basic SQLite (no ON CONFLICT in standard INSERT syntax used by some simple drivers unless explicitly supported,
    // but Vercel Postgres supports it).
    // BUT our MockDatabase 'run' handles "INSERT INTO users" with specific upsert logic for testing.

    try {
      await db.run(query, [address, handle])
    } catch (err: any) {
      // If it's a unique constraint violation on HANDLE (different address has this handle)
      if (err.message && err.message.includes('unique')) {
        return res.status(409).json({ error: 'Handle already taken' })
      }
      // Fallback for mocked environment if needed, or rethrow
      throw err
    }

    res.json({ message: 'User updated', address, handle })
  } catch (error) {
    logger.error({ error, msg: 'UPDATE_USER_ERROR' })
    res.status(500).json({ error: 'Failed to update user' })
  }
})

export default router
