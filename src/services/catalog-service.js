/**
 * Catalog Service - StyleSnap
 * 
 * Purpose: Manage catalog browsing, searching, and adding items to closet
 * 
 * Features:
 * - Browse catalog with pagination
 * - Full-text search with filters
 * - Category, color, brand, season filtering
 * - Add catalog items to user's closet
 * 
 * Dependencies:
 * - Supabase client (api.js)
 * - SQL Migration 005 (catalog_items table)
 * - SQL Migration 009 (enhanced categories)
 */

import { supabase } from './auth-service'

const catalogService = {
  /**
   * Browse catalog items with optional filters
   * 
   * @param {Object} options - Filter and pagination options
   * @param {string} options.category - Filter by category
   * @param {string} options.color - Filter by color
   * @param {string} options.brand - Filter by brand
   * @param {string} options.season - Filter by season
   * @param {string} options.style - Filter by style
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Catalog items with pagination info
   */
  async browse(options = {}) {
    const {
      category = null,
      color = null,
      brand = null,
      season = null,
      style = null,
      page = 1,
      limit = 20
    } = options

    try {
      // Build query
      let query = supabase
        .from('catalog_items')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      // Apply filters
      if (category) {
        query = query.eq('category', category)
      }
      if (color) {
        query = query.eq('color', color)
      }
      if (brand) {
        query = query.ilike('brand', `%${brand}%`)
      }
      if (season) {
        query = query.eq('season', season)
      }
      if (style) {
        query = query.contains('style', [style])
      }

      // Apply pagination
      const start = (page - 1) * limit
      const end = start + limit - 1
      query = query.range(start, end)

      // Order by creation date (newest first)
      query = query.order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw error

      return {
        items: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error browsing catalog:', error)
      throw error
    }
  },

  /**
   * Search catalog with full-text search
   * 
   * @param {Object} options - Search and filter options
   * @param {string} options.q - Search query
   * @param {string} options.category - Filter by category
   * @param {string} options.color - Filter by color
   * @param {string} options.brand - Filter by brand
   * @param {string} options.season - Filter by season
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Search results with pagination
   */
  async search(options = {}) {
    const {
      q = '',
      category = null,
      color = null,
      brand = null,
      season = null,
      page = 1,
      limit = 20
    } = options

    try {
      // Use the search_catalog function from the database
      const { data, error } = await supabase.rpc('search_catalog', {
        search_query: q,
        filter_category: category,
        filter_color: color,
        filter_brand: brand,
        filter_season: season,
        page_limit: limit,
        page_offset: (page - 1) * limit
      })

      if (error) throw error

      // Get total count for pagination (approximate)
      const { count } = await supabase
        .from('catalog_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      return {
        items: data || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    } catch (error) {
      console.error('Error searching catalog:', error)
      throw error
    }
  },

  /**
   * Get a single catalog item by ID
   * 
   * @param {string} itemId - Catalog item ID
   * @returns {Promise<Object>} Catalog item details
   */
  async getById(itemId) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('id', itemId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching catalog item:', error)
      throw error
    }
  },

  /**
   * Add catalog item to user's closet
   * 
   * @param {string} catalogItemId - Catalog item ID
   * @param {Object} options - Additional options
   * @param {string} options.customName - Custom name for the item (optional)
   * @param {string} options.privacy - Privacy setting (default: 'friends')
   * @returns {Promise<Object>} Created closet item
   */
  async addToCloset(catalogItemId, options = {}) {
    const { customName = null, privacy = 'friends' } = options

    try {
      // Get catalog item details
      const catalogItem = await this.getById(catalogItemId)

      if (!catalogItem) {
        throw new Error('Catalog item not found')
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Check if user already has this catalog item
      const { data: existing } = await supabase
        .from('clothes')
        .select('id')
        .eq('owner_id', user.id)
        .eq('catalog_item_id', catalogItemId)
        .eq('removed_at', null)
        .maybeSingle()

      if (existing) {
        throw new Error('You already have this item in your closet')
      }

      // Check quota (200 items max)
      const { count } = await supabase
        .from('clothes')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .is('removed_at', null)

      if (count >= 200) {
        throw new Error('You have reached your item quota (200 items)')
      }

      // Create new closet item from catalog
      const newItem = {
        owner_id: user.id,
        catalog_item_id: catalogItemId,
        name: customName || catalogItem.name,
        category: catalogItem.category,
        image_url: catalogItem.image_url,
        thumbnail_url: catalogItem.thumbnail_url,
        style_tags: catalogItem.style,
        brand: catalogItem.brand,
        privacy
      }

      // Add color if available (from Migration 006)
      if (catalogItem.color) {
        newItem.primary_color = catalogItem.color
      }

      const { data, error } = await supabase
        .from('clothes')
        .insert(newItem)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error adding catalog item to closet:', error)
      throw error
    }
  },

  /**
   * Get unique values for filters (for filter dropdown population)
   * 
   * @returns {Promise<Object>} Filter options
   */
  async getFilterOptions() {
    try {
      // Get distinct brands
      const { data: brandData } = await supabase
        .from('catalog_items')
        .select('brand')
        .eq('is_active', true)
        .not('brand', 'is', null)
        .order('brand')

      // Get distinct colors
      const { data: colorData } = await supabase
        .from('catalog_items')
        .select('color')
        .eq('is_active', true)
        .not('color', 'is', null)
        .order('color')

      // Get distinct seasons
      const { data: seasonData } = await supabase
        .from('catalog_items')
        .select('season')
        .eq('is_active', true)
        .not('season', 'is', null)
        .order('season')

      // Remove duplicates
      const brands = [...new Set(brandData?.map(b => b.brand) || [])]
      const colors = [...new Set(colorData?.map(c => c.color) || [])]
      const seasons = [...new Set(seasonData?.map(s => s.season) || [])]

      return {
        brands,
        colors,
        seasons
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
      throw error
    }
  }
}

export default catalogService
