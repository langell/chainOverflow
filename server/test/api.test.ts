import { describe, it, expect, beforeAll, vi } from 'vitest'
import request from 'supertest'
import { app } from '../src/index'
import { initDB, getDB } from '../src/db'

describe('Server API', () => {
  beforeAll(async () => {
    vi.mock('../src/services/contract', () => ({
      releaseBounty: vi.fn().mockResolvedValue('0xmocktxhash'),
      verifyPayment: vi.fn().mockResolvedValue({ valid: true }),
      payoutReward: vi.fn().mockResolvedValue('0xmockrewardhash')
    }))
    await initDB()
  })

  it('GET / should return health check message', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('ChainOverflow API is running')
  })

  describe('GET /api/feed', () => {
    it('should return latest questions with answers', async () => {
      const db = getDB()
      await db.run('DELETE FROM questions')
      await db.run('DELETE FROM answers')

      const result = await db.run(
        `INSERT INTO questions (title, content, author) VALUES (?, ?, ?)`,
        ['Feed Q', 'Feed Content', 'Feeder']
      )
      const questionId = result.lastID
      await db.run(`INSERT INTO answers (question_id, content, author) VALUES (?, ?, ?)`, [
        questionId,
        'Feed Ans',
        'Answereer'
      ])

      const res = await request(app).get('/api/feed')
      expect(res.status).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
      const question = res.body.find((item: any) => item.id === questionId)
      expect(question).toBeDefined()
      expect(question.answers.length).toBe(1)
      expect(question.answers[0].content).toBe('Feed Ans')
    })

    it('should support sort=unanswered', async () => {
      const db = getDB()
      await db.run('DELETE FROM questions')
      await db.run('DELETE FROM answers')
      // Insert one with answer, one without
      await db.run('INSERT INTO questions (title, content, author) VALUES (?, ?, ?)', [
        'Answered',
        '...',
        'A'
      ])
      const q = await db.get('SELECT id FROM questions WHERE title = "Answered"')
      await db.run('INSERT INTO answers (question_id, content, author) VALUES (?, ?, ?)', [
        q.id,
        'ans',
        'B'
      ])
      await db.run('INSERT INTO questions (title, content, author) VALUES (?, ?, ?)', [
        'Unanswered',
        '...',
        'A'
      ])

      const res = await request(app).get('/api/feed?sort=unanswered')
      expect(res.status).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
      expect(res.body.every((q: any) => q.answers.length === 0)).toBe(true)
    })

    it('should support sort=active', async () => {
      const res = await request(app).get('/api/feed?sort=active')
      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })
  })

  describe('GET /api/questions/:id', () => {
    it('should return a single question with answers', async () => {
      const db = getDB()
      await db.run(`INSERT INTO questions (title, content, author) VALUES (?, ?, ?)`, [
        'Single Q',
        'Single Content',
        'Singular'
      ])
      const q = await db.get(`SELECT id FROM questions WHERE title = 'Single Q'`)

      const res = await request(app).get(`/api/questions/${q.id}`)
      expect(res.status).toBe(200)
      expect(res.body.title).toBe('Single Q')
      expect(Array.isArray(res.body.answers)).toBe(true)
    })

    it('should return 404 if question not found', async () => {
      const res = await request(app).get('/api/questions/999999')
      expect(res.status).toBe(404)
    })
  })

  describe('GET /api/search', () => {
    it('should return empty list for empty query', async () => {
      const res = await request(app).get('/api/search')
      expect(res.status).toBe(200)
      expect(res.body).toEqual([])
    })

    it('should return results for valid query', async () => {
      const db = getDB()
      await db.run(`INSERT INTO questions (title, content, author) VALUES (?, ?, ?)`, [
        'Test Search',
        'Content',
        'Tester'
      ])

      const res = await request(app).get('/api/search?q=Search')
      expect(res.status).toBe(200)
      expect(res.body.length).toBeGreaterThan(0)
      expect(res.body[0].title).toBe('Test Search')
    })
  })

  describe('POST /api/questions (Protected)', () => {
    it('should return 402 if no authorization header', async () => {
      const res = await request(app)
        .post('/api/questions')
        .send({ title: 'New Q', content: 'test' })

      expect(res.status).toBe(402)
      expect(res.headers['www-authenticate']).toBeDefined()
    })

    it('should return 402 if authorization header format is invalid', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'InvalidFormat')
        .send({ title: 'New Q', content: 'test' })

      expect(res.status).toBe(402)
    })

    it('should return 402 if scheme is not L402', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New Q', content: 'test' })

      expect(res.status).toBe(402)
    })

    it('should return 402 if payment proof is invalid', async () => {
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', 'L402 token:short')
        .send({ title: 'New Q', content: 'test' })

      expect(res.status).toBe(402)
      expect(res.body.error).toBe('Invalid payment proof')
    })

    it('should create question if payment proof is valid', async () => {
      const validPreimage = 'valid_preimage_longer_than_5'
      const res = await request(app)
        .post('/api/questions')
        .set('Authorization', `L402 token:${validPreimage}`)
        .send({
          title: 'Paid Question',
          content: 'Paid Content',
          tags: 'paid',
          author: 'RichUser',
          ipfsHash: 'mock-ipfs'
        })

      expect(res.status).toBe(201)
      expect(res.body.id).toBeDefined()
    })
  })

  describe('POST /api/answers (Free)', () => {
    it('should create answer without payment', async () => {
      const res = await request(app).post('/api/answers').send({ questionId: 1, content: 'Ans' })
      expect(res.status).toBe(201)
    })

    it('should create answer with legacy auth (ignored)', async () => {
      const validPreimage = 'valid_preimage'
      const res = await request(app)
        .post('/api/answers')
        .set('Authorization', `L402 token:${validPreimage}`)
        .send({ questionId: 1, content: 'Paid Answer', author: 'Expert' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBeDefined()
    })
  })

  describe('POST /api/answers/:id/accept', () => {
    it('should allow asker to accept answer', async () => {
      const db = getDB()
      const q = await db.run('INSERT INTO questions (title, content, author) VALUES (?, ?, ?)', [
        'Q',
        'C',
        'Asker'
      ])
      const a = await db.run(
        'INSERT INTO answers (question_id, content, author) VALUES (?, ?, ?)',
        [q.lastID, 'A', 'Winner']
      )

      const res = await request(app)
        .post(`/api/answers/${a.lastID}/accept`)
        .send({ asker: 'Asker' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('Answer accepted')
    })

    it('should reject if not the asker', async () => {
      const db = getDB()
      const q = await db.run('INSERT INTO questions (title, content, author) VALUES (?, ?, ?)', [
        'Q',
        'C',
        'Asker'
      ])
      const a = await db.run(
        'INSERT INTO answers (question_id, content, author) VALUES (?, ?, ?)',
        [q.lastID, 'A', 'Winner']
      )

      const res = await request(app)
        .post(`/api/answers/${a.lastID}/accept`)
        .send({ asker: 'Hacker' })

      expect(res.status).toBe(403)
    })

    it('should return 404 for non-existent answer', async () => {
      const res = await request(app).post('/api/answers/999999/accept').send({ asker: 'Anybody' })
      expect(res.status).toBe(404)
    })
  })

  describe('POST /api/rewards', () => {
    it('should payout reward to valid address', async () => {
      const res = await request(app)
        .post('/api/rewards')
        .send({ winner: '0x1234567890123456789012345678901234567890', amount: '1000' })

      expect(res.status).toBe(200)
      expect(res.body.message).toContain('Reward payout triggered')
      expect(res.body.txHash).toBeDefined()
    })

    it('should fail if missing fields', async () => {
      const res = await request(app).post('/api/rewards').send({ amount: '1000' })
      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/leaderboard', () => {
    it('should return correct stats for solvers and earners', async () => {
      const db = getDB()
      await db.run('DELETE FROM questions')
      await db.run('DELETE FROM answers')

      // 1. Setup Questions with Bounties
      // MockDB doesn't support multi-row insert parsing well, so we do one by one
      await db.run(
        `INSERT INTO questions (id, title, content, author, bounty) VALUES (?, ?, ?, ?, ?)`,
        [1, 'Q1', 'C', 'Asker', '100']
      )
      await db.run(
        `INSERT INTO questions (id, title, content, author, bounty) VALUES (?, ?, ?, ?, ?)`,
        [2, 'Q2', 'C', 'Asker', '200']
      )
      await db.run(
        `INSERT INTO questions (id, title, content, author, bounty) VALUES (?, ?, ?, ?, ?)`,
        [3, 'Q3', 'C', 'Asker', '50']
      )

      // 2. Setup Answers (Accepted)
      await db.run(
        `INSERT INTO answers (question_id, content, author, is_accepted) VALUES (?, ?, ?, ?)`,
        [1, 'Ans1', 'UserA', 1]
      )
      await db.run(
        `INSERT INTO answers (question_id, content, author, is_accepted) VALUES (?, ?, ?, ?)`,
        [2, 'Ans2', 'UserA', 1]
      )
      await db.run(
        `INSERT INTO answers (question_id, content, author, is_accepted) VALUES (?, ?, ?, ?)`,
        [3, 'Ans3', 'UserB', 1]
      )
      await db.run(
        `INSERT INTO answers (question_id, content, author, is_accepted) VALUES (?, ?, ?, ?)`,
        [1, 'Ans4', 'UserC', 0]
      )

      const res = await request(app).get('/api/leaderboard')

      expect(res.status).toBe(200)

      const { topSolvers, topEarners } = res.body

      // Validation Solvers
      expect(topSolvers[0].author).toBe('UserA')
      expect(topSolvers[0].accepted).toBe(2)
      expect(topSolvers[1].author).toBe('UserB')
      expect(topSolvers[1].accepted).toBe(1)

      // Validation Earners
      expect(topEarners[0].author).toBe('UserA')
      expect(topEarners[0].earned).toBe('300')
      expect(topEarners[1].author).toBe('UserB')
      expect(topEarners[1].earned).toBe('50')
    })
  })
})
