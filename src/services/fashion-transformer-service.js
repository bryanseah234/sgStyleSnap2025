/**
 * Fashion Transformer Service - StyleSnap
 *
 * Service to use the fashion-transformer API for AI-powered outfit scoring
 * and complementary item recommendations.
 *
 * API URL: https://ftransformer.onrender.com
 */

// API Base URL - Use our backend proxy to avoid CORS issues
const API_BASE_URL = '/api/proxy-transformer'

/**
 * Score an outfit for compatibility
 * @param {Array} outfitItems - Array of outfit items with images
 * @returns {Promise<Object>} Outfit compatibility score
 */
export async function scoreOutfit(outfitItems) {
  try {
    console.log('🤖 Fashion Transformer: Scoring outfit...')

    if (!outfitItems || outfitItems.length === 0) {
      throw new Error('No outfit items provided')
    }

    // Format items for JSON API with image_url
    const formattedItems = outfitItems.map((item, index) => ({
      id: item.id || `item_${Date.now()}_${index}`,
      category: item.category || 'unknown',
      description: item.description || item.name || `${item.category} item`,
      image_url: item.image_url || item.imageUrl || null
    }))

    console.log('📤 Fashion Transformer: Sending', formattedItems.length, 'items through proxy')

    // Call our backend proxy (no CORS issues!)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ items: formattedItems }),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    console.log('📥 Proxy response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ Proxy error:', errorData)
      throw new Error(`Proxy returned ${response.status}`)
    }

    const result = await response.json()

    console.log('✅ Fashion Transformer: Score received:', result.score)

    return {
      success: true,
      score: result.score,
      confidence: result.score
    }
  } catch (error) {
    console.error('❌ Fashion Transformer: Outfit scoring failed:', error)
    
    if (error.name === 'AbortError') {
      console.error('❌ Request timeout after 30s')
    } else if (error.message.includes('503')) {
      console.error('❌ Service unavailable - API may be cold starting')
    } else if (error.message.includes('CORS')) {
      console.error('❌ CORS error - check API configuration')
    }
    
    return {
      success: false,
      error: error.message,
      score: null
    }
  }
}

/**
 * Find complementary items for a partial outfit
 * @param {Array} outfitItems - Array of partial outfit items
 * @param {string} targetCategory - Category to find complementary items for
 * @param {number} k - Number of recommendations (default: 8)
 * @returns {Promise<Object>} Complementary item recommendations
 */
export async function findComplementaryItems(outfitItems, targetCategory, k = 8) {
  try {
    console.log('🤖 Fashion Transformer: Finding complementary items...')

    if (!outfitItems || outfitItems.length === 0) {
      throw new Error('No outfit items provided')
    }

    if (!targetCategory) {
      throw new Error('Target category is required')
    }

    // Prepare form data
    const formData = new FormData()
    
    // Add metadata JSON
    const metadata = outfitItems.map(item => ({
      description: item.description || item.name || `${item.category} item`,
      category: item.category || 'unknown'
    }))
    formData.append('item_metadata', JSON.stringify(metadata))
    
    // Add target category
    formData.append('target_category', targetCategory)
    formData.append('k', k.toString())
    
    // Add image files
    for (const item of outfitItems) {
      if (!item.image_url && !item.image_file) {
        throw new Error('Items must have image_url or image_file')
      }
      
      // Fetch image if we have a URL
      if (item.image_url) {
        const imageResponse = await fetch(item.image_url)
        const blob = await imageResponse.blob()
        formData.append('files', blob, `${item.id || 'item'}.jpg`)
      } else if (item.image_file) {
        formData.append('files', item.image_file)
      }
    }

    // Call the API
    const response = await fetch(`${API_BASE_URL}/recommendation/complementary`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API error: ${response.status} ${errorText}`)
    }

    const result = await response.json()

    if (result.error) {
      throw new Error(`Transformer API error: ${result.error}`)
    }

    console.log('✅ Fashion Transformer: Found', result.recommendations?.length || 0, 'complementary items')

    return {
      success: true,
      recommendations: result.recommendations || [],
      count: result.recommendations?.length || 0
    }
  } catch (error) {
    // CORS errors are expected - the backend API doesn't allow cross-origin requests
    if (error.message?.includes('CORS') || error.message?.includes('Failed to fetch')) {
      console.log('ℹ️ Fashion Transformer: API unavailable (CORS) for complementary search')
    } else {
      console.error('❌ Fashion Transformer: Complementary item search failed:', error.message)
    }
    return {
      success: false,
      error: error.message,
      recommendations: []
    }
  }
}

/**
 * Check if the API is healthy
 * @returns {Promise<boolean>} True if API is available
 */
export async function checkAPIHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET'
    })
    return response.ok
  } catch (error) {
    console.error('❌ Fashion Transformer: Health check failed:', error)
    return false
  }
}

/**
 * Get API status and information
 * @returns {Promise<Object>} API status information
 */
export async function getAPIStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET'
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        available: true,
        message: data.message || 'API is available'
      }
    } else {
      return {
        success: false,
        available: false,
        message: 'API is not responding'
      }
    }
  } catch (error) {
    return {
      success: false,
      available: false,
      message: error.message
    }
  }
}

/**
 * Validate outfit items before sending to API
 * @param {Array} items - Outfit items to validate
 * @returns {Object} Validation result
 */
export function validateOutfitItems(items) {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      errors: ['No items provided']
    }
  }

  const errors = []
  
  for (const item of items) {
    if (!item.image_url && !item.image_file) {
      errors.push(`Item ${item.id || 'unknown'} is missing an image`)
    }
    if (!item.category) {
      errors.push(`Item ${item.id || 'unknown'} is missing a category`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
