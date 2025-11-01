/**
 * Vercel Serverless Function - Image Proxy
 * 
 * Proxies Google profile images to avoid CORS issues.
 * Only proxies images from googleusercontent.com for security.
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'public, max-age=86400') // Cache for 24 hours

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const imageUrl = req.query.url

    if (!imageUrl) {
      return res.status(400).json({ error: 'Missing url parameter' })
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl)

    // Security: Only allow proxying Google profile images
    if (!decodedUrl.includes('googleusercontent.com') && !decodedUrl.includes('google.com')) {
      return res.status(403).json({ 
        error: 'Proxy only supports Google profile images',
        allowedDomains: ['googleusercontent.com', 'google.com']
      })
    }

    console.log('🖼️ Proxying image:', decodedUrl)

    // Fetch the image from Google
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(decodedUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StyleSnap/1.0)',
        'Accept': 'image/*'
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText)
      return res.status(response.status).json({ 
        error: 'Failed to fetch image',
        status: response.status
      })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Set appropriate headers
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', imageBuffer.byteLength)
    
    // Return the image
    return res.send(Buffer.from(imageBuffer))

  } catch (error) {
    console.error('❌ Proxy error:', error.message)

    // Check if it's a timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        detail: 'The image took too long to load (>10s)'
      })
    }

    return res.status(500).json({ 
      error: 'Failed to proxy image',
      detail: error.message 
    })
  }
}

