import { supabase, handleSupabaseError } from '@/lib/supabase'

export class OutfitsService {
  async generateOutfit(params = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get user's clothes
      const { data: clothes, error: clothesError } = await supabase
        .from('clothes')
        .select('*')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (clothesError) throw clothesError

      if (!clothes || clothes.length === 0) {
        throw new Error('No clothes available for outfit generation')
      }

      // Simple outfit generation algorithm
      const outfit = this.generateOutfitAlgorithm(clothes, params)
      
      // Save generation history
      await this.saveGenerationHistory(user.id, params, outfit)

      return { success: true, data: outfit }
    } catch (error) {
      handleSupabaseError(error, 'generate outfit')
    }
  }

  generateOutfitAlgorithm(clothes, params) {
    const { occasion = 'casual', weather = 'mild', temperature = 20 } = params

    // Filter clothes by weather appropriateness
    const weatherAppropriate = clothes.filter(item => {
      if (weather === 'hot' && item.category === 'outerwear') return false
      if (weather === 'cold' && item.category === 'shorts') return false
      return true
    })

    // Simple algorithm: pick one item from each category
    const categories = ['top', 'bottom', 'shoes']
    const outfit = {
      items: [],
      confidence_score: 0.8,
      reasoning: `Generated for ${occasion} ${weather} weather`,
      occasion,
      weather_condition: weather,
      temperature
    }

    categories.forEach(category => {
      const categoryItems = weatherAppropriate.filter(item => item.category === category)
      if (categoryItems.length > 0) {
        const randomItem = categoryItems[Math.floor(Math.random() * categoryItems.length)]
        outfit.items.push({
          id: randomItem.id,
          name: randomItem.name,
          category: randomItem.category,
          image_url: randomItem.image_url,
          thumbnail_url: randomItem.thumbnail_url
        })
      }
    })

    // Add outerwear if cold weather
    if (weather === 'cold' || temperature < 15) {
      const outerwear = weatherAppropriate.filter(item => item.category === 'outerwear')
      if (outerwear.length > 0) {
        const randomOuterwear = outerwear[Math.floor(Math.random() * outerwear.length)]
        outfit.items.push({
          id: randomOuterwear.id,
          name: randomOuterwear.name,
          category: randomOuterwear.category,
          image_url: randomOuterwear.image_url,
          thumbnail_url: randomOuterwear.thumbnail_url
        })
      }
    }

    return outfit
  }

  async saveGenerationHistory(userId, params, outfit) {
    try {
      const { error } = await supabase
        .from('outfit_generation_history')
        .insert({
          user_id: userId,
          request_params: params,
          generation_time_ms: 100, // Simple generation is fast
          success: true
        })

      if (error) throw error
    } catch (error) {
      console.error('Failed to save generation history:', error)
      // Don't throw - this is not critical
    }
  }

  async saveOutfit(outfitData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('generated_outfits')
        .insert({
          user_id: user.id,
          item_ids: outfitData.items.map(item => item.id),
          outfit_items: outfitData.items,
          occasion: outfitData.occasion,
          weather_condition: outfitData.weather_condition,
          is_manual: outfitData.is_manual || false,
          outfit_name: outfitData.name,
          outfit_notes: outfitData.notes,
          ai_score: Math.round(outfitData.confidence_score * 100)
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'save outfit')
    }
  }

  async getOutfits(filters = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      let query = supabase
        .from('generated_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filters.is_saved !== undefined) {
        query = query.eq('is_saved', filters.is_saved)
      }

      if (filters.occasion) {
        query = query.eq('occasion', filters.occasion)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get outfits')
    }
  }

  async getOutfitById(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('generated_outfits')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'get outfit by id')
    }
  }

  async updateOutfit(id, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('generated_outfits')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'update outfit')
    }
  }

  async deleteOutfit(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('generated_outfits')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'delete outfit')
    }
  }

  async rateOutfit(id, rating) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5')
      }

      const { data, error } = await supabase
        .from('generated_outfits')
        .update({ user_rating: rating })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'rate outfit')
    }
  }

  async saveOutfit(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('generated_outfits')
        .update({ is_saved: true })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'save outfit')
    }
  }

  async unsaveOutfit(id) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('generated_outfits')
        .update({ is_saved: false })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'unsave outfit')
    }
  }

  async getOutfitStats() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('get_user_outfit_stats', {
          p_user_id: user.id
        })

      if (error) throw error

      return { success: true, data: data[0] || {} }
    } catch (error) {
      handleSupabaseError(error, 'get outfit stats')
    }
  }

  async getMostWornItems(limit = 10) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .rpc('get_most_worn_items', {
          p_user_id: user.id,
          p_limit: limit
        })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get most worn items')
    }
  }

  // Alias methods for compatibility with components
  async list(orderBy, limit) {
    const result = await this.getOutfits({ limit })
    return result.data || []
  }

  async filter(filters, orderBy, limit) {
    const result = await this.getOutfits({ ...filters, limit })
    return result.data || []
  }
}

export const outfitsService = new OutfitsService()
