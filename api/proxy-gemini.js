// api/proxy-gemini.js
// Backend proxy for Google Gemini API calls
// Uses GEMINI_API_KEY from Vercel environment variables (server-side only)

import { GoogleGenAI } from "@google/genai"

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
    // Get API key from server-side environment variable
    // This will work with GEMINI_API_KEY (no VITE_ prefix) from Vercel
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Gemini API key not found in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        detail: 'GEMINI_API_KEY is not set in Vercel environment variables'
      });
    }

    console.log('🔄 Proxying request to Google Gemini API');
    console.log('📦 Request type:', req.body?.type || 'unknown');
    console.log('🔑 API key available:', !!apiKey);

    // Initialize Google GenAI client with server-side API key
    const client = new GoogleGenAI(apiKey);
    const modelName = req.body.model || 'imagen-4.0-generate-001';

    if (req.body.type === 'generateImages') {
      // Generate images using Imagen 4.0
      const { prompt, config } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      console.log('📤 Generating image with Imagen 4.0...');
      console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

      const response = await client.models.generateImages({
        model: modelName,
        prompt: prompt,
        config: config || {
          numberOfImages: 1,
          aspectRatio: "3:4",
          personGeneration: "allow_adult",
        },
      });

      console.log('✅ Received response from Imagen API');

      if (!response.generatedImages || response.generatedImages.length === 0) {
        return res.status(500).json({ error: 'No images generated in response' });
      }

      const generatedImage = response.generatedImages[0];
      
      return res.status(200).json({
        success: true,
        imageBytes: generatedImage.image.imageBytes,
        mimeType: generatedImage.image.mimeType || 'image/png'
      });

    } else if (req.body.type === 'analyzeClothingImages') {
      // Analyze clothing images using Gemini vision model
      const { topImageBase64, bottomImageBase64 } = req.body;
      
      if (!topImageBase64 && !bottomImageBase64) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      console.log('👁️ Analyzing clothing images with Gemini vision...');

      const model = client.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      
      let prompt = "Describe these clothing items in detail. Focus on: ";
      prompt += "1. Type of garment (e.g., t-shirt, jeans, dress shirt, shorts) ";
      prompt += "2. Colors and patterns ";
      prompt += "3. Style and fit (e.g., casual, formal, loose, fitted) ";
      prompt += "4. Notable features (e.g., buttons, pockets, collar type, sleeves) ";
      prompt += "5. Material appearance (if visible). ";
      prompt += "Provide a concise but detailed description that would help generate an image of someone wearing these items.";
      
      const parts = [];
      
      if (topImageBase64) {
        const topData = topImageBase64.includes(',') ? topImageBase64.split(',')[1] : topImageBase64;
        const topMimeType = topImageBase64.startsWith('data:') 
          ? topImageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
          : 'image/jpeg';
        parts.push({
          inlineData: {
            mimeType: topMimeType,
            data: topData
          }
        });
      }
      
      if (bottomImageBase64) {
        const bottomData = bottomImageBase64.includes(',') ? bottomImageBase64.split(',')[1] : bottomImageBase64;
        const bottomMimeType = bottomImageBase64.startsWith('data:')
          ? bottomImageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
          : 'image/jpeg';
        parts.push({
          inlineData: {
            mimeType: bottomMimeType,
            data: bottomData
          }
        });
      }
      
      parts.push({ text: prompt });
      
      const result = await model.generateContent({ contents: [{ role: "user", parts }] });
      const description = result.response.text();
      
      console.log('✅ Clothing analysis completed');
      
      return res.status(200).json({
        success: true,
        description: description
      });

    } else {
      return res.status(400).json({ error: 'Invalid request type' });
    }

  } catch (error) {
    console.error('❌ Gemini proxy error:', error.message);
    console.error('❌ Error details:', error);

    return res.status(500).json({
      error: 'Gemini API error',
      detail: error.message || 'Unknown error occurred'
    });
  }
}

