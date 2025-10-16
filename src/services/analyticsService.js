import { supabase, handleSupabaseError } from '@/lib/supabase'

export class AnalyticsService {
  async getWardrobeStats() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get basic wardrobe counts
      const { data: items, error: itemsError } = await supabase
        .from('clothes')
        .select('category, brand, color_tags, style_tags, created_at, is_favorite')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (itemsError) throw itemsError

      const stats = {
        total_items: items.length,
        categories: {},
        brands: {},
        colors: {},
        styles: {},
        favorites: 0,
        recent_additions: 0,
        monthly_additions: 0
      }

      // Calculate category distribution
      items.forEach(item => {
        if (item.category) {
          stats.categories[item.category] = (stats.categories[item.category] || 0) + 1
        }
        if (item.brand) {
          stats.brands[item.brand] = (stats.brands[item.brand] || 0) + 1
        }
        if (item.is_favorite) {
          stats.favorites++
        }
        if (item.color_tags && Array.isArray(item.color_tags)) {
          item.color_tags.forEach(color => {
            stats.colors[color] = (stats.colors[color] || 0) + 1
          })
        }
        if (item.style_tags && Array.isArray(item.style_tags)) {
          item.style_tags.forEach(style => {
            stats.styles[style] = (stats.styles[style] || 0) + 1
          })
        }
      })

      // Calculate recent additions
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      stats.recent_additions = items.filter(item => 
        new Date(item.created_at) > oneWeekAgo
      ).length

      // Calculate monthly additions
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      stats.monthly_additions = items.filter(item => 
        new Date(item.created_at) > oneMonthAgo
      ).length

