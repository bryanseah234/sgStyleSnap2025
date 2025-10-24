/**
 * StyleSnap - Clothing Items Service
 * 
 * Handles all operations related to clothing items including CRUD operations,
 * image uploads, favorites management, and search functionality.
 * 
 * Features:
 * - Create, read, update, delete clothing items
 * - Image upload and management
 * - Favorites system
 * - Search and filtering
 * - Privacy controls
 * - Category management
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { supabase, handleSupabaseError } from '@/lib/supabase'
import { cloudinary } from '@/lib/cloudinary'

/**
 * Clothing Items Service Class
 * 
 * Provides comprehensive functionality for managing clothing items
 * in the user's wardrobe with full CRUD operations and advanced features.
 */
export class ClothesService {
  /**
   * Retrieves clothing items with filtering and pagination
   * 
   * Fetches clothing items from the database with support for various filters,
   * search functionality, and pagination. Returns items that haven't been
   * soft-deleted (removed_at is null).
   * 
   * @param {Object} filters - Filter and pagination options
   * @param {string} filters.category - Filter by clothing category
   * @param {string} filters.clothing_type - Filter by clothing type
   * @param {string} filters.privacy - Filter by privacy setting
   * @param {boolean} filters.favorites - Filter to show only favorites
   * @param {string} filters.search - Search term for name and brand
   * @param {number} filters.limit - Maximum number of items to return
   * @param {number} filters.offset - Number of items to skip
   * @param {string} filters.orderBy - Sort order (default: '-created_at')
   * @returns {Promise<Object>} Object containing items data and pagination info
   * @throws {Error} If database query fails
   * 
   * @example
   * // Get all items
   * const result = await clothesService.getClothes()
   * 
   * // Get items with filters
   * const tops = await clothesService.getClothes({
   *   category: 'tops',
   *   limit: 10,
   *   search: 'shirt'
   * })
   * 
   * // Get favorite items
   * const favorites = await clothesService.getClothes({
   *   favorites: true,
   *   limit: 20
   * })
   */
  async getClothes(filters = {}) {
    try {
      console.log('🔧 ClothesService: getClothes called with filters:', filters)
      console.log('🔧 ClothesService: Supabase configured:', !!supabase)
      
      if (!supabase) {
        console.error('❌ ClothesService: Supabase not configured')
        return { success: false, error: 'Supabase not configured', data: [] }
      }

      let query = supabase
        .from('clothes')
        .select('*')
        .is('removed_at', null)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.owner_id) {
        console.log('🔧 ClothesService: Adding owner_id filter:', filters.owner_id)
        query = query.eq('owner_id', filters.owner_id)
      }
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      // clothing_type column doesn't exist in the database schema
      // if (filters.clothing_type) {
      //   query = query.eq('clothing_type', filters.clothing_type)
      // }
      if (filters.privacy) {
        query = query.eq('privacy', filters.privacy)
      }
      if (filters.favorites) {
        query = query.eq('is_favorite', true)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`)
      }

      // Pagination
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1)
      }

      console.log('🔧 ClothesService: Executing query...')
      const { data, error } = await query
      console.log('🔧 ClothesService: Query result:', { data, error })

      if (error) {
        console.error('❌ ClothesService: Query error:', error)
        throw error
      }

      console.log('✅ ClothesService: Query successful, returning data:', data?.length || 0, 'items')
      return {
        success: true,
        data: data || [],
        pagination: {
          total: data?.length || 0,
          limit: filters.limit || 20,
          offset: filters.offset || 0,
          has_more: data?.length === (filters.limit || 20)
        }
      }
    } catch (error) {
      console.error('❌ ClothesService: Error in getClothes:', error)
      return handleSupabaseError(error, 'get clothes')
    }
  }

  /**
   * Get friend's closet items using the get_friend_closet function
   * 
   * This function respects privacy settings and only returns items
   * that the friend has marked as 'friends' privacy level.
   * 
   * @param {string} friendId - The friend's user ID
   * @returns {Promise<Object>} Object containing friend's items data
   * @throws {Error} If database query fails or user not authenticated
   * 
   * @example
   * const result = await clothesService.getFriendCloset('friend-uuid-here')
   * console.log('Friend items:', result.data)
   */
  async getFriendCloset(friendId) {
    try {
      console.log('🔧 ClothesService: getFriendCloset called for friend:', friendId)
      
      if (!supabase) {
        console.error('❌ ClothesService: Supabase not configured')
        return { success: false, error: 'Supabase not configured', data: [] }
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.log('❌ ClothesService: User not authenticated')
        throw new Error('Not authenticated')
      }

      console.log('🔧 ClothesService: User authenticated:', user.email)

      // Use the get_friend_closet function which respects privacy settings
      const { data, error } = await supabase
        .rpc('get_friend_closet', {
          friend_id: friendId,
          viewer_id: user.id
        })

      if (error) {
        console.error('❌ ClothesService: get_friend_closet error:', error)
        throw error
      }

      console.log('✅ ClothesService: get_friend_closet successful, returning data:', data?.length || 0, 'items')
      return {
        success: true,
        data: data || [],
        count: data?.length || 0
      }
    } catch (error) {
      console.error('❌ ClothesService: Error in getFriendCloset:', error)
      handleSupabaseError(error, 'get friend closet')
    }
  }

  async getClothesById(id) {
    try {
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', id)
        .is('removed_at', null)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'get clothes by id')
    }
  }

  /**
   * Adds a new clothing item to the wardrobe
   * 
   * Creates a new clothing item in the database with optional image upload.
   * Handles image processing through Cloudinary and sets up proper metadata.
   * 
   * @param {Object} clothesData - Clothing item data
   * @param {string} clothesData.name - Name of the clothing item
   * @param {string} clothesData.category - Category (tops, bottoms, etc.)
   * @param {string} clothesData.clothing_type - Specific type (shirt, pants, etc.)
   * @param {string} clothesData.brand - Brand name
   * @param {string} clothesData.size - Size information
   * @param {string} clothesData.privacy - Privacy setting (private/public)
   * @param {boolean} clothesData.is_favorite - Whether item is favorited
   * @param {Array<string>} clothesData.style_tags - Style tags array
   * @param {string} clothesData.notes - Additional notes
   * @param {File} clothesData.image_file - Image file to upload
   * @returns {Promise<Object>} Created clothing item data
   * @throws {Error} If creation fails or user not authenticated
   * 
   * @example
   * const newItem = await clothesService.addClothes({
   *   name: 'Blue Denim Jacket',
   *   category: 'outerwear',
   *   clothing_type: 'jacket',
   *   brand: 'Levi\'s',
   *   size: 'M',
   *   privacy: 'public',
   *   style_tags: ['casual', 'denim'],
   *   notes: 'Perfect for spring weather',
   *   image_file: fileInput.files[0]
   * })
   */
  async addClothes(clothesData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Check item upload quota before adding
      const { data: canUpload, error: quotaError } = await supabase
        .rpc('can_upload_item', { user_id: user.id })

      if (quotaError) {
        console.error('ClothesService: Error checking item quota:', quotaError)
        throw quotaError
      }

      if (!canUpload) {
        throw new Error('Item upload quota exceeded. You can upload up to 50 items. Please delete some items to upload new ones.')
      }

      // Upload image if provided
      let imageData = null
      if (clothesData.image_file) {
        try {
          imageData = await cloudinary.uploadImage(clothesData.image_file, {
            folder: 'stylesnap/clothes',
            quality: 80,
            format: 'auto'
          })
        } catch (uploadError) {
          console.warn('Cloudinary upload failed:', uploadError)
          
          // Check if it's a configuration error
          if (uploadError.message.includes('Cloudinary not configured')) {
            throw new Error('Image upload is not configured. Please contact support.')
          } else if (uploadError.message.includes('Unsupported file type')) {
            throw new Error('Please select a valid image file (JPEG, PNG, WebP, or GIF).')
          } else if (uploadError.message.includes('File too large')) {
            throw new Error('Image file is too large. Please select a file smaller than 10MB.')
          } else {
            // Use a fallback image URL to satisfy the not-null constraint
            console.warn('Using fallback image due to upload failure')
            imageData = {
              secure_url: '/public/avatars/default-1.png',
              thumbnail_url: '/public/avatars/default-1.png'
            }
          }
        }
      } else {
        // No image provided, use fallback
        imageData = {
          secure_url: '/public/avatars/default-1.png',
          thumbnail_url: '/public/avatars/default-1.png'
        }
      }

      const insertData = {
        owner_id: user.id,
        name: clothesData.name,
        category: clothesData.category,
        // clothing_type: clothesData.clothing_type, // Column doesn't exist in database
        brand: clothesData.brand,
        size: clothesData.size,
        privacy: clothesData.privacy || 'private',
        is_favorite: clothesData.is_favorite || false,
        style_tags: clothesData.style_tags || [],
        // notes: clothesData.notes // Column doesn't exist in database
      }

      if (imageData) {
        insertData.image_url = imageData.secure_url
        insertData.thumbnail_url = imageData.thumbnail_url
      }

      const { data, error } = await supabase
        .from('clothes')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'add clothes')
    }
  }

  async updateClothes(id, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Handle image upload if provided
      if (updates.image_file) {
        const imageData = await cloudinary.uploadImage(updates.image_file, {
          folder: 'stylesnap/clothes',
          quality: 80,
          format: 'auto'
        })
        
        updates.image_url = imageData.secure_url
        updates.thumbnail_url = imageData.thumbnail_url
        delete updates.image_file
      }

      const { data, error } = await supabase
        .from('clothes')
        .update(updates)
        .eq('id', id)
        .eq('owner_id', user.id) // Ensure user owns the item
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'update clothes')
    }
  }

  async deleteClothes(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Soft delete by setting removed_at
      const { data, error } = await supabase
        .from('clothes')
        .update({ removed_at: new Date().toISOString() })
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'delete clothes')
    }
  }

  async toggleFavorite(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get current favorite status
      const { data: current, error: fetchError } = await supabase
        .from('clothes')
        .select('is_favorite')
        .eq('id', id)
        .eq('owner_id', user.id)
        .single()

      if (fetchError) throw fetchError

      // Toggle favorite status
      const { data, error } = await supabase
        .from('clothes')
        .update({ is_favorite: !current.is_favorite })
        .eq('id', id)
        .eq('owner_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'toggle favorite')
    }
  }

  async getClothesByCategory(category) {
    return this.getClothes({ category })
  }

  async getFavoriteClothes() {
    return this.getClothes({ favorites: true })
  }

  async searchClothes(searchTerm) {
    return this.getClothes({ search: searchTerm })
  }

  async getClothesStats() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('clothes')
        .select('category, is_favorite, created_at')
        .eq('owner_id', user.id)
        .is('removed_at', null)

      if (error) throw error

      const stats = {
        total_items: data.length,
        favorites_count: data.filter(item => item.is_favorite).length,
        category_breakdown: {},
        recent_uploads: data.filter(item => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(item.created_at) > weekAgo
        }).length
      }

      // Calculate category breakdown
      data.forEach(item => {
        stats.category_breakdown[item.category] = (stats.category_breakdown[item.category] || 0) + 1
      })

      return { success: true, data: stats }
    } catch (error) {
      handleSupabaseError(error, 'get clothes stats')
    }
  }

  // Alias methods for compatibility with components
  async filter(filters, orderBy, limit) {
    const result = await this.getClothes({ ...filters, limit })
    return result.data || []
  }

  async create(itemData) {
    const result = await this.addClothes(itemData)
    return result.data
  }

  async update(id, updates) {
    const result = await this.updateClothes(id, updates)
    return result.data
  }

  async delete(id) {
    const result = await this.deleteClothes(id)
    return result.data
  }

  async list(orderBy, limit) {
    const result = await this.getClothes({ limit })
    return result.data || []
  }
}

export const clothesService = new ClothesService()
