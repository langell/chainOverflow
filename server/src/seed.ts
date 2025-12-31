import { initDB } from './db'

const seedData = async () => {
  const db = await initDB()

  console.log('Seeding data...')

  // Clear existing data (optional, but good for a fresh start)
  await db.run('DELETE FROM questions')
  await db.run('DELETE FROM answers')
  await db.run('DELETE FROM sqlite_sequence WHERE name IN ("questions", "answers")')

  // Seed Questions
  const questions = [
    {
      title: 'How to integrate x402 with Express?',
      content:
        'I am looking for a complete guide on implementing the x402 payment protocol in an Express.js backend.',
      tags: 'x402,express,javascript',
      author: 'satoshiman',
      ipfsHash: 'QmX402Guide',
      bounty: '1000',
      votes: 15
    },
    {
      title: 'Best practices for IPFS content pinning?',
      content:
        'What are the pros and cons of using Pinata vs hosting your own IPFS node for a decentralized application?',
      tags: 'ipfs,storage,web3',
      author: 'ipfs_explorer',
      ipfsHash: 'QmIPFSBestPractices',
      bounty: '500',
      votes: 8
    },
    {
      title: 'React Zustand vs Context API for global state?',
      content:
        'When should I choose Zustand over the built-in React Context API for managing global state in a high-performance app?',
      tags: 'react,state-management,zustand',
      author: 'frontend_ninja',
      ipfsHash: 'QmZustandVsContext',
      bounty: '250',
      votes: 12
    }
  ]

  for (const q of questions) {
    const result = await db.run(
      `
      INSERT INTO questions (title, content, tags, author, ipfsHash, bounty, votes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [q.title, q.content, q.tags, q.author, q.ipfsHash, q.bounty, q.votes]
    )

    const questionId = result.lastID

    // Seed some answers for the first question
    if (q.title.includes('x402')) {
      await db.run(
        `
        INSERT INTO answers (question_id, content, author, ipfsHash, votes, is_accepted)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          questionId,
          'The best way is to use the @x402/express middleware directly. It handles the 402 challenge automatically.',
          'lbolt_expert',
          'QmAnswer1',
          5,
          1
        ]
      )

      await db.run(
        `
        INSERT INTO answers (question_id, content, author, ipfsHash, votes, is_accepted)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
        [
          questionId,
          'Make sure your frontend can handle the 402 status code and present a payment UI to the user.',
          'ux_guru',
          'QmAnswer2',
          2,
          0
        ]
      )
    }
  }

  console.log('Seeding complete!')
  process.exit(0)
}

seedData().catch((err) => {
  console.error('Error seeding data:', err)
  process.exit(1)
})
