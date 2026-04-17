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
    // Parse request body if it's a string (Vercel sometimes sends strings)
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON in request body' });
      }
    }

    // Get API key from server-side environment variable only.
    // NEVER use VITE_GEMINI_API_KEY here — VITE_ vars are bundled into the client.
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ Gemini API key not found in environment variables');
      return res.status(500).json({
        error: 'Server configuration error',
        detail: 'GEMINI_API_KEY is not set in Vercel environment variables'
      });
    }

    console.log('🔄 Proxying request to Google Gemini API');
    console.log('📦 Request type:', body?.type || 'unknown');
    console.log('🔑 API key available:', !!apiKey);

    // Initialize Google GenAI client with server-side API key
    const client = new GoogleGenAI(apiKey);
    const modelName = body.model || 'imagen-4.0-generate-001';

    if (body.type === 'generateImages') {
      // Generate images using Imagen 4.0 with clothing image references
      const { prompt, /* negativePrompt, */ config, topImageBase64, bottomImageBase64 } = body;
      
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      console.log('📤 Generating image with Imagen 4.0...');
      console.log('📝 Prompt:', prompt.substring(0, 200) + '...');
      // Negative prompt is not supported in Gemini API
      // if (negativePrompt) {
      //   console.log('📝 Negative Prompt:', negativePrompt.substring(0, 100) + '...');
      // }
      console.log('👕 Top image provided:', !!topImageBase64);
      console.log('👖 Bottom image provided:', !!bottomImageBase64);

      // Prepare image parts for Imagen API if clothing images are provided
      // Note: Imagen 4.0 may support image conditioning via prompt with image references
      let imageParts = [];
      
      if (topImageBase64) {
        const topData = topImageBase64.includes(',') ? topImageBase64.split(',')[1] : topImageBase64;
        const topMimeType = topImageBase64.startsWith('data:') 
          ? topImageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
          : 'image/jpeg';
        imageParts.push({
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
        imageParts.push({
          inlineData: {
            mimeType: bottomMimeType,
            data: bottomData
          }
        });
      }

      // Build request - include images if available
      // Ensure numberOfImages is always 1 for single output
      const requestConfig = {
        model: modelName,
        prompt: prompt,
        config: {
          numberOfImages: 1, // Always return only one image
          aspectRatio: config?.aspectRatio || "3:4",
          personGeneration: config?.personGeneration || "allow_adult",
        },
      };

      // Negative prompt is not supported in Gemini API
      // if (negativePrompt) {
      //   // Try adding negative prompt to config if API supports it
      //   requestConfig.config.negativePrompt = negativePrompt;
      //   // Also try as top-level property if config doesn't work
      //   requestConfig.negativePrompt = negativePrompt;
      // }

      // Pass images to the API if provided
      // Note: Imagen API structure - images may need to be passed differently
      // Attempt to include images - the SDK will handle validation
      if (imageParts.length > 0) {
        // Try adding images to the request config
        // The Google GenAI SDK may support this or we may need to adjust based on API response
        requestConfig.images = imageParts;
        console.log('📸 Including', imageParts.length, 'image(s) in request');
        console.log('📋 Top image present:', !!topImageBase64);
        console.log('📋 Bottom image present:', !!bottomImageBase64);
      } else {
        console.warn('⚠️ No images to include in request');
      }

      console.log('📸 Image parts count:', imageParts.length);
      console.log('🖼️ numberOfImages set to:', requestConfig.config.numberOfImages);

      const response = await client.models.generateImages(requestConfig);

      console.log('✅ Received response from Imagen API');

      if (!response.generatedImages || response.generatedImages.length === 0) {
        return res.status(500).json({ error: 'No images generated in response' });
      }

      // Ensure we only return the first image (should only be one anyway since numberOfImages=1)
      const generatedImage = response.generatedImages[0];
      
      console.log('✅ Generated', response.generatedImages.length, 'image(s), returning first one');
      
      return res.status(200).json({
        success: true,
        imageBytes: generatedImage.image.imageBytes,
        mimeType: generatedImage.image.mimeType || 'image/png'
      });

    } else if (body.type === 'analyzeClothingImages') {
      // Analyze clothing images using Gemini vision model
      const { topImageBase64, bottomImageBase64 } = body;
      
      if (!topImageBase64 && !bottomImageBase64) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      console.log('👁️ Analyzing clothing images with Gemini vision...');

      // Build request payload for Gemini REST API (since SDK method may not work)
      const prompt = `Analyze the provided clothing images and produce a detailed description optimized for image generation.

Include:

1. Garment type (e.g., cropped denim jacket, pleated skirt)

2. Dominant colors with precise tone (approximate hex if clear)

3. Patterns or graphics (e.g., floral print, striped, solid)

4. Fit and silhouette (e.g., oversized, slim fit, A-line)

5. Material or texture (e.g., denim, satin, linen)

6. Distinct design features (e.g., front buttons, cuffs, collar, waistband)

Return a single concise paragraph written for text-to-image generation. Avoid subjective or emotional language; focus strictly on visual and structural details.`;
      
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
      
      // Use REST API directly to avoid SDK method issues
      const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
      
      const geminiResponse = await fetch(geminiApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: parts
          }]
        })
      });

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`);
      }

      const geminiResult = await geminiResponse.json();
      
      if (!geminiResult.candidates || !geminiResult.candidates[0] || !geminiResult.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const description = geminiResult.candidates[0].content.parts[0].text;
      
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
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error name:', error.name);
    
    // Provide more detailed error information
    const errorDetail = error.message || 'Unknown error occurred';
    const isImportError = error.message?.includes('Cannot find module') || error.message?.includes('import');
    
    return res.status(500).json({
      error: 'Gemini API error',
      detail: errorDetail,
      type: error.name || 'Error',
      // Helpful message if it's an import/module error
      hint: isImportError ? 'Check if @google/genai package is installed in Vercel' : undefined
    });
  }
}

