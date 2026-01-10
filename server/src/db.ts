import { db as pool } from '@vercel/postgres'

/**
 * Interface that abstracts database operations
 */
export interface IDatabase {
  all(query: string, params?: any[]): Promise<any[]>
  get(query: string, params?: any[]): Promise<any>
  run(query: string, params?: any[]): Promise<{ lastID?: any }>
  exec(query: string): Promise<void>
}

let db: IDatabase | null = null

class PostgresWrapper implements IDatabase {
  async all(query: string, params: any[] = []) {
    const pgQuery = this.toPostgres(query)
    const client = await pool.connect()
    try {
      const { rows } = await client.query(pgQuery, params)
      return rows
    } finally {
      client.release()
    }
  }

  async get(query: string, params: any[] = []) {
    const pgQuery = this.toPostgres(query)
    const client = await pool.connect()
    try {
      const { rows } = await client.query(pgQuery, params)
      return rows[0]
    } finally {
      client.release()
    }
  }

  async run(query: string, params: any[] = []) {
    let pgQuery = this.toPostgres(query)
    if (pgQuery.trim().toLowerCase().startsWith('insert')) {
      pgQuery += ' RETURNING id'
    }
    const client = await pool.connect()
    try {
      const { rows } = await client.query(pgQuery, params)
      return { lastID: rows[0]?.id }
    } finally {
      client.release()
    }
  }

  async exec(query: string) {
    const pgQuery = this.toPostgres(query)
    const client = await pool.connect()
    try {
      await client.query(pgQuery)
    } finally {
      client.release()
    }
  }

  private toPostgres(query: string): string {
    let index = 1
    let pgQuery = query.replace(/\?/g, () => `$${index++}`)
    pgQuery = pgQuery.replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
    pgQuery = pgQuery.replace(
      /DATETIME DEFAULT CURRENT_TIMESTAMP/gi,
      'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
    )
    pgQuery = pgQuery.replace(/BOOLEAN DEFAULT 0/gi, 'BOOLEAN DEFAULT FALSE')
    pgQuery = pgQuery.replace(/BOOLEAN DEFAULT 1/gi, 'BOOLEAN DEFAULT TRUE')
    return pgQuery
  }
}

/**
 * In-memory mock for tests
 */
class MockDatabase implements IDatabase {
  private questions: any[] = []
  private answers: any[] = []
  private lastId = 0

  async all(query: string, params: any[] = []) {
    const q = query.toLowerCase()
    if (q.includes('where title like')) {
      const term = params[0].replace(/%/g, '').toLowerCase()
      return this.questions.filter((item) => item.title.toLowerCase().includes(term))
    }

    if (q.includes('from questions')) {
      // Basic simulation of HAVING COUNT(a.id) = 0
      if (q.includes('having count(a.id) = 0')) {
        return this.questions.filter((q) => {
          const hasAnswers = this.answers.some((a) => a.question_id === q.id)
          return !hasAnswers
        })
      }
      return this.questions
    }

    if (q.includes('from answers')) {
      if (q.includes('where question_id in')) {
        // Simple mock: assume questionIds are passed
        return this.answers.filter((a) => params.includes(a.question_id))
      }
      return this.answers
    }
    return []
  }

  async get(query: string, params: any[] = []) {
    const q = query.toLowerCase()
    if (q.includes('from questions where id = ?')) {
      return this.questions.find(
        (item) => item.id == (typeof params[0] === 'string' ? parseInt(params[0]) : params[0])
      )
    }
    if (q.includes("from questions where title = 'single q'")) {
      return this.questions.find((item) => item.title === 'Single Q')
    }
    if (q.includes('from questions where id = ?')) {
      const id = typeof params[0] === 'string' ? parseInt(params[0]) : params[0]
      return this.questions.find((item) => item.id == id) || null
    }
    if (q.includes('from answers where id = ?')) {
      const id = typeof params[0] === 'string' ? parseInt(params[0]) : params[0]
      return this.answers.find((a) => a.id == id) || null
    }
    return this.questions[0] || null
  }

