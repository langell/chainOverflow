import dotenv from 'dotenv'
dotenv.config()

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    console.error('GOOGLE_API_KEY missing')
    return
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
  try {
    const res = await fetch(url)
    const data = await res.json()
    console.log('Available models:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Fetch error:', err)
  }
}

listModels()
