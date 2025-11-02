/**
 * Vercel Serverless Function - Google Gemini API Proxy
 * 
 * Proxies requests to Google Gemini Imagen API to keep the API key secure on the server.
 * The API key is stored as GEMINI_API_KEY (without VITE_ prefix) in Vercel environment variables.
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is not set in environment variables')
      return res.status(500).json({ 
        error: 'Server configuration error: GEMINI_API_KEY not set',
        message: 'Please configure GEMINI_API_KEY in Vercel environment variables'
      })
    }

    const { operation, payload } = req.body

    if (!operation || !payload) {
      return res.status(400).json({ error: 'Missing operation or payload' })
    }

    console.log('🔄 Proxying Gemini API request:', operation)
    console.log('📦 Payload type:', typeof payload)

    // Import Google GenAI
    const { GoogleGenAI } = await import('@google/genai')
    const genAI = new GoogleGenAI(apiKey)

    let result

    if (operation === 'analyzeClothing') {
      // Vision analysis using Gemini
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
      const result_vision = await model.generateContent({ 
        contents: [{ role: "user", parts: payload.parts }] 
      })
      result = {
        description: result_vision.response.text()
      }
    } else if (operation === 'generateImage') {
      // Image generation using Imagen
      const response = await genAI.models.generateImages({
        model: payload.model || 'imagen-4.0-generate-001',
        prompt: payload.prompt,
        config: payload.config || {
          numberOfImages: 1,
          aspectRatio: "3:4",
          personGeneration: "allow_adult",
        },
      })
      result = response
    } else {
      return res.status(400).json({ error: 'Unknown operation: ' + operation })
    }

    console.log('✅ Gemini API request successful')
    return res.status(200).json({ success: true, result })

  } catch (error) {
    console.error('❌ Gemini API proxy error:', error)
    return res.status(500).json({ 
      error: 'Failed to process Gemini API request',
      message: error.message || 'Unknown error'
    })
  }
}