      return stats
    } catch (error) {
      handleSupabaseError(error, 'get wardrobe stats')
    }
  }

  async getOutfitStats() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get outfit counts and data
      const { data: outfits, error: outfitsError } = await supabase
        .from('outfits')
        .select('occasion, weather_condition, temperature, created_at, likes_count')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (outfitsError) throw outfitsError

      const stats = {
        total_outfits: outfits.length,
        occasions: {},
        weather_conditions: {},
        temperature_ranges: {},
        total_likes: 0,
        recent_outfits: 0,
        most_liked_outfit: null
      }

      // Calculate outfit distribution
      outfits.forEach(outfit => {
        if (outfit.occasion) {
          stats.occasions[outfit.occasion] = (stats.occasions[outfit.occasion] || 0) + 1
        }
        if (outfit.weather_condition) {
          stats.weather_conditions[outfit.weather_condition] = (stats.weather_conditions[outfit.weather_condition] || 0) + 1
        }
        if (outfit.temperature) {
          const tempRange = this.getTemperatureRange(outfit.temperature)
          stats.temperature_ranges[tempRange] = (stats.temperature_ranges[tempRange] || 0) + 1
        }
        if (outfit.likes_count) {
          stats.total_likes += outfit.likes_count
        }
      })

      // Calculate recent outfits
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      stats.recent_outfits = outfits.filter(outfit => 
        new Date(outfit.created_at) > oneWeekAgo
      ).length

      // Find most liked outfit
      const mostLiked = outfits.reduce((max, outfit) => 
        (outfit.likes_count || 0) > (max.likes_count || 0) ? outfit : max, 
        { likes_count: 0 }
      )
      if (mostLiked.likes_count > 0) {
        stats.most_liked_outfit = mostLiked
      }

      return stats
    } catch (error) {
      handleSupabaseError(error, 'get outfit stats')
    }
  }

  getTemperatureRange(temperature) {
    if (temperature < 0) return 'Below 0°C'
    if (temperature < 10) return '0-10°C'
    if (temperature < 20) return '10-20°C'
    if (temperature < 30) return '20-30°C'
    return 'Above 30°C'
  }

  async getStyleInsights() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get user's items and outfits
      const [itemsResult, outfitsResult] = await Promise.all([
        supabase
          .from('clothes')
          .select('category, color_tags, style_tags, created_at')
          .eq('owner_id', user.id)
          .eq('removed_at', null),
        supabase
          .from('outfits')
          .select('occasion, style_tags, created_at')
          .eq('owner_id', user.id)
          .eq('removed_at', null)
      ])

      if (itemsResult.error) throw itemsResult.error
      if (outfitsResult.error) throw outfitsResult.error

      const items = itemsResult.data || []
      const outfits = outfitsResult.data || []

      const insights = {
        dominant_style: null,
        color_palette: [],
        most_used_categories: [],
        style_evolution: [],
        seasonal_preferences: {},
        occasion_preferences: {}
      }

      // Analyze dominant style
      const styleCount = {}
      items.forEach(item => {
        if (item.style_tags && Array.isArray(item.style_tags)) {
          item.style_tags.forEach(style => {
            styleCount[style] = (styleCount[style] || 0) + 1
          })
        }
      })
      insights.dominant_style = Object.entries(styleCount)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Casual'

      // Analyze color palette
      const colorCount = {}
      items.forEach(item => {
        if (item.color_tags && Array.isArray(item.color_tags)) {
          item.color_tags.forEach(color => {
            colorCount[color] = (colorCount[color] || 0) + 1
          })
        }
      })
      insights.color_palette = Object.entries(colorCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([color]) => color)

      // Analyze most used categories
      const categoryCount = {}
      items.forEach(item => {
        if (item.category) {
          categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
        }
      })
      insights.most_used_categories = Object.entries(categoryCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category)

      // Analyze style evolution over time
      const monthlyStyles = {}
      items.forEach(item => {
        const month = new Date(item.created_at).toISOString().slice(0, 7) // YYYY-MM
        if (!monthlyStyles[month]) monthlyStyles[month] = {}
        
        if (item.style_tags && Array.isArray(item.style_tags)) {
          item.style_tags.forEach(style => {
            monthlyStyles[month][style] = (monthlyStyles[month][style] || 0) + 1
          })
        }
      })
      insights.style_evolution = Object.entries(monthlyStyles)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, styles]) => ({
          month,
          dominant_style: Object.entries(styles)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown'
        }))

      // Analyze occasion preferences
      const occasionCount = {}
      outfits.forEach(outfit => {
        if (outfit.occasion) {
          occasionCount[outfit.occasion] = (occasionCount[outfit.occasion] || 0) + 1
        }
      })
      insights.occasion_preferences = occasionCount

      return insights
    } catch (error) {
      handleSupabaseError(error, 'get style insights')
    }
  }

  async getUsageStats(period = '30d') {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const now = new Date()
      let startDate

      switch (period) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      }

      // Get daily usage data
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (activitiesError) throw activitiesError

      // Group by day
      const dailyUsage = {}
      activities.forEach(activity => {
        const day = activity.created_at.split('T')[0]
        if (!dailyUsage[day]) {
          dailyUsage[day] = { items_added: 0, outfits_created: 0, friends_added: 0 }
        }
        
        switch (activity.type) {
          case 'item_added':
            dailyUsage[day].items_added++
            break
          case 'outfit_created':
            dailyUsage[day].outfits_created++
            break
          case 'friend_added':
            dailyUsage[day].friends_added++
            break
        }
      })

      // Convert to array format for charts
      const usageData = Object.entries(dailyUsage)
        .map(([date, data]) => ({
          date,
          ...data,
          total_activity: data.items_added + data.outfits_created + data.friends_added
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      return {
        period,
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        daily_usage: usageData,
        total_activities: activities.length,
        most_active_day: usageData.reduce((max, day) => 
          day.total_activity > max.total_activity ? day : max, 
          { total_activity: 0 }
        )
      }
    } catch (error) {
      handleSupabaseError(error, 'get usage stats')
    }
  }

  async getColorAnalysis() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data: items, error: itemsError } = await supabase
        .from('clothes')
        .select('color_tags, category')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (itemsError) throw itemsError

      const colorAnalysis = {
        total_colors: 0,
        color_distribution: {},
        colors_by_category: {},
        most_used_color: null,
        least_used_color: null,
        color_diversity_score: 0
      }

      // Analyze colors
      const colorCount = {}
      items.forEach(item => {
        if (item.color_tags && Array.isArray(item.color_tags)) {
          item.color_tags.forEach(color => {
            colorCount[color] = (colorCount[color] || 0) + 1
            
            // Track colors by category
            if (!colorAnalysis.colors_by_category[item.category]) {
              colorAnalysis.colors_by_category[item.category] = {}
            }
            colorAnalysis.colors_by_category[item.category][color] = 
              (colorAnalysis.colors_by_category[item.category][color] || 0) + 1
          })
        }
      })

      colorAnalysis.total_colors = Object.keys(colorCount).length
      colorAnalysis.color_distribution = colorCount

      // Find most and least used colors
      const sortedColors = Object.entries(colorCount).sort(([,a], [,b]) => b - a)
      colorAnalysis.most_used_color = sortedColors[0]?.[0] || null
      colorAnalysis.least_used_color = sortedColors[sortedColors.length - 1]?.[0] || null

      // Calculate color diversity score (0-100)
      const totalItems = items.length
      const uniqueColors = Object.keys(colorCount).length
      colorAnalysis.color_diversity_score = Math.min(100, (uniqueColors / totalItems) * 100)

      return colorAnalysis
    } catch (error) {
      handleSupabaseError(error, 'get color analysis')
    }
  }

  async getBrandAnalysis() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data: items, error: itemsError } = await supabase
        .from('clothes')
        .select('brand, category, created_at')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (itemsError) throw itemsError

      const brandAnalysis = {
        total_brands: 0,
        brand_distribution: {},
        brands_by_category: {},
        most_used_brand: null,
        brand_diversity_score: 0,
        recent_brands: []
      }

      // Analyze brands
      const brandCount = {}
      const brandDates = {}
      
      items.forEach(item => {
        if (item.brand) {
          brandCount[item.brand] = (brandCount[item.brand] || 0) + 1
          
          // Track brands by category
          if (!brandAnalysis.brands_by_category[item.category]) {
            brandAnalysis.brands_by_category[item.category] = {}
          }
          brandAnalysis.brands_by_category[item.category][item.brand] = 
            (brandAnalysis.brands_by_category[item.category][item.brand] || 0) + 1

          // Track brand dates for recent analysis
          if (!brandDates[item.brand]) {
            brandDates[item.brand] = []
          }
          brandDates[item.brand].push(item.created_at)
        }
      })

      brandAnalysis.total_brands = Object.keys(brandCount).length
      brandAnalysis.brand_distribution = brandCount

      // Find most used brand
      const sortedBrands = Object.entries(brandCount).sort(([,a], [,b]) => b - a)
      brandAnalysis.most_used_brand = sortedBrands[0]?.[0] || null

      // Calculate brand diversity score
      const totalItems = items.length
      const uniqueBrands = Object.keys(brandCount).length
      brandAnalysis.brand_diversity_score = Math.min(100, (uniqueBrands / totalItems) * 100)

      // Find recent brands (added in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      brandAnalysis.recent_brands = Object.entries(brandDates)
        .filter(([brand, dates]) => 
          dates.some(date => new Date(date) > thirtyDaysAgo)
        )
        .map(([brand]) => brand)

      return brandAnalysis
    } catch (error) {
      handleSupabaseError(error, 'get brand analysis')
    }
  }
}

export const analyticsService = new AnalyticsService()