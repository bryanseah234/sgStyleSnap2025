/**
 * Manual Outfit Service
 * Handles creation, updating, and management of manually created outfits
 */

import apiClient from './api'

class ManualOutfitService {
  /**
   * Create a new manual outfit
   * @param {Object} outfitData - Outfit data
   * @param {string} outfitData.name - Outfit name
   * @param {string} outfitData.notes - Optional notes
   * @param {Array<string>} outfitData.tags - Tags array
   * @param {string} outfitData.occasion - Occasion
   * @param {string} outfitData.weather - Weather condition
   * @param {Array} outfitData.items - Array of items with positions and z-index
   * @param {Object} outfitData.canvas_dimensions - Canvas width and height
   * @returns {Promise<Object>} Created outfit
   */
  async createOutfit(outfitData) {
    try {
      const response = await apiClient.post('/outfits/manual', {
        name: outfitData.name,
        notes: outfitData.notes || null,
        tags: outfitData.tags || [],
        occasion: outfitData.occasion || null,
        weather: outfitData.weather || null,
        item_ids: outfitData.items.map(item => item.id),
        item_positions: outfitData.items.reduce((acc, item) => {
          acc[item.id] = item.position
          return acc
        }, {}),
        item_z_indices: outfitData.items.reduce((acc, item) => {
          acc[item.id] = item.zIndex || 0
          return acc
        }, {}),
        canvas_dimensions: outfitData.canvas_dimensions,
        is_manual: true
      })

      return response.data
    } catch (error) {
      console.error('Error creating manual outfit:', error)
      throw error
    }
  }

  /**
   * Update an existing manual outfit
   * @param {string} outfitId - Outfit ID
   * @param {Object} outfitData - Updated outfit data
   * @returns {Promise<Object>} Updated outfit
   */
  async updateOutfit(outfitId, outfitData) {
    try {
      const response = await apiClient.put(`/outfits/manual/${outfitId}`, {
        name: outfitData.name,
        notes: outfitData.notes || null,
        tags: outfitData.tags || [],
        occasion: outfitData.occasion || null,
        weather: outfitData.weather || null,
        item_ids: outfitData.items.map(item => item.id),
        item_positions: outfitData.items.reduce((acc, item) => {
          acc[item.id] = item.position
          return acc
        }, {}),
        item_z_indices: outfitData.items.reduce((acc, item) => {
          acc[item.id] = item.zIndex || 0
          return acc
        }, {}),
        canvas_dimensions: outfitData.canvas_dimensions
      })

      return response.data
    } catch (error) {
      console.error('Error updating manual outfit:', error)
      throw error
    }
  }

  /**
   * Get a manual outfit by ID
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<Object>} Outfit with items and positions
   */
  async getOutfit(outfitId) {
    try {
      const response = await apiClient.get(`/outfits/manual/${outfitId}`)
      return response.data
    } catch (error) {
      console.error('Error getting manual outfit:', error)
      throw error
    }
  }

  /**
   * List all manual outfits for current user
   * @param {Object} options - Query options
   * @param {number} options.limit - Max results
   * @param {number} options.offset - Pagination offset
   * @returns {Promise<Object>} List of outfits
   */
  async listOutfits(options = {}) {
    try {
      const response = await apiClient.get('/outfits/manual', {
        params: {
          limit: options.limit || 20,
          offset: options.offset || 0
        }
      })
      return response.data
    } catch (error) {
      console.error('Error listing manual outfits:', error)
      throw error
    }
  }

  /**
   * Delete a manual outfit
   * @param {string} outfitId - Outfit ID
   * @returns {Promise<void>}
   */
  async deleteOutfit(outfitId) {
    try {
      await apiClient.delete(`/outfits/manual/${outfitId}`)
    } catch (error) {
      console.error('Error deleting manual outfit:', error)
      throw error
    }
  }

  /**
   * Save draft to localStorage
   * @param {Object} draftData - Draft data
   */
  saveDraft(draftData) {
    try {
      const draft = {
        ...draftData,
        timestamp: Date.now()
      }
      localStorage.setItem('outfit-draft', JSON.stringify(draft))
      return true
    } catch (error) {
      console.error('Error saving draft:', error)
      return false
    }
  }

  /**
   * Load draft from localStorage
   * @returns {Object|null} Draft data or null
   */
  loadDraft() {
    try {
      const draftJson = localStorage.getItem('outfit-draft')
      if (!draftJson) return null

      const draft = JSON.parse(draftJson)
      
      // Check if draft is not too old (7 days)
      const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      if (Date.now() - draft.timestamp > maxAge) {
        this.clearDraft()
        return null
      }

      return draft
    } catch (error) {
      console.error('Error loading draft:', error)
      return null
    }
  }

  /**
   * Clear draft from localStorage
   */
  clearDraft() {
    try {
      localStorage.removeItem('outfit-draft')
    } catch (error) {
      console.error('Error clearing draft:', error)
    }
  }
}

export default new ManualOutfitService()
