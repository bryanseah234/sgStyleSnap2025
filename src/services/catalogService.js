import { supabase, handleSupabaseError } from '@/lib/supabase'

export class CatalogService {
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get categories')
    }
  }

  async getBrands() {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get brands')
    }
  }

  async getColors() {
    try {
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get colors')
    }
  }

  async getStyles() {
    try {
      const { data, error } = await supabase
        .from('styles')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get styles')
    }
  }

  async searchItems(query) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(20)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'search catalog items')
    }
  }

  async getTrendingItems() {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .eq('is_active', true)
        .eq('is_trending', true)
        .order('trending_score', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get trending items')
    }
  }

  async getItemsByCategory(categoryId) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get items by category')
    }
  }

  async getItemsByBrand(brandId) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .eq('brand_id', brandId)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get items by brand')
    }
  }

  async getItem(itemId) {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .eq('id', itemId)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'get catalog item')
    }
  }

  async getSimilarItems(itemId) {
    try {
      // Get the item details first
      const item = await this.getItem(itemId)
      if (!item) return []

      // Find similar items based on category, brand, and colors
      const { data, error } = await supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .eq('category_id', item.category_id)
        .eq('is_active', true)
        .neq('id', itemId)
        .limit(6)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get similar items')
    }
  }

  async getRecommendedItems(userId) {
    try {
      // Get user's style preferences and wardrobe
      const { data: userItems, error: userError } = await supabase
        .from('clothes')
        .select('category, brand, style_tags')
        .eq('owner_id', userId)
        .eq('removed_at', null)

      if (userError) throw userError

      // Analyze user preferences
      const preferences = this.analyzeUserPreferences(userItems || [])

      // Get recommended items based on preferences
      let query = supabase
        .from('catalog_items')
        .select(`
          *,
          category:catalog_items_category_id_fkey (*),
          brand:catalog_items_brand_id_fkey (*),
          colors (*),
          styles (*)
        `)
        .eq('is_active', true)

      // Filter by preferred categories
      if (preferences.categories.length > 0) {
        query = query.in('category_id', preferences.categories)
      }

      // Filter by preferred brands
      if (preferences.brands.length > 0) {
        query = query.in('brand_id', preferences.brands)
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(12)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get recommended items')
    }
  }

  analyzeUserPreferences(userItems) {
    const preferences = {
      categories: [],
      brands: [],
      colors: [],
      styles: []
    }

    // Count occurrences
    const categoryCount = {}
    const brandCount = {}
    const colorCount = {}
    const styleCount = {}

    userItems.forEach(item => {
      // Categories
      if (item.category) {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      }

      // Brands
      if (item.brand) {
        brandCount[item.brand] = (brandCount[item.brand] || 0) + 1
      }

      // Colors
        // color_tags column doesn't exist in database schema
        // if (item.color_tags && Array.isArray(item.color_tags)) {
        //   item.color_tags.forEach(color => {
        //     colorCount[color] = (colorCount[color] || 0) + 1
        //   })
        // }

      // Styles
      if (item.style_tags && Array.isArray(item.style_tags)) {
        item.style_tags.forEach(style => {
          styleCount[style] = (styleCount[style] || 0) + 1
        })
      }
    })

    // Get top preferences (top 3-5)
    preferences.categories = Object.entries(categoryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category)

    preferences.brands = Object.entries(brandCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand]) => brand)

    preferences.colors = Object.entries(colorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([color]) => color)

    preferences.styles = Object.entries(styleCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([style]) => style)

    return preferences
  }

  async addToWishlist(itemId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', user.id)
        .eq('catalog_item_id', itemId)
        .single()

      if (existing) {
        throw new Error('Item already in wishlist')
      }

      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          catalog_item_id: itemId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'add to wishlist')
    }
  }

  async removeFromWishlist(itemId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('catalog_item_id', itemId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'remove from wishlist')
    }
  }

  async getWishlist() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('wishlist')
        .select(`
          *,
          catalog_item:catalog_items_catalog_item_id_fkey (
            *,
            category:catalog_items_category_id_fkey (*),
            brand:catalog_items_brand_id_fkey (*),
            colors (*),
            styles (*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get wishlist')
    }
  }
}

export const catalogService = new CatalogService()