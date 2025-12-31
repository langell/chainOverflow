import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'

let db: Database | null = null

export const initDB = async () => {
  if (db) return db

  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  })

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
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(question_id) REFERENCES questions(id)
    );
    
    CREATE TABLE IF NOT EXISTS invoices (
      payment_hash TEXT PRIMARY KEY,
      amount INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_paid BOOLEAN DEFAULT 0
    );
  `)

  console.log('Database initialized')
  return db
}

export const getDB = () => {
  if (!db) throw new Error('Database not initialized')
  return db
}
