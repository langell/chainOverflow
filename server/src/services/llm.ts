import { getDB } from '../db.js'
import { logger } from '../utils/logger.js'

const AI_CONFIG = [
  { name: 'ChatGPT', address: '0x0ChatGPT', envKey: 'OPENAI_API_KEY' },
  { name: 'Claude', address: '0x0Claude', envKey: 'ANTHROPIC_API_KEY' },
  { name: 'Gemini', address: '0x0Gemini', envKey: 'GOOGLE_API_KEY' }
]

/**
 * Ensures that the AI users are registered in the database with their respective handles.
 */
const ensureAIUsers = async () => {
  const db = getDB()
  for (const ai of AI_CONFIG) {
    try {
      // Use the existing users table logic - upsert handle for these specific addresses
      await db.run(
        `INSERT INTO users (address, handle) 
         VALUES (?, ?)
         ON CONFLICT (address) DO UPDATE SET handle = EXCLUDED.handle`,
        [ai.address.toLowerCase(), ai.name]
      )
    } catch (_error) {
      // Silently fail if ON CONFLICT is not supported by the current DB driver (e.g. Mock)
      // or if there's a unique constraint issue.
      logger.debug({ msg: 'AI User ensure failed (expected in some envs)', ai: ai.name })
    }
  }
}

export const triggerAIAnswers = async (questionId: number, title: string, content: string) => {
  await ensureAIUsers()

  const tasks = AI_CONFIG.map(async (ai) => {
    const apiKey = process.env[ai.envKey]
    if (!apiKey) {
      logger.info({ msg: `Skipping AI answer: ${ai.name} key missing` })
      return
    }

    logger.debug({ msg: `Firing AI request`, ai: ai.name, questionId })
    try {
      await getAIAnswer(ai, questionId, title, content)
    } catch (err) {
      logger.error({ err, msg: `AI process failed for ${ai.name}`, questionId })
    }
  })

  return Promise.all(tasks)
}

async function getAIAnswer(
  ai: (typeof AI_CONFIG)[0],
  questionId: number,
  title: string,
  content: string
) {
  let answer: string | null = null
  logger.info({ msg: `Getting AI answer from ${ai.name}`, ai: ai.name, questionId })

  try {
    if (ai.name === 'ChatGPT') {
      answer = await callChatGPT(process.env[ai.envKey]!, title, content)
    } else if (ai.name === 'Claude') {
      answer = await callClaude(process.env[ai.envKey]!, title, content)
    } else if (ai.name === 'Gemini') {
      answer = await callGemini(process.env[ai.envKey]!, title, content)
    }

    if (answer) {
      const db = getDB()
      await db.run('INSERT INTO answers (question_id, content, author) VALUES (?, ?, ?)', [
        questionId,
        answer,
        ai.address.toLowerCase()
      ])
      logger.info({ msg: `AI Answer posted`, ai: ai.name, questionId })
    }
  } catch (error) {
    logger.error({ error, msg: `API call failed for ${ai.name}`, questionId })
  }
}

async function callChatGPT(apiKey: string, title: string, content: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a helpful expert developer on ChainOverflow, a decentralized Q&A platform. Provide a technical, accurate, and concise answer to the following question. Use Markdown.'
          },
          {
            role: 'user',
            content: `Question: ${title}\n\nDescription: ${content}`
          }
        ],
        max_tokens: 1000
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('ChatGPT API Error Response:', JSON.stringify(data))
    }
    return data.choices?.[0]?.message?.content || null
  } catch (error) {
    console.error('ChatGPT Fetch Error:', error)
    logger.error({ error, msg: 'ChatGPT API Error' })
    return null
  }
}

async function callClaude(apiKey: string, title: string, content: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are a technical expert on ChainOverflow. Please answer this question concisely and accurately using Markdown.\n\nQuestion: ${title}\n\nDescription: ${content}`
          }
        ]
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Claude API Error Response:', JSON.stringify(data))
    }
    return data.content?.[0]?.text || null
  } catch (error) {
    console.error('Claude Fetch Error:', error)
    logger.error({ error, msg: 'Claude API Error' })
    return null
  }
}

async function callGemini(apiKey: string, title: string, content: string): Promise<string | null> {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a technical expert on ChainOverflow. Please answer this question concisely and accurately using Markdown.\n\nQuestion: ${title}\n\nDescription: ${content}`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000
        }
      })
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('Gemini API Error Response:', JSON.stringify(data))
    }
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (error) {
    console.error('Gemini Fetch Error:', error)
    logger.error({ error, msg: 'Gemini API Error' })
    return null
  }
}
