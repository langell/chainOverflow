import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import { app } from '../src/index'
import { initDB, getDB } from '../src/db'

describe('Server API', () => {
  beforeAll(async () => {
    await initDB()
  })

  it('GET / should return health check message', async () => {
    const res = await request(app).get('/')
    expect(res.status).toBe(200)
    expect(res.text).toContain('ChainOverflow API is running')
  })

  describe.skip('GET /api/feed', () => {
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
  })

  describe.skip('GET /api/questions/:id', () => {
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

  describe.skip('GET /api/search', () => {
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
        .send({ title: 'Paid Question', content: 'Paid Content', tags: 'paid', author: 'RichUser' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBeDefined()
      expect(res.body.ipfsHash).toBeDefined()
    })
  })

  describe('POST /api/answers (Protected)', () => {
    it('should return 402 without auth', async () => {
      const res = await request(app).post('/api/answers').send({ questionId: 1, content: 'Ans' })
      expect(res.status).toBe(402)
    })

    it('should create answer with valid auth', async () => {
      const validPreimage = 'valid_preimage_longer_than_5'
      const res = await request(app)
        .post('/api/answers')
        .set('Authorization', `L402 token:${validPreimage}`)
        .send({ questionId: 1, content: 'Paid Answer', author: 'Expert' })

      expect(res.status).toBe(201)
      expect(res.body.id).toBeDefined()
    })
  })
})
