/**
 * Virtual Try-On Service
 * 
 * Service for integrating with IDM-VTON (Improved Diffusion Models for Virtual Try-On)
 * via Hugging Face Inference API
 * 
 * IDM-VTON generates realistic images of people wearing specified clothing items
 * by taking garment images as input and compositing them onto a human model.
 */

import { sanitizeToken, sanitizeUrl, safeLog, safeError, safeWarn } from '@/utils/log-sanitizer'

export class VirtualTryOnService {
  constructor() {
    // Hugging Face API configuration - multiple endpoints to try
    // Priority: Hugging Face Inference API (most reliable) > Spaces API
    // Note: Inference API requires API token, Spaces may not
    this.apiEndpoints = [
      'https://api-inference.huggingface.co/models/yisol/IDM-VTON', // IDM-VTON Inference API primary (requires token)
      'https://api-inference.huggingface.co/models/levihsu/OOTDiffusion', // OOTDiffusion Inference API alternative
      // Spaces API endpoints - use /run endpoint which is more reliable than /api/predict
      'https://yisol-idm-vton.hf.space', // IDM-VTON Space (will use /run endpoint)
      'https://levihsu-ootdiffusion.hf.space' // OOTDiffusion Space (will use /run endpoint)
    ]
    this.apiUrl = this.apiEndpoints[0] // Primary endpoint
    this.useSpacesFormat = false // Inference API is more reliable
    
    // You'll need to set your Hugging Face API token in environment variables
    // Get a free token from: https://huggingface.co/settings/tokens
    this.apiToken = import.meta.env.VITE_HUGGINGFACE_API_TOKEN || ''
    
    // Log for debugging (but don't expose the actual token)
    safeLog('🔍 VirtualTryOnService initialized')
    safeLog('🔍 API URL:', this.apiUrl)
    safeLog('🔍 apiToken exists:', !!this.apiToken)
    safeLog('🔍 apiToken:', sanitizeToken(this.apiToken))
    if (!this.apiToken) {
      safeWarn('⚠️ VITE_HUGGINGFACE_API_TOKEN is not set')
      safeWarn('⚠️ Available env vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')))
    } else {
      safeLog('✅ VITE_HUGGINGFACE_API_TOKEN is configured')
    }
    
    // Default model person image (base64 or URL)
    // For production, you should have a default model photo
    this.defaultModelImage = null
  }

  /**
   * Generate virtual try-on image using IDM-VTON
   * 
   * @param {Object} options - Try-on options
   * @param {string} options.topImageUrl - URL of the top/shirt image
   * @param {string} options.bottomImageUrl - URL of the bottom/pants image
   * @param {string} options.modelImageUrl - Optional: Custom model person image
   * @returns {Promise<Object>} Result with generated image
   */
  async generateTryOn({ topImageUrl, bottomImageUrl, modelImageUrl = null }) {
    try {
      console.log('🎨 VirtualTryOnService: Starting try-on generation...')
      safeLog('🎨 Top image:', sanitizeUrl(topImageUrl))
      safeLog('🎨 Bottom image:', sanitizeUrl(bottomImageUrl))

      // Validate inputs
      if (!topImageUrl && !bottomImageUrl) {
        throw new Error('At least one clothing item (top or bottom) is required')
      }

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

      // Call IDM-VTON API
      const result = await this.callIDMVTONApi(modelImageBlob, outfitImageBlob)

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
      const formatMsg = isIDMVTON ? '📄 Using IDM-VTON Inference API JSON format' : (isOOTDiffusion ? '📄 Using OOTDiffusion Inference API JSON format' : '📄 Using Inference API JSON format')
      console.log(formatMsg)
      // Extract base64 data from data URL (remove "data:image/...;base64," prefix)
      const modelBase64 = await this.blobToBase64(modelImage)
      const garmentBase64 = await this.blobToBase64(garmentImage)
      
      // Remove data URL prefix if present
      const modelBase64Data = modelBase64.includes(',') ? modelBase64.split(',')[1] : modelBase64
      const garmentBase64Data = garmentBase64.includes(',') ? garmentBase64.split(',')[1] : garmentBase64
      
      let payload
      if (isIDMVTON) {
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
        const modelType = isIDMVTON ? 'IDM-VTON' : (isOOTDiffusion ? 'OOTDiffusion' : 'Inference API')
        safeLog(`🔑 Using API token for ${modelType} request`)
      } else {
        throw new Error('Hugging Face API token is required for Inference API. Please set VITE_HUGGINGFACE_API_TOKEN.')
      }
      
      // Log request details (sanitized)
      safeLog(`📤 Sending to ${sanitizeUrl(url)}`)
      const formatType = isIDMVTON ? 'IDM-VTON' : (isOOTDiffusion ? 'OOTDiffusion' : 'standard Inference API')
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
    const isOOTDiffusion = url.includes('OOTDiffusion') || url.includes('ootdiffusion')
    
    const formatMsg = isIDMVTON ? '📋 Using IDM-VTON alternative inputs format' : (isOOTDiffusion ? '📋 Using OOTDiffusion alternative inputs format' : (isInferenceAPI ? '📋 Using Inference API raw inputs format' : '📋 Using JSON inputs method'))
    console.log(formatMsg)
    const modelBase64 = await this.blobToBase64(modelImage)
    const garmentBase64 = await this.blobToBase64(garmentImage)

    // Extract base64 data (remove data URL prefix)
    const modelBase64Data = modelBase64.includes(',') ? modelBase64.split(',')[1] : modelBase64
    const garmentBase64Data = garmentBase64.includes(',') ? garmentBase64.split(',')[1] : garmentBase64

    if (isInferenceAPI) {
      let payload
      if (isIDMVTON) {
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
        const modelType = isIDMVTON ? 'IDM-VTON' : (isOOTDiffusion ? 'OOTDiffusion' : 'Inference API')
        safeLog(`🔑 Using API token for ${modelType} request (alternative format)`)
      } else {
        throw new Error('Hugging Face API token is required for Inference API.')
      }
      
      // Log request details (sanitized)
      safeLog(`📤 Sending alternative format to ${sanitizeUrl(url)}`)
      const formatType = isIDMVTON ? 'IDM-VTON data URL format' : (isOOTDiffusion ? 'OOTDiffusion format' : 'standard dictionary')
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
    const isOOTDiffusion = url.includes('OOTDiffusion') || url.includes('ootdiffusion')
    
    if (contentType.includes('application/json')) {
      // JSON response
      const json = await response.json()
      
      // Handle Inference API error responses
      if (json.error) {
        throw new Error(`API error: ${json.error}`)
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
   * Call virtual try-on API with multiple fallback methods
   * 
   * @param {Blob} modelImage - Model person image
   * @param {Blob} garmentImage - Clothing/outfit image
   * @returns {Promise<Object>} Generated try-on image
   */
  async callIDMVTONApi(modelImage, garmentImage) {
    // Use appropriate methods based on API type
    // Inference API: try structured inputs first, then array format
    // Spaces API: try standard format, then FormData
    const methods = [
      { name: 'JSON (API-aware)', fn: (url) => this.callWithJSON(url, modelImage, garmentImage) },
      { name: 'JSON Inputs (Alternative)', fn: (url) => this.callWithInputsJSON(url, modelImage, garmentImage) },
      { name: 'FormData', fn: (url) => this.callWithFormData(url, modelImage, garmentImage) }
    ]

    // Sort endpoints: prioritize Inference API if token is available (more reliable)
    // Token available: Inference API first, then Spaces API
    // No token: Spaces API only
    const sortedEndpoints = this.apiToken 
      ? [
          // Inference API endpoints first (require token, more reliable)
          ...this.apiEndpoints.filter(url => url.includes('api-inference.huggingface.co')),
          // Then Spaces API endpoints (may not require token but less reliable)
          ...this.apiEndpoints.filter(url => !url.includes('api-inference.huggingface.co'))
        ]
      : this.apiEndpoints.filter(url => !url.includes('api-inference.huggingface.co'))

    const errors = [] // Track all errors for better debugging

    // Try each endpoint with each method
    for (const endpoint of sortedEndpoints) {
      // Skip Inference API endpoints if no token
      if (endpoint.includes('api-inference.huggingface.co') && !this.apiToken) {
        safeLog(`⏭️ Skipping ${endpoint} - API token required`)
        continue
      }

      for (const method of methods) {
        try {
          const urlToUse = endpoint
          safeLog(`🚀 Trying ${method.name} on ${sanitizeUrl(urlToUse)}`)
          
          // Add timeout (45 seconds for Inference API, 90 seconds for Spaces API which may be slower)
          const timeoutMs = endpoint.includes('api-inference.huggingface.co') ? 45000 : 90000
          
          const response = await Promise.race([
            method.fn(urlToUse),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
            )
          ])
          
          if (!response.ok) {
            let errorText = ''
            try {
              errorText = await response.text()
            } catch (e) {
              errorText = 'Could not read error response'
            }
            
            const errorMsg = `${method.name} failed on ${endpoint}: ${response.status} ${response.statusText}${errorText ? ` - ${errorText.substring(0, 200)}` : ''}`
            errors.push(errorMsg)
            console.warn(`⚠️ ${errorMsg}`)
            
            // If it's a 404, 503, or 500 (server errors), try next endpoint/method
            if (response.status === 404 || response.status === 503 || response.status === 500) {
              console.log(`⏭️ Server error ${response.status}, trying next method/endpoint...`)
              continue
            }
            
            // For auth errors with token, provide helpful message
            if (response.status === 401) {
              if (endpoint.includes('api-inference.huggingface.co')) {
                throw new Error('Invalid or expired Hugging Face API token. Please check your VITE_HUGGINGFACE_API_TOKEN.')
              }
              continue // Try next endpoint
            }
            
            // For other client errors (400, 422, etc.), try next method
            if (response.status >= 400 && response.status < 500) {
              console.log(`⏭️ Client error ${response.status}, trying next method...`)
              continue
            }
            
            // For other errors, throw but continue
            throw new Error(`API request failed: ${response.status} ${response.statusText}`)
          }

          // Success! Parse the response (pass endpoint URL for model-specific parsing)
          const result = await this.parseResponse(response, urlToUse)
          safeLog(`✅ Success with ${method.name} on ${sanitizeUrl(urlToUse)}`)
          return result

        } catch (error) {
          // Handle timeout errors
          if (error.message.includes('timeout')) {
            const errorMsg = `${method.name} on ${sanitizeUrl(urlToUse)}: ${error.message}`
            errors.push(errorMsg)
            safeWarn(`⏱️ ${errorMsg}`)
            continue
          }
          
          // If it's a token-related error and we're trying Inference API, skip silently
          if (error.message.includes('token') && endpoint.includes('api-inference.huggingface.co')) {
            safeLog(`⏭️ ${method.name} skipped on ${sanitizeUrl(urlToUse)} - token issue: ${error.message}`)
            continue
          }
          
          const errorMsg = `${method.name} failed on ${sanitizeUrl(urlToUse)}: ${error.message}`
          errors.push(errorMsg)
          safeWarn(`❌ ${errorMsg}`)
          // Continue to next method/endpoint
          continue
        }
      }
    }

    // If all methods and endpoints failed, provide helpful error message
    const hasToken = !!this.apiToken
    const triedInferenceAPI = sortedEndpoints.some(url => url.includes('api-inference.huggingface.co'))
    
    // Build comprehensive error message
    let errorMessage = 'All API calling methods failed.'
    
    if (errors.length > 0) {
      safeError('🔍 All API attempts failed. Last few errors:', errors.slice(-3))
      errorMessage += `\n\nRecent errors:\n${errors.slice(-3).map((e, i) => `${i + 1}. ${e}`).join('\n')}`
    }
    
    if (!hasToken && triedInferenceAPI) {
      errorMessage += '\n\nPlease set VITE_HUGGINGFACE_API_TOKEN in your environment variables for Inference API access. You can get a free token from: https://huggingface.co/settings/tokens'
    } else if (hasToken) {
      errorMessage += '\n\nSince your API token is configured, the issue might be:\n1) The model endpoints are temporarily unavailable (500 errors suggest server-side issues)\n2) Network connectivity issues to HuggingFace\n3) The model spaces may be experiencing high load\n\nPlease try again in a few moments, or check https://status.huggingface.co for service status.'
    } else {
      errorMessage += '\n\nThe virtual try-on service may be temporarily unavailable. Please try again later or set up an API token for more reliable access.'
    }
    
    throw new Error(errorMessage)
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

