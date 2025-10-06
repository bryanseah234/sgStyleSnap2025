/**
 * Catalog Service
 * Handles browsing and searching the pre-populated clothing catalog
 */

import apiClient from './api'

class CatalogService {
  /**
   * Browse catalog items with filters
   * @param {Object} filters - { category?, clothing_type?, color?, brand?, season?, style?, search? }
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 20)
   * @returns {Promise<Object>} { items, total, page, totalPages }
   */
  async browse(filters = {}, page = 1, limit = 20) {
    try {
      const params = {
        ...filters,
        page,
        limit,
      }

      const response = await apiClient.get('/catalog', { params })
      return response.data
    } catch (error) {
      console.error('Error browsing catalog:', error)
      throw error
    }
  }

  /**
   * Search catalog with full-text search
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise<Array>} Matching catalog items
   */
  async search(query, filters = {}) {
    try {
      const params = {
        search: query,
        ...filters,
      }

      const response = await apiClient.get('/catalog/search', { params })
      return response.data
    } catch (error) {
      console.error('Error searching catalog:', error)
      throw error
    }
  }

  /**
   * Get a single catalog item by ID
   * @param {string} itemId - Catalog item ID
   * @returns {Promise<Object>} Catalog item
   */
  async getItem(itemId) {
    try {
      const response = await apiClient.get(`/catalog/${itemId}`)
      return response.data
    } catch (error) {
      console.error('Error getting catalog item:', error)
      throw error
    }
  }

  /**
   * Add catalog item to user's closet
   * @param {string} catalogItemId - Catalog item ID
   * @param {Object} customizations - { size?, name? }
   * @returns {Promise<Object>} Created closet item
   */
  async addToCloset(catalogItemId, customizations = {}) {
    try {
      const response = await apiClient.post('/catalog/add-to-closet', {
        catalog_item_id: catalogItemId,
        ...customizations,
      })
      return response.data
    } catch (error) {
      console.error('Error adding catalog item to closet:', error)
      throw error
    }
  }

  /**
   * Get featured/popular catalog items
   * @param {number} limit - Number of items to fetch
   * @returns {Promise<Array>} Featured items
   */
  async getFeatured(limit = 10) {
    try {
      const response = await apiClient.get('/catalog/featured', {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error('Error getting featured items:', error)
      throw error
    }
  }

  /**
   * Get catalog items by category
   * @param {string} category - Category (top, bottom, outerwear, shoes, accessory)
   * @param {number} limit - Number of items
   * @returns {Promise<Array>} Items in category
   */
  async getByCategory(category, limit = 20) {
    try {
      const response = await apiClient.get(`/catalog/category/${category}`, {
        params: { limit },
      })
      return response.data
    } catch (error) {
      console.error('Error getting items by category:', error)
      throw error
    }
  }

  /**
   * Get catalog items by clothing type
   * @param {string} clothingType - Clothing type (T-Shirt, Pants, etc.)
   * @param {number} limit - Number of items
   * @returns {Promise<Array>} Items of type
   */
  async getByClothingType(clothingType, limit = 20) {
    try {
      const response = await apiClient.get(
        `/catalog/type/${encodeURIComponent(clothingType)}`,
        {
          params: { limit },
        }
      )
      return response.data
    } catch (error) {
      console.error('Error getting items by clothing type:', error)
      throw error
    }
  }

  /**
   * Get catalog filters/facets
   * @returns {Promise<Object>} Available filters { categories, clothing_types, colors, brands, seasons, styles }
   */
  async getFilters() {
    try {
      const response = await apiClient.get('/catalog/filters')
      return response.data
    } catch (error) {
      console.error('Error getting catalog filters:', error)
      throw error
    }
  }
}

export default new CatalogService()
