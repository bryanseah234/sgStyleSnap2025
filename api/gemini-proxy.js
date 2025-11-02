/**
 * Vercel Serverless Function - Gemini API Proxy
 * 
 * Proxies requests to Google Gemini API to keep the API key secure server-side.
 * Uses GEMINI_API_KEY environment variable (without VITE_ prefix for security).
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
    // Get API key from server-side environment variable (not exposed to client)
    // Vercel automatically makes environment variables available via process.env
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not set in environment variables')
      console.error('📋 Available env vars (filtered):', Object.keys(process.env)
        .filter(k => k.includes('GEMINI') || k.includes('API'))
        .map(k => `${k}: ${k === 'GEMINI_API_KEY' ? '[REDACTED]' : 'set'}`))
      return res.status(500).json({ 
        error: 'Server configuration error',
        detail: 'GEMINI_API_KEY not configured on server. Please set it in Vercel project settings.',
        hint: 'In Vercel: Settings → Environment Variables → Add GEMINI_API_KEY'
      })
    }

    console.log('✅ GEMINI_API_KEY found (length:', apiKey.length, ')')

    const { endpoint, body } = req.body

    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint in request body' })
    }

    console.log('🔄 Proxying request to Gemini API:', endpoint)

    // Add timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 120s timeout for image generation

    // Forward request to Gemini API
    // For Imagen, use :predict endpoint; for other models, use the endpoint as-is
    const apiUrl = endpoint.includes(':') 
      ? `https://generativelanguage.googleapis.com/v1beta/${endpoint}`
      : `https://generativelanguage.googleapis.com/v1beta/${endpoint}`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    console.log('📥 Gemini API response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      
      console.error('❌ Gemini API error:', errorData)
      return res.status(response.status).json({
        error: 'Gemini API request failed',
        detail: errorData
      })
    }

    const data = await response.json()
    return res.status(200).json(data)

  } catch (error) {
    console.error('❌ Proxy error:', error.message)

    // Check if it's a timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        detail: 'The request took too long (>120s)'
      })
    }

    return res.status(500).json({ 
      error: 'Failed to proxy request to Gemini API',
      detail: error.message 
    })
  }
}

