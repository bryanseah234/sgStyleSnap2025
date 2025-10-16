import { supabase, handleSupabaseError } from '@/lib/supabase'

export class AnalyticsService {
  async getWardrobeAnalytics() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get basic wardrobe stats
      const { data: clothes, error: clothesError } = await supabase
        .from('clothes')
        .select('category, is_favorite, created_at, likes_count')
        .eq('owner_id', user.id)
        .eq('removed_at', null)

      if (clothesError) throw clothesError

      // Get most worn items
      const { data: mostWorn, error: mostWornError } = await supabase
        .rpc('get_most_worn_items', {
          p_user_id: user.id,
          p_limit: 5
        })

      if (mostWornError) throw mostWornError

      // Get outfit stats
      const { data: outfitStats, error: outfitStatsError } = await supabase
        .rpc('get_user_outfit_stats', {
          p_user_id: user.id
        })

      if (outfitStatsError) throw outfitStatsError

      // Calculate analytics
      const analytics = {
        total_items: clothes.length,
        favorites_count: clothes.filter(item => item.is_favorite).length,
        total_likes_received: clothes.reduce((sum, item) => sum + (item.likes_count || 0), 0),
        category_distribution: {},
        most_worn_items: mostWorn || [],
        outfit_stats: outfitStats[0] || {},
        recent_uploads: clothes.filter(item => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(item.created_at) > weekAgo
        }).length
      }

      // Calculate category breakdown
      clothes.forEach(item => {
        analytics.category_distribution[item.category] = (analytics.category_distribution[item.category] || 0) + 1
      })

      return { success: true, data: analytics }
    } catch (error) {
      handleSupabaseError(error, 'get wardrobe analytics')
    }
  }

  async getStyleInsights() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get color statistics
      const { data: colorStats, error: colorError } = await supabase
        .rpc('get_color_stats', {
          user_id_param: user.id
        })

      if (colorError) throw colorError

      // Get complementary color suggestions
      const { data: complementaryColors, error: compError } = await supabase
        .rpc('suggest_complementary_colors', {
          user_id_param: user.id
        })

      if (compError) throw compError

      // Get unworn combinations
      const { data: unwornItems, error: unwornError } = await supabase
        .rpc('get_unworn_combinations', {
          p_user_id: user.id
        })

      if (unwornError) throw unwornError

      const insights = {
        color_distribution: colorStats || [],
        complementary_colors: complementaryColors || [],
        unworn_items: unwornItems || [],
        style_recommendations: this.generateStyleRecommendations(colorStats, unwornItems)
      }

      return { success: true, data: insights }
    } catch (error) {
      handleSupabaseError(error, 'get style insights')
    }
  }

  generateStyleRecommendations(colorStats, unwornItems) {
    const recommendations = []

    // Recommend items that haven't been worn in a while
    if (unwornItems && unwornItems.length > 0) {
      recommendations.push({
        type: 'unworn_items',
        title: 'Items to Wear',
        description: `You have ${unwornItems.length} items that haven't been worn recently`,
        items: unwornItems.slice(0, 3)
      })
    }

    // Recommend based on color distribution
    if (colorStats && colorStats.length > 0) {
      const dominantColor = colorStats[0]
      if (dominantColor.percentage > 40) {
        recommendations.push({
          type: 'color_balance',
          title: 'Color Balance',
          description: `${dominantColor.color} dominates your wardrobe (${dominantColor.percentage}%). Consider adding more variety.`,
          suggestion: 'Try adding items in complementary colors'
        })
      }
    }

    return recommendations
  }

  async getOutfitAnalytics() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get outfit generation stats
      const { data: generationStats, error: genError } = await supabase
        .from('outfit_generation_history')
        .select('success, generation_time_ms, created_at')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days

      if (genError) throw genError

      // Get outfit ratings
      const { data: outfitRatings, error: ratingError } = await supabase
        .from('generated_outfits')
        .select('user_rating, occasion, created_at')
        .eq('user_id', user.id)
        .not('user_rating', 'is', null)

      if (ratingError) throw ratingError

      const analytics = {
        generation_stats: {
          total_generations: generationStats.length,
          success_rate: generationStats.filter(s => s.success).length / Math.max(generationStats.length, 1),
          avg_generation_time: generationStats.reduce((sum, s) => sum + (s.generation_time_ms || 0), 0) / Math.max(generationStats.length, 1)
        },
        rating_stats: {
          total_rated: outfitRatings.length,
          average_rating: outfitRatings.reduce((sum, o) => sum + o.user_rating, 0) / Math.max(outfitRatings.length, 1),
          occasion_breakdown: {}
        }
      }

      // Calculate occasion breakdown
      outfitRatings.forEach(outfit => {
        analytics.rating_stats.occasion_breakdown[outfit.occasion] = 
          (analytics.rating_stats.occasion_breakdown[outfit.occasion] || 0) + 1
      })

      return { success: true, data: analytics }
    } catch (error) {
      handleSupabaseError(error, 'get outfit analytics')
    }
  }

  async getSocialAnalytics() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get friends count
      const { data: friends, error: friendsError } = await supabase
        .from('friends')
        .select('id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (friendsError) throw friendsError

      // Get likes received
      const { data: likesReceived, error: likesError } = await supabase
        .from('item_likes')
        .select('id')
        .in('item_id', 
          supabase
            .from('clothes')
            .select('id')
            .eq('owner_id', user.id)
        )

      if (likesError) throw likesError

      // Get notifications count
      const { data: notifications, error: notifError } = await supabase
        .from('notifications')
        .select('id, type, is_read')
        .eq('recipient_id', user.id)

      if (notifError) throw notifError

      const analytics = {
        friends_count: friends.length,
        likes_received: likesReceived.length,
        notifications: {
          total: notifications.length,
          unread: notifications.filter(n => !n.is_read).length,
          by_type: {}
        }
      }

      // Calculate notifications by type
      notifications.forEach(notif => {
        analytics.notifications.by_type[notif.type] = (analytics.notifications.by_type[notif.type] || 0) + 1
      })

      return { success: true, data: analytics }
    } catch (error) {
      handleSupabaseError(error, 'get social analytics')
    }
  }

  async getUsageStats() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Get recent activity
      const [clothesAdded, outfitsGenerated, friendsAdded] = await Promise.all([
        supabase
          .from('clothes')
          .select('id')
          .eq('owner_id', user.id)
          .gte('created_at', thirtyDaysAgo),
        
        supabase
          .from('outfit_generation_history')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', thirtyDaysAgo),
        
        supabase
          .from('friends')
          .select('id')
          .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .eq('status', 'accepted')
          .gte('created_at', thirtyDaysAgo)
      ])

      const stats = {
        last_30_days: {
          clothes_added: clothesAdded.data?.length || 0,
          outfits_generated: outfitsGenerated.data?.length || 0,
          friends_added: friendsAdded.data?.length || 0
        },
        engagement_score: this.calculateEngagementScore(
          clothesAdded.data?.length || 0,
          outfitsGenerated.data?.length || 0,
          friendsAdded.data?.length || 0
        )
      }

      return { success: true, data: stats }
    } catch (error) {
      handleSupabaseError(error, 'get usage stats')
    }
  }

  calculateEngagementScore(clothesAdded, outfitsGenerated, friendsAdded) {
    // Simple engagement scoring algorithm
    const score = (clothesAdded * 2) + (outfitsGenerated * 3) + (friendsAdded * 5)
    return Math.min(score, 100) // Cap at 100
  }
}

export const analyticsService = new AnalyticsService()
