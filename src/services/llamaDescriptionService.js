/**
 * Llama Description Service
 * 
 * Service for generating detailed JSON descriptions of clothing items
 * using Meta Llama-4-Scout-17B-16E-Instruct model via Hugging Face Inference Client
 * with auto provider.
 * 
 * Generates structured JSON descriptions including color, material, style, and other attributes.
 */

import { InferenceClient } from '@huggingface/inference'
import { safeLog, safeError, safeWarn } from '@/utils/log-sanitizer'

export class LlamaDescriptionService {
  constructor() {
    // Get Hugging Face API token from environment variables
    this.apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN || ''
    
    // Initialize Hugging Face Inference Client
    if (!this.apiToken) {
      safeWarn('⚠️ VITE_HUGGINGFACE_API_TOKEN is not set')
      safeWarn('⚠️ LlamaDescriptionService will not be available')
      this.client = null
    } else {
      this.client = new InferenceClient(this.apiToken)
      safeLog('✅ LlamaDescriptionService initialized with Hugging Face Inference Client')
    }
    
    // Model configuration
    this.model = 'meta-llama/Llama-4-Scout-17B-16E-Instruct'
    this.provider = 'auto'
  }

  /**
   * Generate detailed JSON description of a clothing item from an image
   * 
   * @param {string|File|Blob} image - Image URL, File, or Blob of the clothing item
   * @param {string} category - Category of the clothing item ('tops', 'bottoms', etc.)
   * @returns {Promise<Object>} Detailed description in JSON format
   */
  async generateDescription(image, category = 'clothing') {
    // Check if client is initialized
    if (!this.client) {
      throw new Error('Hugging Face API token is required. Please set VITE_HUGGINGFACE_API_TOKEN in your environment variables. You can get a free token from: https://huggingface.co/settings/tokens')
    }

    try {
      safeLog('🚀 Calling Llama-4-Scout model for clothing description generation')
      safeLog(`📦 Model: ${this.model}`)
      safeLog(`⚡ Provider: ${this.provider}`)
      safeLog(`📂 Category: ${category}`)

      // Convert image to appropriate format for API
      let imageInput
      if (typeof image === 'string') {
        // Image URL
        imageInput = image
      } else if (image instanceof File || image instanceof Blob) {
        // Convert File/Blob to data URL
        imageInput = await this._fileToDataUrl(image)
      } else {
        throw new Error('Invalid image format. Expected URL string, File, or Blob.')
      }

      // Construct prompt for detailed JSON description
      const categoryLabel = category === 'tops' ? 'top' : category === 'bottoms' ? 'bottom' : 'clothing item'
      const prompt = `Analyze this ${categoryLabel} image in detail and provide a comprehensive JSON description. Include the following attributes:
- color: primary color and any secondary colors
- material: fabric type (e.g., cotton, denim, silk, polyester)
- style: style category (e.g., casual, formal, sporty, vintage)
- pattern: any patterns (e.g., solid, striped, floral, plaid, abstract)
- fit: fit type (e.g., slim, regular, loose, fitted)
- features: notable features (e.g., buttons, zipper, pockets, hood, collar type)
- season: appropriate seasons (e.g., spring, summer, fall, winter, all-season)
- occasions: suitable occasions (e.g., casual, work, party, formal, athletic)

Return ONLY a valid JSON object with these exact keys. Do not include any explanatory text before or after the JSON. Example format:
{
  "color": {"primary": "blue", "secondary": ["white"]},
  "material": "cotton",
  "style": "casual",
  "pattern": "striped",
  "fit": "regular",
  "features": ["button-down collar", "short sleeves"],
  "season": ["spring", "summer"],
  "occasions": ["casual", "work"]
}`

      safeLog('📤 Sending multimodal request to Llama model...')

      // Call chat completion with multimodal input (image + text)
      const response = await this.client.chatCompletion({
        model: this.model,
        provider: this.provider,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageInput
                }
              }
            ]
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent, structured output
        max_tokens: 500
      })

      safeLog('✅ Received response from Llama model')
      safeLog('📦 Response structure:', typeof response, Object.keys(response || {}))

      // Extract the description from the response
      // HuggingFace InferenceClient response format can vary
      let descriptionText = ''
      
      // Try different response formats
      if (response.choices && Array.isArray(response.choices) && response.choices.length > 0) {
        // OpenAI-compatible format
        descriptionText = response.choices[0].message?.content || response.choices[0].text || ''
      } else if (response.generated_text) {
        // HuggingFace format with generated_text
        descriptionText = response.generated_text
      } else if (response.text) {
        // Alternative text field
        descriptionText = response.text
      } else if (response.message?.content) {
        // Message format
        descriptionText = response.message.content
      } else if (response.content) {
        // Direct content field
        descriptionText = response.content
      } else if (typeof response === 'string') {
        // Direct string response
        descriptionText = response
      } else if (Array.isArray(response) && response.length > 0) {
        // Array response (take first item)
        const firstItem = response[0]
        descriptionText = typeof firstItem === 'string' ? firstItem : firstItem?.generated_text || firstItem?.text || ''
      }

      if (!descriptionText) {
        safeError('❌ Empty or unrecognized response format:', response)
        throw new Error('Empty or unrecognized response from Llama model')
      }

      safeLog('📝 Raw description:', descriptionText.substring(0, 200) + '...')

      // Parse JSON from response (may be wrapped in markdown code blocks or plain text)
      let descriptionJson
      try {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = descriptionText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                          descriptionText.match(/(\{[\s\S]*\})/)
        
        if (jsonMatch) {
          descriptionJson = JSON.parse(jsonMatch[1])
        } else {
          // Try parsing the whole response as JSON
          descriptionJson = JSON.parse(descriptionText)
        }
      } catch (parseError) {
        safeWarn('⚠️ Failed to parse JSON from response, using raw text as fallback')
        safeError('Parse error:', parseError)
        // Fallback: return structured object with raw text
        descriptionJson = {
          raw_description: descriptionText,
          error: 'Failed to parse JSON response'
        }
      }

      safeLog('✅ Successfully generated clothing description')
      return {
        success: true,
        description: descriptionJson,
        raw_response: descriptionText
      }

    } catch (error) {
      safeError('❌ LlamaDescriptionService: Error generating description:', error)
      
      // Extract error message and status code
      const errorMessage = error.message || ''
      const errorStatus = error.status || error.statusCode || error.response?.status
      
      // Handle 402 Payment Required - exceeded monthly credits
      if (errorStatus === 402 || 
          errorMessage.includes('402') || 
          errorMessage.includes('exceeded') && errorMessage.includes('credits') ||
          errorMessage.includes('monthly included credits') ||
          errorMessage.includes('Subscribe to PRO')) {
        throw new Error('Hugging Face Inference API quota exceeded. You have exceeded your monthly included credits for Inference Providers. Please upgrade to PRO plan or wait for the quota to reset. The virtual try-on feature will continue to work without AI descriptions.')
      }
      
      // Provide helpful error messages
      if (errorMessage.includes('token') || errorStatus === 401 || errorStatus === 403 || errorMessage.includes('401') || errorMessage.includes('403')) {
        throw new Error('Invalid or expired Hugging Face API token. Please check your VITE_HUGGINGFACE_API_TOKEN.')
      }
      
      if (errorStatus === 503 || errorMessage.includes('503') || errorMessage.includes('loading')) {
        throw new Error('Model is currently loading. Please wait a moment and try again.')
      }

      if (errorMessage.includes('rate limit') || errorStatus === 429 || errorMessage.includes('429')) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.')
      }
      
      throw new Error(errorMessage || 'Failed to generate clothing description')
    }
  }

  /**
   * Convert File or Blob to data URL
   * @private
   */
  async _fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  /**
   * Extract structured attributes from description JSON
   * Helper method to extract specific fields for database storage
   * 
   * @param {Object} descriptionJson - The JSON description object
   * @returns {Object} Extracted attributes
   */
  extractAttributes(descriptionJson) {
    if (!descriptionJson || typeof descriptionJson !== 'object') {
      return {}
    }

    return {
      primary_color: descriptionJson.color?.primary || null,
      secondary_colors: Array.isArray(descriptionJson.color?.secondary) 
        ? descriptionJson.color.secondary 
        : [],
      material: descriptionJson.material || null,
      style: descriptionJson.style || null,
      pattern: descriptionJson.pattern || null,
      fit: descriptionJson.fit || null,
      features: Array.isArray(descriptionJson.features) 
        ? descriptionJson.features 
        : [],
      season: Array.isArray(descriptionJson.season) 
        ? descriptionJson.season 
        : [],
      occasions: Array.isArray(descriptionJson.occasions) 
        ? descriptionJson.occasions 
        : [],
      ai_description: descriptionJson // Store full JSON description
    }
  }
}

// Export singleton instance
export const llamaDescriptionService = new LlamaDescriptionService()

