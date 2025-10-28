// api/proxy-transformer.js
export default async function handler(req, res) {
  // Set CORS headers to allow frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Proxying request to ftransformer API');
    console.log('📦 Request body:', JSON.stringify(req.body));

    // Forward request to ftransformer API
    const response = await fetch(
      'https://ftransformer.onrender.com/recommendation/score-json',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      }
    );

    console.log('📥 Response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API error:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Successfully proxied request');
    return res.status(200).json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error.message);
    return res.status(503).json({
      error: 'Transformer service unavailable',
      detail: error.message
    });
  }
}

