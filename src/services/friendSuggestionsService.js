import { supabase } from '@/lib/supabase'

/**
 * Friend Suggestions Service
 * 
 * Handles friend outfit suggestions - viewing received suggestions,
 * approving/rejecting them, and managing the suggestion workflow.
 */
export class FriendSuggestionsService {
  /**
   * Get pending outfit suggestions received by the current user
   * 
   * @param {Object} options - Query options
   * @param {number} options.limit - Number of suggestions per page (default: 20)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<Array>} Array of suggestion objects
   */
  async getReceivedSuggestions(options = {}) {
    try {
      const { limit = 20, offset = 0 } = options

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('FriendSuggestionsService: Fetching received suggestions for user:', user.id)

      // Get suggestions with suggester details
      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .select(`
          id,
          outfit_items,
          message,
          status,
          created_at,
          suggester:users!friend_outfit_suggestions_suggester_id_fkey (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('FriendSuggestionsService: Error fetching suggestions:', error)
        throw error
      }

      // Enrich outfit items with clothing details if missing image_url
      const enrichedData = await Promise.all((data || []).map(async (suggestion) => {
        if (!suggestion.outfit_items || !Array.isArray(suggestion.outfit_items)) {
          return suggestion
        }

        // Check if any items are missing image_url or name
        const needsEnrichment = suggestion.outfit_items.some(item => !item.image_url || !item.name)
        
        if (needsEnrichment) {
          // Fetch clothing items details for items missing data
          const clothesIds = suggestion.outfit_items
            .filter(item => !item.image_url || !item.name)
            .map(item => item.clothes_id || item.clothing_item_id)
            .filter(Boolean)

          if (clothesIds.length > 0) {
            console.log('FriendSuggestionsService: Enriching items with clothing details:', clothesIds)
            
            const { data: clothesData } = await supabase
              .from('clothes')
              .select('id, name, category, image_url')
              .in('id', clothesIds)

            // Create a map of clothing item details
            const clothesMap = new Map((clothesData || []).map(item => [item.id, item]))

            // Enrich outfit items with clothing details
            suggestion.outfit_items = suggestion.outfit_items.map(item => {
              const clothesId = item.clothes_id || item.clothing_item_id
              const clothesDetails = clothesMap.get(clothesId)
              
              if (clothesDetails) {
                return {
                  ...item,
                  name: item.name || clothesDetails.name,
                  category: item.category || clothesDetails.category,
                  image_url: item.image_url || clothesDetails.image_url,
                  clothes_id: clothesId
                }
              }
              return item
            })
          }
        }

        return suggestion
      }))

      console.log('FriendSuggestionsService: Fetched', enrichedData?.length || 0, 'suggestions')
      return enrichedData || []

    } catch (error) {
      console.error('FriendSuggestionsService: Error in getReceivedSuggestions:', error)
      throw error
    }
  }

  /**
   * Get a specific suggestion by ID
   * 
   * @param {string} suggestionId - UUID of the suggestion
   * @returns {Promise<Object>} Suggestion object with details
   */
  async getSuggestion(suggestionId) {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('FriendSuggestionsService: Fetching suggestion:', suggestionId)

      // Get suggestion with suggester details
      const { data, error } = await supabase
        .from('friend_outfit_suggestions')
        .select(`
          id,
          outfit_items,
          message,
          status,
          created_at,
          suggester:users!friend_outfit_suggestions_suggester_id_fkey (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('id', suggestionId)
        .eq('owner_id', user.id)
        .single()

      if (error) {
        console.error('FriendSuggestionsService: Error fetching suggestion:', error)
        throw error
      }

      console.log('FriendSuggestionsService: Fetched suggestion:', data)
      return data

    } catch (error) {
      console.error('FriendSuggestionsService: Error in getSuggestion:', error)
      throw error
    }
  }

  /**
   * Approve a friend outfit suggestion
   * 
   * @param {string} suggestionId - UUID of the suggestion to approve
   * @returns {Promise<Object>} Result with success status and outfit ID
   */
  async approveSuggestion(suggestionId) {
    try {
      console.log('FriendSuggestionsService: Approving suggestion:', suggestionId)

      // Call the database function to approve the suggestion
      const { data, error } = await supabase
        .rpc('approve_friend_outfit_suggestion', {
          p_suggestion_id: suggestionId
        })

      if (error) {
        console.error('FriendSuggestionsService: Error approving suggestion:', error)
        throw error
      }

      console.log('FriendSuggestionsService: Suggestion approved, outfit ID:', data)
      return { success: true, outfit_id: data }

    } catch (error) {
      console.error('FriendSuggestionsService: Error in approveSuggestion:', error)
      return { success: false, error }
    }
  }

  /**
   * Reject a friend outfit suggestion
   * 
   * @param {string} suggestionId - UUID of the suggestion to reject
   * @returns {Promise<Object>} Result with success status
   */
  async rejectSuggestion(suggestionId) {
    try {
      console.log('FriendSuggestionsService: Rejecting suggestion:', suggestionId)

      // Call the database function to reject the suggestion
      const { data, error } = await supabase
        .rpc('reject_friend_outfit_suggestion', {
          p_suggestion_id: suggestionId
        })

      if (error) {
        console.error('FriendSuggestionsService: Error rejecting suggestion:', error)
        throw error
      }

      console.log('FriendSuggestionsService: Suggestion rejected')
      return { success: true }

    } catch (error) {
      console.error('FriendSuggestionsService: Error in rejectSuggestion:', error)
      return { success: false, error }
    }
  }

  /**
   * Get suggestion statistics for the current user
   * 
   * @returns {Promise<Object>} Statistics object
   */
  async getSuggestionStats() {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      console.log('FriendSuggestionsService: Fetching suggestion stats for user:', user.id)

      // Get counts for different suggestion statuses
      const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
        supabase
          .from('friend_outfit_suggestions')
          .select('id', { count: 'exact' })
          .eq('owner_id', user.id)
          .eq('status', 'pending'),
        supabase
          .from('friend_outfit_suggestions')
          .select('id', { count: 'exact' })
          .eq('owner_id', user.id)
          .eq('status', 'approved'),
        supabase
          .from('friend_outfit_suggestions')
          .select('id', { count: 'exact' })
          .eq('owner_id', user.id)
          .eq('status', 'rejected')
      ])

      const stats = {
        pending: pendingResult.count || 0,
        approved: approvedResult.count || 0,
        rejected: rejectedResult.count || 0,
        total: (pendingResult.count || 0) + (approvedResult.count || 0) + (rejectedResult.count || 0)
      }

      console.log('FriendSuggestionsService: Suggestion stats:', stats)
      return stats

    } catch (error) {
      console.error('FriendSuggestionsService: Error in getSuggestionStats:', error)
      throw error
    }
  }
}

export const friendSuggestionsService = new FriendSuggestionsService()

