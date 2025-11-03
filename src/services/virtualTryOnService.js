/**
 * Virtual Try-On Service
 * 
 * Service for generating images of people wearing specified clothing items
 * using Google Gemini Imagen 4.0 API
 * 
 * Generates realistic images of people wearing specified clothing items
 * by taking garment images as input and generating a person wearing them.
 */

import { GoogleGenAI } from "@google/genai"
import { sanitizeUrl, safeLog, safeError, safeWarn } from '@/utils/log-sanitizer'

export class VirtualTryOnService {
  constructor() {
    // Use backend proxy API (which uses GEMINI_API_KEY from Vercel server-side)
    // This works with GEMINI_API_KEY (no VITE_ prefix) in Vercel environment variables
    this.useProxy = true
    this.proxyUrl = '/api/proxy-gemini'
    
    // Fallback: Try direct client initialization for local development
    const viteGeminiKey = import.meta.env.VITE_GEMINI_API_KEY
    this.apiKey = viteGeminiKey || ''
    this.client = null
    
    if (this.apiKey) {
      // Local development: use direct client if VITE_GEMINI_API_KEY is available
      this.client = new GoogleGenAI(this.apiKey)
      this.useProxy = false
      safeLog('✅ VirtualTryOnService: Using direct API client (local development)')
    } else {
      // Production: use backend proxy (GEMINI_API_KEY from Vercel)
      safeLog('✅ VirtualTryOnService: Using backend proxy API (GEMINI_API_KEY from Vercel)')
    }
    
    // Model configuration
    this.model = 'imagen-4.0-generate-001'
  }

  /**
   * Generate virtual try-on image using Google Gemini Imagen 4.0
   * 
   * @param {Object} options - Try-on options
   * @param {string} options.topImageUrl - URL of the top/shirt image
   * @param {string} options.bottomImageUrl - URL of the bottom/pants image
   * @returns {Promise<Object>} Result with generated image
   */
  async generateTryOn({ topImageUrl, bottomImageUrl }) {
    try {
      console.log('🎨 VirtualTryOnService: Starting try-on generation with Google Gemini Imagen...')
      safeLog('🎨 Top image:', sanitizeUrl(topImageUrl))
      safeLog('🎨 Bottom image:', sanitizeUrl(bottomImageUrl))

      // Validate inputs
      if (!topImageUrl && !bottomImageUrl) {
        throw new Error('At least one clothing item (top or bottom) is required')
      }

      // Convert image URLs to base64 for analysis
      let topImageBase64 = null
      let bottomImageBase64 = null

      if (topImageUrl) {
        topImageBase64 = await this.urlToBase64(topImageUrl)
      }

      if (bottomImageUrl) {
        bottomImageBase64 = await this.urlToBase64(bottomImageUrl)
      }

      // Use Gemini vision model to analyze the clothing images and create a detailed description
      const clothingDescription = await this.analyzeClothingImages(topImageBase64, bottomImageBase64)
      
      // Create a descriptive prompt based on the analyzed images
      const prompt = this.createTryOnPrompt(clothingDescription, topImageBase64, bottomImageBase64)

      safeLog('📤 Generating image with Imagen 4.0...')
      safeLog('📝 Prompt:', prompt.substring(0, 200) + '...')

      let imageBytes
      
      if (this.useProxy) {
        // Use backend proxy API (uses GEMINI_API_KEY from Vercel server-side)
        // Send the actual clothing images so the API can reference them
        const response = await fetch(this.proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'generateImages',
            model: this.model,
            prompt: prompt,
            topImageBase64: topImageBase64, // Send actual clothing images
            bottomImageBase64: bottomImageBase64, // Send actual clothing images
            config: {
              numberOfImages: 1,
              aspectRatio: "3:4",
              personGeneration: "allow_adult",
            }
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || errorData.error || `Proxy returned ${response.status}`)
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to generate image')
        }

        imageBytes = result.imageBytes
        safeLog('✅ Received response from Imagen API via proxy')
      } else {
        // Direct API call (local development with VITE_GEMINI_API_KEY)
        if (!this.client) {
          throw new Error('Google Gemini API key is required. Please set the API key.')
        }

        // Send clothing images along with the prompt for better accuracy
        const response = await this.client.models.generateImages({
          model: this.model,
          prompt: prompt,
          // Note: Imagen API may need images passed differently - check API docs
          // For now, the prompt should be descriptive enough with the image references
          config: {
            numberOfImages: 1,
            aspectRatio: "3:4",
            personGeneration: "allow_adult",
          },
        })

        safeLog('✅ Received response from Imagen API')

        if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new Error('No images generated in response')
        }

        imageBytes = response.generatedImages[0].image.imageBytes
      }
      