  async run(query: string, params: any[] = []) {
    const q = query.toLowerCase()
    if (q.includes('delete from questions')) {
      this.questions = []
      return {}
    }
    if (q.includes('delete from answers')) {
      this.answers = []
      return {}
    }
    if (q.includes('insert into questions')) {
      this.lastId++
      const colsPart = q.match(/\((.*?)\)/)?.[1] || ''
      const cols = colsPart.split(',').map((c) => c.trim())

      const newQ: any = {
        id: this.lastId,
        title: '',
        content: '',
        tags: '',
        author: '',
        bounty: '0',
        ipfsHash: 'mock-ipfs',
        votes: 0,
        timestamp: new Date().toISOString(),
        answers: []
      }

      if (cols.length > 0 && params.length === cols.length) {
        cols.forEach((col, i) => {
          if (col === 'tags' && Array.isArray(params[i])) {
            newQ[col] = params[i].join(',')
          } else {
            newQ[col] = params[i]
          }
        })
      } else {
        newQ.title = params[0]
        newQ.content = params[1]
        newQ.tags = params[2] || ''
        newQ.author = params[3] || ''
        newQ.bounty = params[4] || '0'
        newQ.ipfsHash = params[5] || 'mock-ipfs'
      }

      this.questions.push(newQ)
      return { lastID: this.lastId }
    }
    if (q.includes('insert into answers')) {
      this.lastId++
      const colsPart = q.match(/\((.*?)\)/)?.[1] || ''
      const cols = colsPart.split(',').map((c) => c.trim())

      const newA: any = {
        id: this.lastId,
        question_id: 0,
        content: '',
        author: '',
        ipfsHash: 'mock-ipfs',
        votes: 0,
        is_accepted: false,
        timestamp: new Date().toISOString()
      }

      if (cols.length > 0 && params.length === cols.length) {
        cols.forEach((col, i) => {
          newA[col] = params[i]
        })
      } else {
        newA.question_id = params[0]
        newA.content = params[1]
        newA.author = params[2]
        newA.ipfsHash = params[3] || 'mock-ipfs'
      }

      this.answers.push(newA)
      return { lastID: this.lastId }
    }
    if (q.includes('update answers set is_accepted = true')) {
      const id = typeof params[0] === 'string' ? parseInt(params[0]) : params[0]
      const answer = this.answers.find((a) => a.id == id)
      if (answer) answer.is_accepted = true
      return {}
    }
    return { lastID: ++this.lastId }
  }

  async exec(_query: string) {
    return
  }
}

export const initDB = async () => {
  if (db) return db

  if (process.env.NODE_ENV === 'test') {
    db = new MockDatabase()
    return db
  }

  console.log('Initializing Vercel Postgres Pool...')
  db = new PostgresWrapper()

  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        tags TEXT,
        author TEXT,
        ipfsHash TEXT,
        bounty TEXT,
        votes INTEGER DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS answers (
        id SERIAL PRIMARY KEY,
        question_id INTEGER REFERENCES questions(id),
        content TEXT NOT NULL,
        author TEXT,
        ipfsHash TEXT,
        votes INTEGER DEFAULT 0,
        is_accepted BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS invoices (
        payment_hash TEXT PRIMARY KEY,
        amount INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_paid BOOLEAN DEFAULT FALSE
      );
    `)
  } catch (err) {
    console.log('DB init warning:', (err as any).message)
  }

  return db
}

export const seedDB = async (force: boolean = false) => {
  await initDB()
  const client = await pool.connect()

  try {
    if (!force) {
      const { rows } = await client.query('SELECT id FROM questions LIMIT 1')
      if (rows.length > 0) {
        return { message: 'Database already has data. Skipping seed.' }
      }
    } else {
      console.log('Force re-seeding...')
      await client.query('DELETE FROM answers')
      await client.query('DELETE FROM questions')
    }

    console.log('Seeding database started...')

    const q1 = await client.query(
      `INSERT INTO questions (title, content, tags, author, bounty, ipfsHash) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        'How to implement L402 in Express?',
        'I am trying to add payment-required headers to my API. Any examples?',
        'l402,express,bitcoin',
        '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        '100000000000000',
        'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'
      ]
    )
    console.log('Seed: Inserted Q1, ID:', q1.rows[0].id)

    const q2 = await client.query(
      `INSERT INTO questions (title, content, tags, author, bounty, ipfsHash) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        'Vercel Postgres vs SQLite for serverless?',
        'Why does SQLite crash on Vercel but work locally?',
        'vercel,postgres,sqlite',
        '0x4db2460Bdec9A87EE212001A848D080C0B080808',
        '50000000000000',
        'QmYwAPJzvT97TjRAnz8MhC5Mhy15TJJFFG3oXW4G4yXkKA'
      ]
    )
    console.log('Seed: Inserted Q2, ID:', q2.rows[0].id)

    return {
      message: 'Seed successful',
      questionsAdded: 2,
      ids: [q1.rows[0].id, q2.rows[0].id]
    }
  } catch (error) {
    console.error('CRITICAL SEED ERROR:', error)
    throw error
  } finally {
    client.release()
  }
}

export const getDB = () => {
  if (!db) throw new Error('Database not initialized.')
  return db
}
