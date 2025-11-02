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
import { sanitizeToken, sanitizeUrl, safeLog, safeError, safeWarn } from '@/utils/log-sanitizer'

export class VirtualTryOnService {
  constructor() {
    // Google Gemini API key
    this.apiKey = "AIzaSyAuOczcUZ3GdwSfCXRwBEKi2hjiqqa6oLY"
    
    // Initialize Google GenAI Client
    if (!this.apiKey) {
      safeWarn('⚠️ Google Gemini API key is not set')
      this.client = null
    } else {
      this.client = new GoogleGenAI(this.apiKey)
      safeLog('✅ VirtualTryOnService initialized with Google Gemini Imagen API')
      safeLog('🔍 apiKey exists:', !!this.apiKey)
      safeLog('🔍 apiKey:', sanitizeToken(this.apiKey))
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
   * @param {string} options.modelImageUrl - Optional: Custom model person image (not used with Imagen)
   * @returns {Promise<Object>} Result with generated image
   */
  async generateTryOn({ topImageUrl, bottomImageUrl, modelImageUrl = null }) {
    try {
      console.log('🎨 VirtualTryOnService: Starting try-on generation with Google Gemini Imagen...')
      safeLog('🎨 Top image:', sanitizeUrl(topImageUrl))
      safeLog('🎨 Bottom image:', sanitizeUrl(bottomImageUrl))

      // Validate inputs
      if (!topImageUrl && !bottomImageUrl) {
        throw new Error('At least one clothing item (top or bottom) is required')
      }

      // Check if client is initialized
      if (!this.client) {
        throw new Error('Google Gemini API key is required. Please set the API key.')
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

      // Call Google Gemini Imagen API
      const response = await this.client.models.generateImages({
        model: this.model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "3:4", // Good for full-body fashion images
          personGeneration: "allow_adult", // Allow generating images of adults
        },
      })

      safeLog('✅ Received response from Imagen API')

      // Extract the generated image
      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('No images generated in response')
      }

      const generatedImage = response.generatedImages[0]
      
      // Convert base64 image to blob
      const imageBlob = await this.base64ToBlob(generatedImage.image.imageBytes)
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
      // Get Gemini model for vision analysis
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
    } catch (error) {
      safeWarn('⚠️ Failed to analyze clothing images with Gemini vision, using default description')
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
    
    if (clothingDescription) {
      prompt += `The person is wearing the following clothing items: ${clothingDescription}. `
      prompt += "Show these exact clothing items being worn together as a complete outfit. "
    } else {
      // Fallback if vision analysis fails
      if (topImageBase64 && bottomImageBase64) {
        prompt += "The person is wearing a top garment on their upper body and a bottom garment on their lower body, "
        prompt += "both pieces combined into one cohesive fashion outfit. "
        prompt += "The top and bottom should be worn together as a matching ensemble. "
      } else if (topImageBase64) {
        prompt += "The person is wearing a top garment on their upper body. "
        prompt += "Show the top being worn properly on a fashion model. "
      } else if (bottomImageBase64) {
        prompt += "The person is wearing a bottom garment on their lower body. "
        prompt += "Show the bottom being worn properly on a fashion model. "
      }
    }

    prompt += "The clothing items should be clearly visible, well-fitted, and naturally worn. "
    prompt += "Full body visible in a natural standing pose. "
    prompt += "Professional fashion photography style with studio lighting, clean neutral background. "
    prompt += "High resolution, sharp focus, modern aesthetic. "
    prompt += "The person should look confident and stylish."

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
