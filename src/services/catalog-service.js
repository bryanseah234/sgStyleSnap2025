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
 * Privacy:
 * - CRITICAL: All catalog items displayed anonymously
 * - No owner information exposed (admin or user-uploaded)
 * - catalog_items table has no owner_id column by design
 * 
 * Dependencies:
 * - Supabase client (api.js)
 * - SQL Migration 005 (catalog_items table)
 * - SQL Migration 009 (enhanced categories)
 */

import { supabase } from '../config/supabase'

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
   * @param {boolean} options.excludeOwned - Exclude items user already owns (default: true)
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 20)
   * @returns {Promise<Object>} Catalog items with pagination info (excludes owned items)
   * 
   * Note: By default, items user already has in their closet are filtered out.
   * This prevents showing duplicate suggestions.
   */
  async browse(options = {}) {
    const {
      category = null,
      color = null,
      brand = null,
      season = null,
      style = null,
      excludeOwned = true,
      page = 1,
      limit = 20
    } = options

    try {
      // Get current user if excluding owned items
      let userId = null
      if (excludeOwned) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id || null
      }

      // Use RPC function to get catalog items excluding owned
      const { data, error } = await supabase.rpc('get_catalog_excluding_owned', {
        user_id_param: userId,
        category_filter: category,
        color_filter: color,
        brand_filter: brand,
        season_filter: season,
        page_limit: limit,
        page_offset: (page - 1) * limit
      })

      if (error) throw error

      // Get total count for pagination
      let countQuery = supabase
        .from('catalog_items')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('privacy', 'public')

      // Apply same filters for count
      if (category) countQuery = countQuery.eq('category', category)
      if (color) countQuery = countQuery.eq('primary_color', color)
      if (brand) countQuery = countQuery.ilike('brand', `%${brand}%`)
      if (season) countQuery = countQuery.eq('season', season)

      const { count } = await countQuery

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

      // Check upload quota (50 items max, catalog additions don't count)
      const { count } = await supabase
        .from('clothes')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .is('removed_at', null)

      if (count >= 200) {
        throw new Error('You have reached your upload quota (50 items). Add from catalog instead!')
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
      if (catalogItem.primary_color) {
        newItem.primary_color = catalogItem.primary_color
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
        .eq('privacy', 'public')
        .not('brand', 'is', null)
        .order('brand')

      // Get distinct colors
      const { data: colorData } = await supabase
        .from('catalog_items')
        .select('primary_color')
        .eq('is_active', true)
        .eq('privacy', 'public')
        .not('primary_color', 'is', null)
        .order('primary_color')

      // Get distinct seasons
      const { data: seasonData } = await supabase
        .from('catalog_items')
        .select('season')
        .eq('is_active', true)
        .eq('privacy', 'public')
        .not('season', 'is', null)
        .order('season')

      // Remove duplicates
      const brands = [...new Set(brandData?.map(b => b.brand) || [])]
      const colors = [...new Set(colorData?.map(c => c.primary_color) || [])]
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
