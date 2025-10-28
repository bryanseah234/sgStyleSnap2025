// api/proxy-transformer.js
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Proxying request to ftransformer API');
    console.log('📦 Items count:', req.body?.items?.length || 0);

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    // Forward request to ftransformer API
    const response = await fetch(
      'https://ftransformer.onrender.com/recommendation/score-json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    console.log('📥 Response status:', response.status);
    console.log('📥 Content-Type:', response.headers.get('content-type'));

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (isJson) {
      // Parse JSON response
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ API error:', data);
        return res.status(response.status).json(data);
      }
      
      console.log('✅ Successfully proxied request');
      return res.status(200).json(data);
    } else {
      // Non-JSON response (HTML error page)
      const text = await response.text();
      console.error('❌ Non-JSON response:', text.substring(0, 200));
      
      return res.status(response.status).json({
        error: 'API returned non-JSON response',
        status_code: response.status,
        detail: text.substring(0, 500), // First 500 chars of error
        message: 'The transformer API may be experiencing issues'
      });
    }
  } catch (error) {
    console.error('❌ Proxy error:', error.message);

    // Check if it's a timeout
    if (error.name === 'AbortError') {
      return res.status(504).json({
        error: 'Request timeout',
        detail: 'The transformer API took too long to respond (>30s)'
      });
    }

    return res.status(503).json({ 
      error: 'Transformer service unavailable',
      detail: error.message 
    });
  }
}

