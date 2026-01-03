import { sql } from '@vercel/postgres'

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
    const { rows } = await sql.query(pgQuery, params)
    return rows
  }

  async get(query: string, params: any[] = []) {
    const pgQuery = this.toPostgres(query)
    const { rows } = await sql.query(pgQuery, params)
    return rows[0]
  }

  async run(query: string, params: any[] = []) {
    let pgQuery = this.toPostgres(query)
    if (pgQuery.trim().toLowerCase().startsWith('insert')) {
      pgQuery += ' RETURNING id'
    }
    const { rows } = await sql.query(pgQuery, params)
    return { lastID: rows[0]?.id }
  }

  async exec(query: string) {
    const pgQuery = this.toPostgres(query)
    await sql.query(pgQuery)
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
 * In-memory mock for tests so we don't need a real Postgres URL in CI
 */
class MockDatabase implements IDatabase {
  private data: any = { questions: [], answers: [], invoices: [] }
  private lastId = 0

  async all(query: string, _params: any[] = []) {
    if (query.includes('questions')) return this.data.questions
    if (query.includes('answers')) return this.data.answers
    return []
  }
  async get(query: string, _params: any[] = []) {
    if (query.includes('FROM questions')) return this.data.questions[0]
    return null
  }
  async run(_query: string, _params: any[] = []) {
    this.lastId++
    return { lastID: this.lastId }
  }
  async exec(_query: string) {
    return
  }
}

export const initDB = async () => {
  if (db) return db

  if (process.env.NODE_ENV === 'test') {
    console.log('Using Mock Database for tests')
    db = new MockDatabase()
    return db
  }

  console.log('Initializing Vercel Postgres...')
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

export const getDB = () => {
  if (!db) throw new Error('Database not initialized.')
  return db
}
