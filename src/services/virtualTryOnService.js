/**
 * Virtual Try-On Service
 * 
 * Service for integrating with Virtual Try-On Kontext LoRA model
 * via Hugging Face Inference Client
 * 
 * Generates realistic images of people wearing specified clothing items
 * by taking garment images as input and compositing them onto a human model.
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
    this.model = 'ovi054/virtual-tryon-kontext-lora'
    this.provider = 'replicate'
    
    // Default model person image (base64 or URL)
    // For production, you should have a default model photo
    this.defaultModelImage = null
  }

  /**
   * Generate virtual try-on image using Virtual Try-On Kontext LoRA model
   * 
   * @param {Object} options - Try-on options
   * @param {string} options.topImageUrl - URL of the top/shirt image
   * @param {string} options.bottomImageUrl - URL of the bottom/pants image
<<<<<<< HEAD
   * @param {string} options.modelImageUrl - Optional: Custom model person image
=======
>>>>>>> cdb4bd9df20570b099ab935d22379f1d291b8c0f
   * @returns {Promise<Object>} Result with generated image
   */
  async generateTryOn({ topImageUrl, bottomImageUrl }) {
    try {
      console.log('🎨 VirtualTryOnService: Starting try-on generation...')
      safeLog('🎨 Top image:', sanitizeUrl(topImageUrl))
      safeLog('🎨 Bottom image:', sanitizeUrl(bottomImageUrl))

      // Validate inputs
      if (!topImageUrl && !bottomImageUrl) {
        throw new Error('At least one clothing item (top or bottom) is required')
      }

<<<<<<< HEAD
      // Check API token only for inference API (Spaces API may work without token)
      // Note: Some endpoints require token, others don't

      // Composite the outfit (combine top and bottom into single image)
      const outfitImageBlob = await this.compositeOutfit(topImageUrl, bottomImageUrl)

      // Convert model image URL to blob if provided, otherwise use default
      let modelImageBlob
      if (modelImageUrl) {
        modelImageBlob = await this.urlToBlob(modelImageUrl)
      } else {
        // Use a default model image
        modelImageBlob = await this.getDefaultModelImage()
      }

      // Call Virtual Try-On API using InferenceClient
      const result = await this.callVirtualTryOnApi(modelImageBlob, outfitImageBlob)
=======
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

        // Prepare image parts for the API call
        let imageParts = []
        
        if (topImageBase64) {
          const topData = topImageBase64.includes(',') ? topImageBase64.split(',')[1] : topImageBase64
          const topMimeType = topImageBase64.startsWith('data:') 
            ? topImageBase64.split(';')[0].split(':')[1] || 'image/jpeg'
            : 'image/jpeg'
          imageParts.push({
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
          imageParts.push({
            inlineData: {
              mimeType: bottomMimeType,
              data: bottomData
            }
          })
        }

        // Build request config with images and ensure only 1 image is generated
        const requestConfig = {
          model: this.model,
          prompt: prompt,
          config: {
            numberOfImages: 1, // Always return only one image
            aspectRatio: "3:4",
            personGeneration: "allow_adult",
          },
        }

        // Include images if available
        if (imageParts.length > 0) {
          requestConfig.images = imageParts
          safeLog('📸 Including', imageParts.length, 'image(s) in direct API request')
        }

        safeLog('🖼️ numberOfImages set to:', requestConfig.config.numberOfImages)

        // Send clothing images along with the prompt for better accuracy
        const response = await this.client.models.generateImages(requestConfig)

        safeLog('✅ Received response from Imagen API')

        if (!response.generatedImages || response.generatedImages.length === 0) {
          throw new Error('No images generated in response')
        }

        // Ensure we only use the first image (should only be one anyway since numberOfImages=1)
        safeLog('✅ Generated', response.generatedImages.length, 'image(s), using first one')
        imageBytes = response.generatedImages[0].image.imageBytes
      }
      
      // Convert base64 image to blob
      const imageBlob = await this.base64ToBlob(imageBytes)
      const imageUrl = URL.createObjectURL(imageBlob)
>>>>>>> cdb4bd9df20570b099ab935d22379f1d291b8c0f

      console.log('✅ VirtualTryOnService: Try-on generated successfully')
      return {
        success: true,
        imageUrl: result.imageUrl,
        imageBlob: result.imageBlob
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
   * Create garment overlay by compositing garment image onto model image
   * Used for Virtual Try-On Kontext LoRA model which requires garments overlaid on model
   * 
   * @param {Blob} modelImage - Model person image blob
   * @param {Blob} garmentImage - Clothing/outfit image blob
   * @returns {Promise<Blob>} Image with garments overlaid on model
   */
  async createGarmentOverlay(modelImage, garmentImage) {
    try {
<<<<<<< HEAD
      console.log('🎨 VirtualTryOnService: Creating garment overlay...')
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Set canvas size (standard for virtual try-on)
      canvas.width = 768
      canvas.height = 1024
      
      // Load model image
      const modelImg = await this.blobToImage(modelImage)
      
      // Draw model image as background
      ctx.drawImage(modelImg, 0, 0, canvas.width, canvas.height)
      
      // Load and overlay garment image (composited outfit)
      const garmentImg = await this.blobToImage(garmentImage)
      
      // Overlay garment image on top of model
      // Use multiply or overlay blend mode for better integration
      ctx.globalAlpha = 0.7 // Semi-transparent overlay
      ctx.globalCompositeOperation = 'source-over'
      
      // Scale garment to fit model size
      const scale = Math.min(canvas.width / garmentImg.width, canvas.height / garmentImg.height)
      const scaledWidth = garmentImg.width * scale
      const scaledHeight = garmentImg.height * scale
      const x = (canvas.width - scaledWidth) / 2
      const y = (canvas.height - scaledHeight) / 2
      
      ctx.drawImage(garmentImg, x, y, scaledWidth, scaledHeight)
      ctx.globalAlpha = 1.0 // Reset alpha
      
      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ VirtualTryOnService: Garment overlay created successfully')
            resolve(blob)
          } else {
            reject(new Error('Failed to create garment overlay image'))
          }
        }, 'image/png')
      })
      
    } catch (error) {
      safeError('❌ VirtualTryOnService: Error creating garment overlay:', error)
      throw error
=======
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
        if (!this.apiKey) {
          return null
        }

        // Use REST API directly to avoid SDK method issues
        const prompt = "Describe these clothing items in detail. Focus on: " +
          "1. Type of garment (e.g., t-shirt, jeans, dress shirt, shorts) " +
          "2. Colors and patterns " +
          "3. Style and fit (e.g., casual, formal, loose, fitted) " +
          "4. Notable features (e.g., buttons, pockets, collar type, sleeves) " +
          "5. Material appearance (if visible). " +
          "Provide a concise but detailed description that would help generate an image of someone wearing these items."
        
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
        
        // Use REST API directly
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${this.apiKey}`
        
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
        })

        if (!geminiResponse.ok) {
          const errorText = await geminiResponse.text()
          throw new Error(`Gemini API error: ${geminiResponse.status} - ${errorText}`)
        }

        const geminiResult = await geminiResponse.json()
        
        if (!geminiResult.candidates || !geminiResult.candidates[0] || !geminiResult.candidates[0].content) {
          throw new Error('Invalid response from Gemini API')
        }
        
        const description = geminiResult.candidates[0].content.parts[0].text
        
        safeLog('📝 Clothing analysis:', description.substring(0, 150) + '...')
        return description
      }
    } catch (error) {
      safeWarn('⚠️ Failed to analyze clothing images with Gemini vision, using default description:', error.message)
      return null
>>>>>>> cdb4bd9df20570b099ab935d22379f1d291b8c0f
    }
  }

  /**
   * Convert Blob to HTMLImageElement
   * @param {Blob} blob - Image blob
   * @returns {Promise<HTMLImageElement>} Image element
   */
<<<<<<< HEAD
  async blobToImage(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(blob)
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl)
        resolve(img)
      }
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load image from blob'))
      }
      
      img.src = objectUrl
    })
=======
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
>>>>>>> cdb4bd9df20570b099ab935d22379f1d291b8c0f
  }

  /**
   * Composite multiple clothing items into a single outfit image
   * 
   * @param {string} topImageUrl - Top clothing image URL
   * @param {string} bottomImageUrl - Bottom clothing image URL
   * @returns {Promise<Blob>} Composited outfit image
   */
  async compositeOutfit(topImageUrl, bottomImageUrl) {
    try {
      console.log('🎨 VirtualTryOnService: Compositing outfit...')

      // Create a canvas to composite the images
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      // Set canvas size (standard for virtual try-on)
      canvas.width = 768
      canvas.height = 1024

      // Fill with white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Load and draw top image
      if (topImageUrl) {
        const topImg = await this.loadImage(topImageUrl)
        // Draw top in upper portion
        const topHeight = canvas.height * 0.4
        const topWidth = (topImg.width / topImg.height) * topHeight
        const topX = (canvas.width - topWidth) / 2
        ctx.drawImage(topImg, topX, 50, topWidth, topHeight)
      }

      // Load and draw bottom image
      if (bottomImageUrl) {
        const bottomImg = await this.loadImage(bottomImageUrl)
        // Draw bottom in lower portion
        const bottomHeight = canvas.height * 0.4
        const bottomWidth = (bottomImg.width / bottomImg.height) * bottomHeight
        const bottomX = (canvas.width - bottomWidth) / 2
        const bottomY = canvas.height * 0.45
        ctx.drawImage(bottomImg, bottomX, bottomY, bottomWidth, bottomHeight)
      }

      // Convert canvas to blob
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ VirtualTryOnService: Outfit composited successfully')
            resolve(blob)
          } else {
            reject(new Error('Failed to composite outfit image'))
          }
        }, 'image/png')
      })

    } catch (error) {
      safeError('❌ VirtualTryOnService: Error compositing outfit:', error)
      throw error
    }
  }

  /**
   * Convert Blob to base64 data URL
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
   * Convert blob to JPEG format if needed
   * OOTDiffusion may require JPEG format for better compatibility
   * 
   * @param {Blob} blob - Image blob
   * @returns {Promise<string>} Data URL with JPEG format
   */
  async blobToJPEGBase64(blob) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const objectUrl = URL.createObjectURL(blob)
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.width
          canvas.height = img.height
          const ctx = canvas.getContext('2d')
          
          // Draw white background for images with transparency
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          
          // Draw the image
          ctx.drawImage(img, 0, 0)
          
          // Convert to JPEG blob (quality 0.9)
          canvas.toBlob((jpegBlob) => {
            // Clean up object URL
            URL.revokeObjectURL(objectUrl)
            
            if (!jpegBlob) {
              reject(new Error('Failed to convert image to JPEG'))
              return
            }
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(jpegBlob)
          }, 'image/jpeg', 0.9)
        } catch (error) {
          URL.revokeObjectURL(objectUrl)
          reject(error)
        }
      }
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error('Failed to load image'))
      }
      img.src = objectUrl
    })
  }

  /**
   * Call API using FormData (multipart/form-data)
   * 
   * @param {string} url - API endpoint URL
   * @param {Blob} modelImage - Model person image
   * @param {Blob} garmentImage - Clothing/outfit image
   * @returns {Promise<Response>} API response
   */
  async callWithFormData(url, modelImage, garmentImage) {
    safeLog('📦 Using FormData method')
    
    // Determine if this is Inference API or Spaces API
    const isInferenceAPI = url.includes('api-inference.huggingface.co')
    const isSpacesAPI = !isInferenceAPI
    
    if (isSpacesAPI) {
      // For Spaces API, use /run endpoint and send as base64 in JSON instead
      // FormData doesn't work well with Spaces API, so convert to base64
      const modelBase64 = await this.blobToBase64(modelImage)
      const garmentBase64 = await this.blobToBase64(garmentImage)
      
      const spacesUrl = url.endsWith('/predict') || url.endsWith('/api/predict') 
        ? url.replace('/api/predict', '/run').replace('/predict', '/run')
        : url + '/run'
      
      const payload = {
        data: [modelBase64, garmentBase64]
      }
      
      return await fetch(spacesUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } else {
      // For Inference API, use FormData
      const formData = new FormData()
      formData.append('human_img', modelImage, 'model.png')
      formData.append('garm_img', garmentImage, 'garment.png')
      formData.append('garment_des', 'clothing item')

      const headers = {}
      
      // Only add Authorization header for inference API
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`
      }

      return await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        body: formData
      })
    }
  }

  /**
   * Call API using JSON with base64 images
   * Handles both Inference API and Spaces API formats
   * 
   * @param {string} url - API endpoint URL
   * @param {Blob} modelImage - Model person image
   * @param {Blob} garmentImage - Clothing/outfit image
   * @returns {Promise<Response>} API response
   */
  async callWithJSON(url, modelImage, garmentImage) {
    const isInferenceAPI = url.includes('api-inference.huggingface.co')
    const isIDMVTON = url.includes('yisol/IDM-VTON')
    const isKontextLoRA = url.includes('ovi054/virtual-tryon-kontext-lora') || url.includes('virtual-tryon-kontext-lora')
    const isOOTDiffusion = url.includes('OOTDiffusion') || url.includes('ootdiffusion')
    
    // For Inference API, first check if model is loaded (warmup)
    if (isInferenceAPI && this.apiToken) {
      try {
        const warmupResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`
          }
        })
        
        if (warmupResponse.status === 503) {
          // Model is loading, wait and retry
          const retryAfter = warmupResponse.headers.get('X-Wait-For-Model') || '30'
          safeLog(`⏳ Model is loading, waiting ${retryAfter} seconds...`)
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
        }
      } catch (e) {
        // Ignore warmup check errors, proceed with request
      }
    }
    
    if (isInferenceAPI) {
      const formatMsg = isKontextLoRA ? '📄 Using Virtual Try-On Kontext LoRA Inference API JSON format' : (isIDMVTON ? '📄 Using IDM-VTON Inference API JSON format' : (isOOTDiffusion ? '📄 Using OOTDiffusion Inference API JSON format' : '📄 Using Inference API JSON format'))
      console.log(formatMsg)
      // Extract base64 data from data URL (remove "data:image/...;base64," prefix)
      const modelBase64 = await this.blobToBase64(modelImage)
      const garmentBase64 = await this.blobToBase64(garmentImage)
      
      // Remove data URL prefix if present
      const modelBase64Data = modelBase64.includes(',') ? modelBase64.split(',')[1] : modelBase64
      const garmentBase64Data = garmentBase64.includes(',') ? garmentBase64.split(',')[1] : garmentBase64
      
      let payload
      if (isKontextLoRA) {
        // Virtual Try-On Kontext LoRA format: FLUX-based image-to-image model
        // Requires model image with garment overlay, and prompt with "wear it" trigger word
        // For Kontext LoRA, we need to overlay garments onto the model image
        // The model expects a single input image with garments overlaid
        const overlayImage = await this.createGarmentOverlay(modelImage, garmentImage)
        const overlayBase64 = await this.blobToBase64(overlayImage)
        const overlayBase64Data = overlayBase64.includes(',') ? overlayBase64.split(',')[1] : overlayBase64
        
        payload = {
          inputs: {
            image: `data:image/png;base64,${overlayBase64Data}`,
            prompt: "wear it",
            strength: 0.8,
            guidance_scale: 7.5,
            num_inference_steps: 28,
            lora_scale: 1.0 // Recommended LoRA weight
          }
        }
      } else if (isIDMVTON) {
        // IDM-VTON specific format: expects inputs as a dictionary with human_img and garm_img
        // Try with data URL format first as it's more compatible
        const modelDataUrl = `data:image/png;base64,${modelBase64Data}`
        const garmentDataUrl = `data:image/png;base64,${garmentBase64Data}`
        payload = {
          inputs: {
            human_img: modelDataUrl,
            garm_img: garmentDataUrl
            // Note: IDM-VTON may not require garment_des parameter
          }
        }
      } else if (isOOTDiffusion) {
        // OOTDiffusion specific format: expects model_image and cloth_image as data URLs
        const modelDataUrl = `data:image/png;base64,${modelBase64Data}`
        const garmentDataUrl = `data:image/png;base64,${garmentBase64Data}`
        payload = {
          inputs: {
            model_image: modelDataUrl,
            cloth_image: garmentDataUrl,
            model_type: 'hd', // 'hd' or 'dc'
            category: 0, // 0 for upper body, 1 for lower body, 2 for dress
            scale: 2.0,
            step: 20,
            sample: 4,
            seed: -1 // random seed
          }
        }
      } else {
        // Other Inference API models format
        payload = {
          inputs: {
            human_img: modelBase64Data,
            garm_img: garmentBase64Data,
            garment_des: 'clothing item'
          }
        }
      }

      const headers = {
        'Content-Type': 'application/json'
      }
      
      // Inference API REQUIRES token
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`
        const modelType = isKontextLoRA ? 'Virtual Try-On Kontext LoRA' : (isIDMVTON ? 'IDM-VTON' : (isOOTDiffusion ? 'OOTDiffusion' : 'Inference API'))
        safeLog(`🔑 Using API token for ${modelType} request`)
      } else {
        throw new Error('Hugging Face API token is required for Inference API. Please set VITE_HUGGINGFACE_API_TOKEN.')
      }
      
      // Log request details (sanitized)
      safeLog(`📤 Sending to ${sanitizeUrl(url)}`)
      const formatType = isKontextLoRA ? 'Virtual Try-On Kontext LoRA' : (isIDMVTON ? 'IDM-VTON' : (isOOTDiffusion ? 'OOTDiffusion' : 'standard Inference API'))
      console.log(`📤 Payload format: ${formatType}`)
      console.log(`📤 Payload keys: ${Object.keys(payload.inputs).join(', ')}`)
      console.log(`📤 Model image size: ${Math.round(modelBase64Data.length / 1024)}KB`)
      console.log(`📤 Garment image size: ${Math.round(garmentBase64Data.length / 1024)}KB`)

      // For Inference API, add retry logic for 503 (model loading)
      const makeRequest = async () => {
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: headers,
          body: JSON.stringify(payload)
        })
        
        // If model is loading (503), wait and retry once
        if (response.status === 503 && this.apiToken) {
          const retryAfter = response.headers.get('X-Wait-For-Model') || response.headers.get('Retry-After') || '30'
          safeLog(`⏳ Model loading (503), waiting ${retryAfter} seconds before retry...`)
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
          
          // Retry once
          const retryResponse = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: JSON.stringify(payload)
          })
          return retryResponse
        }
        
        return response
      }
      
      return await makeRequest()
    } else {
      safeLog('📄 Using Spaces API JSON format')
      // Spaces API format - use /run endpoint which is more reliable
      const spacesUrl = url.endsWith('/predict') || url.endsWith('/api/predict') 
        ? url.replace('/api/predict', '/run').replace('/predict', '/run')
        : url + '/run'
      
      let modelBase64, garmentBase64
      
      if (isOOTDiffusion) {
        // OOTDiffusion may require JPEG format for better compatibility
        // Convert to JPEG data URLs
        console.log('🔄 Converting images to JPEG format for OOTDiffusion')
        modelBase64 = await this.blobToJPEGBase64(modelImage)
        garmentBase64 = await this.blobToJPEGBase64(garmentImage)
      } else {
        // Other models can use original format
        modelBase64 = await this.blobToBase64(modelImage)
        garmentBase64 = await this.blobToBase64(garmentImage)
      }
      
      let payload
      if (isOOTDiffusion) {
        // OOTDiffusion Spaces API: data array with all parameters in order
        // Order: model_image, cloth_image, model_type, category, scale, step, sample, seed
        // Note: Images should be JPEG format data URLs (data:image/jpeg;base64,...)
        payload = {
          data: [
            modelBase64,    // model_image (JPEG data URL)
            garmentBase64,  // cloth_image (JPEG data URL)
            'hd',          // model_type
            0,             // category (0=upper, 1=lower, 2=dress)
            2.0,           // scale
            20,            // step
            4,             // sample
            -1             // seed
          ],
          fn_index: 0
        }
      } else {
        // Other Spaces API models: simple format
        payload = {
          data: [modelBase64, garmentBase64],
          fn_index: 0
        }
      }

      const headers = {
        'Content-Type': 'application/json'
      }
      
      return await fetch(spacesUrl, {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        body: JSON.stringify(payload)
      })
    }
  }

  /**
   * Call API using JSON with inputs object (alternative format)
   * Primarily for Inference API with raw base64 strings
   * 
   * @param {string} url - API endpoint URL
   * @param {Blob} modelImage - Model person image
   * @param {Blob} garmentImage - Clothing/outfit image
   * @returns {Promise<Response>} API response
   */
  async callWithInputsJSON(url, modelImage, garmentImage) {
    const isInferenceAPI = url.includes('api-inference.huggingface.co')
    const isIDMVTON = url.includes('yisol/IDM-VTON')
    const isKontextLoRA = url.includes('ovi054/virtual-tryon-kontext-lora') || url.includes('virtual-tryon-kontext-lora')
    const isOOTDiffusion = url.includes('OOTDiffusion') || url.includes('ootdiffusion')
    
    const formatMsg = isKontextLoRA ? '📋 Using Virtual Try-On Kontext LoRA alternative inputs format' : (isIDMVTON ? '📋 Using IDM-VTON alternative inputs format' : (isOOTDiffusion ? '📋 Using OOTDiffusion alternative inputs format' : (isInferenceAPI ? '📋 Using Inference API raw inputs format' : '📋 Using JSON inputs method')))
    console.log(formatMsg)
    const modelBase64 = await this.blobToBase64(modelImage)
    const garmentBase64 = await this.blobToBase64(garmentImage)

    // Extract base64 data (remove data URL prefix)
    const modelBase64Data = modelBase64.includes(',') ? modelBase64.split(',')[1] : modelBase64
    const garmentBase64Data = garmentBase64.includes(',') ? garmentBase64.split(',')[1] : garmentBase64

    if (isInferenceAPI) {
      let payload
      if (isKontextLoRA) {
        // Virtual Try-On Kontext LoRA alternative format
        const overlayImage = await this.createGarmentOverlay(modelImage, garmentImage)
        const overlayBase64 = await this.blobToBase64(overlayImage)
        const overlayBase64Data = overlayBase64.includes(',') ? overlayBase64.split(',')[1] : overlayBase64
        
        payload = {
          inputs: {
            image: overlayBase64Data, // Raw base64 without data URL prefix
            prompt: "wear it",
            strength: 0.8,
            guidance_scale: 7.5,
            num_inference_steps: 28,
            lora_scale: 1.0
          }
        }
      } else if (isIDMVTON) {
        // IDM-VTON alternative: try with direct data URL format (some models accept this)
        payload = {
          inputs: {
            human_img: `data:image/png;base64,${modelBase64Data}`,
            garm_img: `data:image/png;base64,${garmentBase64Data}`
          }
        }
      } else if (isOOTDiffusion) {
        // OOTDiffusion alternative format: use model_image and cloth_image
        payload = {
          inputs: {
            model_image: modelBase64Data,
            cloth_image: garmentBase64Data,
            model_type: 'hd',
            category: 0,
            scale: 2.0,
            step: 20,
            sample: 4,
            seed: -1
          }
        }
      } else {
        // Other Inference API models - dictionary format
        payload = {
          inputs: {
            human_img: modelBase64Data,
            garm_img: garmentBase64Data
          }
        }
      }

      const headers = {
        'Content-Type': 'application/json'
      }
      
      if (this.apiToken) {
        headers['Authorization'] = `Bearer ${this.apiToken}`
        const modelType = isKontextLoRA ? 'Virtual Try-On Kontext LoRA' : (isIDMVTON ? 'IDM-VTON' : (isOOTDiffusion ? 'OOTDiffusion' : 'Inference API'))
        safeLog(`🔑 Using API token for ${modelType} request (alternative format)`)
      } else {
        throw new Error('Hugging Face API token is required for Inference API.')
      }
      
      // Log request details (sanitized)
      safeLog(`📤 Sending alternative format to ${sanitizeUrl(url)}`)
      const formatType = isKontextLoRA ? 'Virtual Try-On Kontext LoRA format' : (isIDMVTON ? 'IDM-VTON data URL format' : (isOOTDiffusion ? 'OOTDiffusion format' : 'standard dictionary'))
      console.log(`📤 Format: ${formatType}`)
      console.log(`📤 Payload structure: inputs object with ${Object.keys(payload.inputs).length} keys`)

      // For Inference API, add retry logic for 503 (model loading)
      const makeRequest = async () => {
        const response = await fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: headers,
          body: JSON.stringify(payload)
        })
        
        // If model is loading (503), wait and retry once
        if (response.status === 503 && this.apiToken) {
          const retryAfter = response.headers.get('X-Wait-For-Model') || response.headers.get('Retry-After') || '30'
          safeLog(`⏳ Model loading (503), waiting ${retryAfter} seconds before retry...`)
          await new Promise(resolve => setTimeout(resolve, parseInt(retryAfter) * 1000))
          
          // Retry once
          const retryResponse = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            headers: headers,
            body: JSON.stringify(payload)
          })
          return retryResponse
        }
        
        return response
      }
      
      return await makeRequest()
    } else {
      // Spaces API alternative format - use /run endpoint
      const spacesUrl = url.endsWith('/predict') || url.endsWith('/api/predict') 
        ? url.replace('/api/predict', '/run').replace('/predict', '/run')
        : url + '/run'
      
      // Spaces API format: { data: [modelImage, garmentImage] } for /run endpoint
      const payload = {
        data: [modelBase64, garmentBase64]
      }

      const headers = {
        'Content-Type': 'application/json'
      }
      
      // Log request details
      safeLog(`📤 Sending Spaces API alternative format to ${sanitizeUrl(spacesUrl)}`)
      safeLog(`📤 Payload format: data array with ${payload.data.length} items`)

      return await fetch(spacesUrl, {
        method: 'POST',
        mode: 'cors',
        headers: headers,
        body: JSON.stringify(payload)
      })
    }
  }

  /**
   * Parse response - handles both blob and JSON responses
   * Supports Inference API and Spaces API formats
   * IDM-VTON specific handling included
   * 
   * @param {Response} response - API response
   * @param {string} url - API endpoint URL (for determining model type)
   * @returns {Promise<Object>} Parsed response with image
   */
  async parseResponse(response, url = '') {
    const contentType = response.headers.get('content-type') || ''
    const isIDMVTON = url.includes('yisol/IDM-VTON')
    const isKontextLoRA = url.includes('ovi054/virtual-tryon-kontext-lora') || url.includes('virtual-tryon-kontext-lora')
    const isOOTDiffusion = url.includes('OOTDiffusion') || url.includes('ootdiffusion')
    
    if (contentType.includes('application/json')) {
      // JSON response
      const json = await response.json()
      
      // Handle Inference API error responses
      if (json.error) {
        throw new Error(`API error: ${json.error}`)
      }
      
      // Handle Kontext LoRA response format (FLUX-based image-to-image)
      if (isKontextLoRA) {
        console.log('🔄 Parsing Virtual Try-On Kontext LoRA response format')
        
        // FLUX models may return base64 string directly or in an object
        if (typeof json === 'string' && json.length > 100) {
          // Likely a base64-encoded image
          const imageData = json.startsWith('data:image') ? json : `data:image/png;base64,${json}`
          const imageResponse = await fetch(imageData)
          const imageBlob = await imageResponse.blob()
          const imageUrl = URL.createObjectURL(imageBlob)
          return { imageUrl, imageBlob }
        }
        
        // FLUX models may return object with image key
        if (json && typeof json === 'object') {
          const imageData = json.image || json.generated_image || json.output || json.result || json.data
          
          if (imageData) {
            let imageUrl
            if (typeof imageData === 'string') {
              imageUrl = imageData.startsWith('data:image') 
                ? imageData 
                : `data:image/png;base64,${imageData}`
            } else if (Array.isArray(imageData) && imageData[0]) {
              // Handle array response
              const firstItem = imageData[0]
              imageUrl = typeof firstItem === 'string' && firstItem.startsWith('data:image')
                ? firstItem
                : `data:image/png;base64,${firstItem}`
            } else {
              throw new Error('Unexpected Kontext LoRA response format')
            }
            
            const imageResponse = await fetch(imageUrl)
            const imageBlob = await imageResponse.blob()
            const blobUrl = URL.createObjectURL(imageBlob)
            return { imageUrl: blobUrl, imageBlob }
          }
        }
      }
      
      // Handle OOTDiffusion response format: list of dictionaries with 'image' key
      if (isOOTDiffusion && Array.isArray(json) && json.length > 0) {
        console.log('🔄 Parsing OOTDiffusion response format (array of images)')
        const firstResult = json[0]
        if (firstResult && firstResult.image) {
          const imageData = firstResult.image
          const imageUrl = typeof imageData === 'string' && imageData.startsWith('data:image')
            ? imageData
            : `data:image/png;base64,${imageData}`
          const imageResponse = await fetch(imageUrl)
          const imageBlob = await imageResponse.blob()
          const blobUrl = URL.createObjectURL(imageBlob)
          return { imageUrl: blobUrl, imageBlob }
        }
      }
      
      // Handle IDM-VTON specific response format
      if (isIDMVTON) {
        console.log('🔄 Parsing IDM-VTON response format')
        
        // IDM-VTON may return base64 string directly
        if (typeof json === 'string' && json.length > 100) {
          // Likely a base64-encoded image
          const imageData = json.startsWith('data:image') ? json : `data:image/png;base64,${json}`
          const imageResponse = await fetch(imageData)
          const imageBlob = await imageResponse.blob()
          const imageUrl = URL.createObjectURL(imageBlob)
          return { imageUrl, imageBlob }
        }
        
        // IDM-VTON may return object with result/image/output
        if (json && typeof json === 'object') {
          // Try common IDM-VTON response keys
          const imageData = json.result || json.image || json.output || json.generated_image || json.data
          
          if (imageData) {
            let imageUrl
            if (typeof imageData === 'string') {
              imageUrl = imageData.startsWith('data:image') 
                ? imageData 
                : `data:image/png;base64,${imageData}`
            } else if (Array.isArray(imageData) && imageData[0]) {
              // Handle array response
              const firstItem = imageData[0]
              imageUrl = typeof firstItem === 'string' && firstItem.startsWith('data:image')
                ? firstItem
                : `data:image/png;base64,${firstItem}`
            } else {
              throw new Error('Unexpected IDM-VTON response format')
            }
            
            const imageResponse = await fetch(imageUrl)
            const imageBlob = await imageResponse.blob()
            const blobUrl = URL.createObjectURL(imageBlob)
            return { imageUrl: blobUrl, imageBlob }
          }
        }
      }
      
      // Handle Spaces API response format: { data: [imageBase64, ...] }
      if (json.data && Array.isArray(json.data) && json.data[0]) {
        const imageDataUrl = json.data[0]
        if (imageDataUrl.startsWith('data:image')) {
          // Convert data URL to blob
          const imageResponse = await fetch(imageDataUrl)
          const imageBlob = await imageResponse.blob()
          const imageUrl = URL.createObjectURL(imageBlob)
          return { imageUrl, imageBlob }
        }
      }
      
      // Handle Inference API response format: base64 string or object with image
      if (typeof json === 'string' && json.startsWith('data:image')) {
        const imageResponse = await fetch(json)
        const imageBlob = await imageResponse.blob()
        const imageUrl = URL.createObjectURL(imageBlob)
        return { imageUrl, imageBlob }
      }
      
      // Handle Inference API with base64 in response
      if (json && (json.image || json.generated_image || json.output)) {
        const imageData = json.image || json.generated_image || json.output
        const imageUrl = typeof imageData === 'string' && imageData.startsWith('data:image') 
          ? imageData 
          : `data:image/png;base64,${imageData}`
        const imageResponse = await fetch(imageUrl)
        const imageBlob = await imageResponse.blob()
        const blobUrl = URL.createObjectURL(imageBlob)
        return { imageUrl: blobUrl, imageBlob }
      }
      
      throw new Error('Unexpected JSON response format')
    } else {
      // Blob response (direct image - Inference API usually returns this, including IDM-VTON)
      console.log('🔄 Parsing blob response (direct image)')
      const imageBlob = await response.blob()
      const imageUrl = URL.createObjectURL(imageBlob)
      return { imageUrl, imageBlob }
    }
  }

  /**
   * Convert Blob to ArrayBuffer for InferenceClient
   * 
   * @param {Blob} blob - Image blob
   * @returns {Promise<ArrayBuffer>} ArrayBuffer
   */
  async blobToArrayBuffer(blob) {
    return await blob.arrayBuffer()
  }

  /**
   * Call virtual try-on API using Hugging Face InferenceClient
   * 
   * @param {Blob} modelImage - Model person image
   * @param {Blob} garmentImage - Clothing/outfit image
   * @returns {Promise<Object>} Generated try-on image
   */
  async callVirtualTryOnApi(modelImage, garmentImage) {
    // Check if client is initialized
    if (!this.client) {
      throw new Error('Hugging Face API token is required. Please set VITE_HUGGINGFACE_API_TOKEN in your environment variables. You can get a free token from: https://huggingface.co/settings/tokens')
    }

    try {
      safeLog('🚀 Calling Virtual Try-On Kontext LoRA model via InferenceClient')
      
      // Create garment overlay image (model with garments overlaid)
      safeLog('🎨 Creating garment overlay...')
      const overlayImage = await this.createGarmentOverlay(modelImage, garmentImage)
      
      safeLog(`📤 Sending to model: ${this.model} with provider: ${this.provider}`)
      
      // Call imageToImage using InferenceClient
      // InferenceClient accepts Blob, ArrayBuffer, or File directly
      const imageBlob = await this.client.imageToImage({
        provider: this.provider,
        model: this.model,
        inputs: overlayImage, // Pass Blob directly
        parameters: {
          prompt: "wear it",
        },
      })
      
      // The result is already a Blob
      const imageUrl = URL.createObjectURL(imageBlob)
      
      safeLog('✅ Virtual try-on generated successfully')
      return {
        imageUrl,
        imageBlob
      }
      
    } catch (error) {
      safeError('❌ VirtualTryOnService: Error calling InferenceClient:', error)
      
      // Provide helpful error messages
      if (error.message.includes('token') || error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Invalid or expired Hugging Face API token. Please check your VITE_HUGGINGFACE_API_TOKEN.')
      }
      
      if (error.message.includes('503') || error.message.includes('loading')) {
        throw new Error('Model is currently loading. Please wait a moment and try again.')
      }
      
      throw new Error(error.message || 'Failed to generate virtual try-on image')
    }
  }

  /**
   * Get default model image for try-on
   * Uses a standard fashion model photo for better try-on results
   * 
   * @returns {Promise<Blob>} Default model image blob
   */
  async getDefaultModelImage() {
    try {
      // Use a standard fashion model photo from Unsplash
      // Neutral pose, plain background, ideal for virtual try-on
      // Image: 768x1024px fashion model in neutral pose (free to use via Unsplash license)
      const defaultModelImageUrl = 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=768&h=1024&fit=crop&crop=center&auto=format&q=90'
      
      safeLog('📸 Using default fashion model image from Unsplash')
      
      // Fetch the image and convert to blob
      const response = await fetch(defaultModelImageUrl)
      if (!response.ok) {
        throw new Error(`Failed to fetch default model image: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      safeLog('✅ Default model image loaded successfully')
      return blob

    } catch (error) {
      safeError('❌ VirtualTryOnService: Error loading default model image:', error)
      safeWarn('⚠️ Falling back to placeholder...')
      
      // Fallback to a simple placeholder if the URL fails
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = 768
        canvas.height = 1024
        
        // Draw a simple silhouette placeholder
        ctx.fillStyle = '#F5F5F5'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Draw body shape
        ctx.fillStyle = '#E0E0E0'
        ctx.beginPath()
        ctx.ellipse(canvas.width / 2, canvas.height / 2, 150, 400, 0, 0, Math.PI * 2)
        ctx.fill()
        
        // Add text
        ctx.fillStyle = '#999999'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Model Placeholder', canvas.width / 2, canvas.height - 50)
        ctx.font = '16px sans-serif'
        ctx.fillText('(Default model image unavailable)', canvas.width / 2, canvas.height - 20)
        
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create fallback model image'))
            }
          }, 'image/png')
        })
      } catch (fallbackError) {
        safeError('❌ VirtualTryOnService: Error creating fallback model image:', fallbackError)
        throw new Error('Failed to load or create default model image')
      }
    }
  }

  /**
   * Load image from URL
   * 
   * @param {string} url - Image URL
   * @returns {Promise<HTMLImageElement>} Loaded image
   */
  async loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // Enable CORS
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`))
      img.src = url
    })
  }

  /**
   * Convert URL to Blob
   * 
   * @param {string} url - Image URL
   * @returns {Promise<Blob>} Image blob
   */
  async urlToBlob(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      return await response.blob()
    } catch (error) {
      safeError('❌ VirtualTryOnService: Error converting URL to blob:', error)
      throw error
    }
  }
}

export const virtualTryOnService = new VirtualTryOnService()