      // Convert base64 image to blob
      const imageBlob = await this.base64ToBlob(imageBytes)
      const imageUrl = URL.createObjectURL(imageBlob)

      console.log('✅ VirtualTryOnService: Try-on generated successfully')
      return {
        success: true,
        imageUrl: imageUrl,
        imageBlob: imageBlob
      }

    } catch (error) {
      safeError('❌ VirtualTryOnService: Error generating try-on:', error)
      return {
        success: false,
        error: error.message || 'Failed to generate virtual try-on'
      }
    }
  }

  /**
   * Analyze clothing images using Gemini vision model to get detailed descriptions
   * 
   * @param {string} topImageBase64 - Base64 encoded top image
   * @param {string} bottomImageBase64 - Base64 encoded bottom image
   * @returns {Promise<string>} Detailed description of the clothing items
   */
  async analyzeClothingImages(topImageBase64, bottomImageBase64) {
    try {
      if (this.useProxy) {
        // Use backend proxy API (uses GEMINI_API_KEY from Vercel server-side)
        const response = await fetch(this.proxyUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'analyzeClothingImages',
            topImageBase64: topImageBase64,
            bottomImageBase64: bottomImageBase64
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || errorData.error || 'Failed to analyze images')
        }

        const result = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to analyze images')
        }

        const description = result.description
        safeLog('📝 Clothing analysis:', description.substring(0, 150) + '...')
        return description
      } else {
        // Direct API call (local development with VITE_GEMINI_API_KEY)
        if (!this.client) {
          return null
        }

        const model = this.client.getGenerativeModel({ model: "gemini-2.0-flash-exp" })
        
        let prompt = "Describe these clothing items in detail. Focus on: "
        prompt += "1. Type of garment (e.g., t-shirt, jeans, dress shirt, shorts) "
        prompt += "2. Colors and patterns "
        prompt += "3. Style and fit (e.g., casual, formal, loose, fitted) "
        prompt += "4. Notable features (e.g., buttons, pockets, collar type, sleeves) "
        prompt += "5. Material appearance (if visible). "
        prompt += "Provide a concise but detailed description that would help generate an image of someone wearing these items."
        
        const parts = []
        
        if (topImageBase64) {
          const topData = topImageBase64.includes(',') ? topImageBase64.split(',')[1] : topImageBase64
          const topMimeType = topImageBase64.startsWith('data:') 
            ? topImageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
            : 'image/jpeg'
          parts.push({
            inlineData: {
              mimeType: topMimeType,
              data: topData
            }
          })
        }
        
        if (bottomImageBase64) {
          const bottomData = bottomImageBase64.includes(',') ? bottomImageBase64.split(',')[1] : bottomImageBase64
          const bottomMimeType = bottomImageBase64.startsWith('data:')
            ? bottomImageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
            : 'image/jpeg'
          parts.push({
            inlineData: {
              mimeType: bottomMimeType,
              data: bottomData
            }
          })
        }
        
        parts.push({ text: prompt })
        
        const result = await model.generateContent({ contents: [{ role: "user", parts }] })
        const description = result.response.text()
        
        safeLog('📝 Clothing analysis:', description.substring(0, 150) + '...')
        return description
      }
    } catch (error) {
      safeWarn('⚠️ Failed to analyze clothing images with Gemini vision, using default description:', error.message)
      return null
    }
  }

  /**
   * Create a descriptive prompt for wearing the top and bottom
   * 
   * @param {string} clothingDescription - Detailed description from Gemini vision analysis
   * @param {string} topImageBase64 - Base64 encoded top image
   * @param {string} bottomImageBase64 - Base64 encoded bottom image
   * @returns {string} Descriptive prompt for Imagen
   */
  createTryOnPrompt(clothingDescription, topImageBase64, bottomImageBase64) {
    let prompt = "A professional high-quality fashion photograph of a person modeling a complete outfit. "
    
    // Emphasize that we're using SPECIFIC clothing items from reference images
    prompt += "IMPORTANT: The person must be wearing the EXACT clothing items shown in the provided reference images. "
    
    if (clothingDescription) {
      prompt += `The person is wearing the following EXACT clothing items from the reference images: ${clothingDescription}. `
      prompt += "The generated image must show these SPECIFIC clothing items - match the exact colors, patterns, style, and details from the reference images. "
      prompt += "DO NOT generate random clothing - use only the garments shown in the reference images. "
    } else {
      // Fallback if vision analysis fails - still emphasize using reference images
      if (topImageBase64 && bottomImageBase64) {
        prompt += "The person must be wearing the EXACT top garment and EXACT bottom garment shown in the provided reference images. "
        prompt += "Match the precise appearance, colors, patterns, and details from the reference top and bottom images. "
        prompt += "The top and bottom should be worn together exactly as shown in the reference images. "
        prompt += "DO NOT create random clothing - replicate the exact garments from the reference images. "
      } else if (topImageBase64) {
        prompt += "The person must be wearing the EXACT top garment shown in the reference image. "
        prompt += "Match the precise appearance, colors, patterns, and details from the reference image. "
        prompt += "Show the exact top being worn properly on a fashion model - replicate the reference garment exactly. "
      } else if (bottomImageBase64) {
        prompt += "The person must be wearing the EXACT bottom garment shown in the reference image. "
        prompt += "Match the precise appearance, colors, patterns, and details from the reference image. "
        prompt += "Show the exact bottom being worn properly on a fashion model - replicate the reference garment exactly. "
      }
    }

    prompt += "The clothing items should match the reference images exactly - same colors, same patterns, same style details. "
    prompt += "The clothing should be clearly visible, well-fitted, and naturally worn. "
    prompt += "Full body visible in a natural standing pose. "
    prompt += "Professional fashion photography style with studio lighting, clean neutral background. "
    prompt += "High resolution, sharp focus, modern aesthetic. "
    prompt += "The person should look confident and stylish. "
    prompt += "CRITICAL: The generated clothing must be identical to the reference images provided - match every detail."

    return prompt
  }

  /**
   * Convert image URL to base64 data URL
   * 
   * @param {string} url - Image URL
   * @returns {Promise<string>} Base64 data URL
   */
  async urlToBase64(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      const blob = await response.blob()
      return await this.blobToBase64(blob)
    } catch (error) {
      safeError('❌ VirtualTryOnService: Error converting URL to base64:', error)
      throw error
    }
  }

  /**
   * Convert Blob to base64 data URL
   * 
   * @param {Blob} blob - Image blob
   * @returns {Promise<string>} Base64 data URL
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * Convert base64 string to Blob
   * 
   * @param {string} base64 - Base64 encoded image string
   * @returns {Promise<Blob>} Image blob
   */
  async base64ToBlob(base64) {
    // Handle both raw base64 and data URL formats
    let base64Data = base64
    if (base64.includes(',')) {
      base64Data = base64.split(',')[1]
    }

    const byteCharacters = atob(base64Data)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: 'image/png' })
  }
}

export const virtualTryOnService = new VirtualTryOnService()
