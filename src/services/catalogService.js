import { supabase, handleSupabaseError } from '@/lib/supabase'

export class CatalogService {
  async getCatalogItems(filters = {}) {
    try {
      let query = supabase
        .from('catalog_items')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.color) {
        query = query.eq('color', filters.color)
      }
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`)
      }
      if (filters.season) {
        query = query.eq('season', filters.season)
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
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
      handleSupabaseError(error, 'get catalog items')
    }
  }

  async getCatalogItemById(id) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'get catalog item by id')
    }
  }

  async addCatalogItemToCloset(catalogItemId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Use the database function to add catalog item to closet
      const { data, error } = await supabase
        .rpc('add_catalog_item_to_closet', {
          p_user_id: user.id,
          p_catalog_item_id: catalogItemId
        })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'add catalog item to closet')
    }
  }

  async searchCatalog(searchTerm, filters = {}) {
    try {
      if (!searchTerm || searchTerm.length < 2) {
        return this.getCatalogItems(filters)
      }

      let query = supabase
        .from('catalog_items')
        .select('*')
        .eq('is_active', true)
        .textSearch('search_vector', searchTerm)
        .order('created_at', { ascending: false })

      // Apply additional filters
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.color) {
        query = query.eq('color', filters.color)
      }
      if (filters.brand) {
        query = query.ilike('brand', `%${filters.brand}%`)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'search catalog')
    }
  }

  async getCatalogExcludingOwned() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('get_catalog_excluding_owned', {
          p_user_id: user.id
        })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get catalog excluding owned')
    }
  }

  async getCatalogStats() {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('category, color, brand, season')
        .eq('is_active', true)

      if (error) throw error

      const stats = {
        total_items: data.length,
        category_breakdown: {},
        color_breakdown: {},
        brand_breakdown: {},
        season_breakdown: {}
      }

      // Calculate breakdowns
      data.forEach(item => {
        stats.category_breakdown[item.category] = (stats.category_breakdown[item.category] || 0) + 1
        stats.color_breakdown[item.color] = (stats.color_breakdown[item.color] || 0) + 1
        stats.brand_breakdown[item.brand] = (stats.brand_breakdown[item.brand] || 0) + 1
        stats.season_breakdown[item.season] = (stats.season_breakdown[item.season] || 0) + 1
      })

      return { success: true, data: stats }
    } catch (error) {
      handleSupabaseError(error, 'get catalog stats')
    }
  }

  async getPopularCatalogItems(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select('*')
        .eq('is_active', true)
        .order('popularity_score', { ascending: false })
        .limit(limit)

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get popular catalog items')
    }
  }

  async getCatalogByCategory(category) {
    return this.getCatalogItems({ category })
  }

  async getCatalogByColor(color) {
    return this.getCatalogItems({ color })
  }

  async getCatalogByBrand(brand) {
    return this.getCatalogItems({ brand })
  }

  async getCatalogBySeason(season) {
    return this.getCatalogItems({ season })
  }
}

export const catalogService = new CatalogService()
