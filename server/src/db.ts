import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import { sql } from '@vercel/postgres'

/**
 * Interface that abstraction both SQLite and Postgres
 */
export interface IDatabase {
  all(query: string, params?: any[]): Promise<any[]>
  get(query: string, params?: any[]): Promise<any>
  run(query: string, params?: any[]): Promise<{ lastID?: any }>
  exec(query: string): Promise<void>
}

let db: IDatabase | null = null

class SQLiteWrapper implements IDatabase {
  private sqlite: Database
  constructor(sqlite: Database) {
    this.sqlite = sqlite
  }
  async all(query: string, params: any[] = []) {
    return this.sqlite.all(query, params)
  }
  async get(query: string, params: any[] = []) {
    return this.sqlite.get(query, params)
  }
  async run(query: string, params: any[] = []) {
    const result = await this.sqlite.run(query, params)
    return { lastID: result.lastID }
  }
  async exec(query: string) {
    await this.sqlite.exec(query)
  }
}

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
    // Map SQLite specific returning behavior if needed
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

  /**
   * Simple converter from SQLite ? to Postgres $1, $2...
   */
  private toPostgres(query: string): string {
    let index = 1
    let pgQuery = query.replace(/\?/g, () => `$${index++}`)
    // Handle primary key differences if necessary
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

export const initDB = async () => {
  if (db) return db

  if (process.env.VERCEL || process.env.POSTGRES_URL) {
    console.log('Using Vercel Postgres')
    db = new PostgresWrapper()
  } else {
    console.log('Using Local SQLite')
    const filename = './database.sqlite'
    const sqlite = await open({
      filename,
      driver: sqlite3.Database
    })
    db = new SQLiteWrapper(sqlite)
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      author TEXT,
      ipfsHash TEXT,
      bounty TEXT,
      votes INTEGER DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER,
      content TEXT NOT NULL,
      author TEXT,
      ipfsHash TEXT,
      votes INTEGER DEFAULT 0,
      is_accepted BOOLEAN DEFAULT 0,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS invoices (
      payment_hash TEXT PRIMARY KEY,
      amount INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_paid BOOLEAN DEFAULT 0
    );
  `)

  return db
}

export const getDB = () => {
  if (!db) throw new Error('Database not initialized')
  return db
}
