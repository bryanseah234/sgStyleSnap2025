import { supabase, handleSupabaseError } from '@/lib/supabase'

export class OutfitsService {
  async getOutfits(filters = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      let query = supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            *,
            clothing_item:outfit_items_clothing_item_id_fkey (
              id,
              name,
              category,
              brand,
              image_url,
              thumbnail_url
            )
          ),
          likes_count
        `)
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (filters.orderBy) {
        const [column, direction] = filters.orderBy.startsWith('-') 
          ? [filters.orderBy.slice(1), 'desc'] 
          : [filters.orderBy, 'asc']
        query = query.order(column, { ascending: direction === 'asc' })
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get outfits')
    }
  }

  async getOutfit(outfitId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('outfits')
        .select(`
          *,
          outfit_items (
            *,
            clothing_item:outfit_items_clothing_item_id_fkey (
              id,
              name,
              category,
              brand,
              image_url,
              thumbnail_url
            )
          ),
          likes_count
        `)
        .eq('id', outfitId)
        .eq('owner_id', user.id)
        .eq('removed_at', null)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'get outfit')
    }
  }

  async createOutfit(outfitData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          owner_id: user.id,
          outfit_name: outfitData.name,
          description: outfitData.description,
          occasion: outfitData.occasion,
          weather_condition: outfitData.weather,
          temperature: outfitData.temperature,
          is_public: outfitData.is_public || false,
          style_tags: outfitData.style_tags || []
        })
        .select()
        .single()

      if (outfitError) throw outfitError

      // Add outfit items
      if (outfitData.items && outfitData.items.length > 0) {
        const outfitItems = outfitData.items.map((item, index) => ({
          outfit_id: outfit.id,
          clothing_item_id: item.id,
          position_x: item.x || 0,
          position_y: item.y || 0,
          z_index: item.z_index || index,
          notes: item.notes || ''
        }))

        const { error: itemsError } = await supabase
          .from('outfit_items')
          .insert(outfitItems)

        if (itemsError) throw itemsError
      }

      return outfit
    } catch (error) {
      handleSupabaseError(error, 'create outfit')
    }
  }

  async updateOutfit(outfitId, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('outfits')
        .update(updates)
        .eq('id', outfitId)
        .eq('owner_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'update outfit')
    }
  }

  async deleteOutfit(outfitId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Soft delete
      const { data, error } = await supabase
        .from('outfits')
        .update({ removed_at: new Date().toISOString() })
        .eq('id', outfitId)
        .eq('owner_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'delete outfit')
    }
  }

  async likeOutfit(outfitId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('outfit_likes')
        .select('id')
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        throw new Error('Outfit already liked')
      }

      const { data, error } = await supabase
        .from('outfit_likes')
        .insert({
          outfit_id: outfitId,
          user_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Update likes count
      await supabase.rpc('increment_outfit_likes', { outfit_id: outfitId })

      return data
    } catch (error) {
      handleSupabaseError(error, 'like outfit')
    }
  }

  async unlikeOutfit(outfitId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('outfit_likes')
        .delete()
        .eq('outfit_id', outfitId)
        .eq('user_id', user.id)

      if (error) throw error

      // Update likes count
      await supabase.rpc('decrement_outfit_likes', { outfit_id: outfitId })

      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'unlike outfit')
    }
  }

  async shareOutfit(outfitId, friendIds) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Create notifications for friends
      const notifications = friendIds.map(friendId => ({
        user_id: friendId,
        type: 'outfit_shared',
        title: 'Outfit Shared',
        message: `${user.name || user.username} shared an outfit with you`,
        data: {
          outfit_id: outfitId,
          sharer_id: user.id
        }
      }))

      const { error } = await supabase
        .from('notifications')
        .insert(notifications)

      if (error) throw error

      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'share outfit')
    }
  }

  async generateOutfit(preferences) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get user's clothing items
      const { data: items, error: itemsError } = await supabase
        .from('clothes')
        .select('*')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (itemsError) throw itemsError

      // Simple AI outfit generation logic
      const outfit = this.generateOutfitLogic(items, preferences)
      
      return {
        items: outfit,
        preferences,
        generated_at: new Date().toISOString()
      }
    } catch (error) {
      handleSupabaseError(error, 'generate outfit')
    }
  }

  generateOutfitLogic(items, preferences) {
    const { occasion, weather, temperature } = preferences
    
    // Filter items based on weather and temperature
    let suitableItems = items.filter(item => {
      if (weather === 'cold' && temperature < 10) {
        return ['outerwear', 'tops', 'bottoms', 'shoes'].includes(item.category)
      } else if (weather === 'hot' && temperature > 25) {
        return ['tops', 'bottoms', 'shoes', 'accessories'].includes(item.category)
      } else if (weather === 'rainy') {
        return ['outerwear', 'tops', 'bottoms', 'shoes'].includes(item.category)
      }
      return true
    })

    // Filter by occasion
    if (occasion === 'formal') {
      suitableItems = suitableItems.filter(item => 
        item.category === 'tops' || item.category === 'bottoms' || item.category === 'shoes'
      )
    } else if (occasion === 'casual') {
      suitableItems = suitableItems.filter(item => 
        !item.style_tags?.includes('formal')
      )
    }

    // Generate outfit (1 top, 1 bottom, 1 shoe, optional outerwear/accessories)
    const outfit = []
    
    // Add top
    const tops = suitableItems.filter(item => item.category === 'tops')
    if (tops.length > 0) {
      outfit.push(tops[Math.floor(Math.random() * tops.length)])
    }

    // Add bottom
    const bottoms = suitableItems.filter(item => item.category === 'bottoms')
    if (bottoms.length > 0) {
      outfit.push(bottoms[Math.floor(Math.random() * bottoms.length)])
    }

    // Add shoes
    const shoes = suitableItems.filter(item => item.category === 'shoes')
    if (shoes.length > 0) {
      outfit.push(shoes[Math.floor(Math.random() * shoes.length)])
    }

    // Add outerwear if cold/rainy
    if ((weather === 'cold' || weather === 'rainy') && temperature < 15) {
      const outerwear = suitableItems.filter(item => item.category === 'outerwear')
      if (outerwear.length > 0) {
        outfit.push(outerwear[Math.floor(Math.random() * outerwear.length)])
      }
    }

    // Add accessories for formal occasions
    if (occasion === 'formal') {
      const accessories = suitableItems.filter(item => item.category === 'accessories')
      if (accessories.length > 0) {
        outfit.push(accessories[Math.floor(Math.random() * accessories.length)])
      }
    }

    return outfit
  }

  async getOutfitSuggestions(itemId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get the item details
      const { data: item, error: itemError } = await supabase
        .from('clothes')
        .select('*')
        .eq('id', itemId)
        .eq('owner_id', user.id)
        .single()

      if (itemError) throw itemError

      // Get other items that would work well with this item
      const { data: suggestions, error: suggestionsError } = await supabase
        .from('clothes')
        .select('*')
        .eq('owner_id', user.id)
        .eq('removed_at', null)
        .neq('id', itemId)

      if (suggestionsError) throw suggestionsError

      // Simple suggestion logic based on color and style
      const compatibleItems = suggestions.filter(suggestion => {
        // Different category
        if (suggestion.category === item.category) return false
        
        // Color compatibility (simplified)
        const itemColors = item.color_tags || []
        const suggestionColors = suggestion.color_tags || []
        
        // Style compatibility
        const itemStyles = item.style_tags || []
        const suggestionStyles = suggestion.style_tags || []
        
        return itemColors.some(color => suggestionColors.includes(color)) ||
               itemStyles.some(style => suggestionStyles.includes(style))
      })

      return compatibleItems.slice(0, 6) // Return top 6 suggestions
    } catch (error) {
      handleSupabaseError(error, 'get outfit suggestions')
    }
  }

  async getWeatherBasedOutfits(weatherData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { temperature, condition } = weatherData
      
      // Generate multiple outfit options based on weather
      const outfits = []
      
      // Warm weather outfit
      if (temperature > 20) {
        const warmOutfit = await this.generateOutfit({
          occasion: 'casual',
          weather: 'sunny',
          temperature: temperature
        })
        outfits.push({ ...warmOutfit, name: 'Warm Weather Look' })
      }
      
      // Cool weather outfit
      if (temperature < 15) {
        const coolOutfit = await this.generateOutfit({
          occasion: 'casual',
          weather: 'cold',
          temperature: temperature
        })
        outfits.push({ ...coolOutfit, name: 'Cool Weather Look' })
      }
      
      // Rainy weather outfit
      if (condition === 'rain') {
        const rainyOutfit = await this.generateOutfit({
          occasion: 'casual',
          weather: 'rainy',
          temperature: temperature
        })
        outfits.push({ ...rainyOutfit, name: 'Rainy Day Look' })
      }

      return outfits
    } catch (error) {
      handleSupabaseError(error, 'get weather based outfits')
    }
  }
}

export const outfitsService = new OutfitsService()