import { supabase, handleSupabaseError } from '@/lib/supabase'
import { cloudinary } from '@/lib/cloudinary'

export class ClothesService {
  async getClothes(filters = {}) {
    try {
      let query = supabase
        .from('clothes')
        .select(`
          *,
          likes_count
        `)
        .eq('removed_at', null)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.clothing_type) {
        query = query.eq('clothing_type', filters.clothing_type)
      }
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

      const { data, error } = await query

      if (error) throw error

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
      handleSupabaseError(error, 'get clothes')
    }
  }

  async getClothesById(id) {
    try {
      const { data, error } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', id)
        .eq('removed_at', null)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'get clothes by id')
    }
  }

  async addClothes(clothesData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Upload image if provided
      let imageData = null
      if (clothesData.image_file) {
        imageData = await cloudinary.uploadImage(clothesData.image_file, {
          folder: 'stylesnap/clothes',
          quality: 80,
          format: 'auto'
        })
      }

      const insertData = {
        owner_id: user.id,
        name: clothesData.name,
        category: clothesData.category,
        clothing_type: clothesData.clothing_type,
        brand: clothesData.brand,
        size: clothesData.size,
        privacy: clothesData.privacy || 'private',
        is_favorite: clothesData.is_favorite || false,
        style_tags: clothesData.style_tags || [],
        notes: clothesData.notes
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
        .eq('removed_at', null)

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
