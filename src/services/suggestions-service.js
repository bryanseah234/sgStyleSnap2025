/**
 * Suggestions Service - StyleSnap
 * 
 * Purpose: API calls for outfit suggestion management
 * 
 * Functions:
 * - getReceivedSuggestions(): Fetches suggestions sent TO current user
 *   - Filters: target_user_id = current_user_id
 *   - Returns: Array of suggestion objects (with creator details)
 * 
 * - getSentSuggestions(): Fetches suggestions sent BY current user
 *   - Filters: creator_id = current_user_id
 *   - Returns: Array of suggestion objects (with recipient details)
 * 
 * - getSuggestion(id): Fetches single suggestion by ID
 *   - Returns: Full suggestion object with items_data JSON
 * 
 * - createSuggestion(suggestionData): Creates new outfit suggestion
 *   - suggestionData: {
 *       target_user_id: UUID,
 *       items_data: JSON (array of items with positions/coordinates)
 *     }
 *   - items_data format: [
 *       { item_id: UUID, x: number, y: number, z_index: number },
 *       ...
 *     ]
 *   - Returns: Created suggestion object
 * 
 * - deleteSuggestion(id): Deletes a sent suggestion
 *   - Only creator can delete their own suggestions
 *   - Returns: Success response
 * 
 * - markAsViewed(id): Updates suggestion status to 'viewed'
 *   - Only target user can mark as viewed
 *   - Returns: Updated suggestion object
 * 
 * - likeSuggestion(id): Updates suggestion status to 'liked' (optional feature)
 *   - Only target user can like
 *   - Returns: Updated suggestion object
 * 
 * API Endpoints:
 * - GET /api/suggestions/received - Get received suggestions
 * - GET /api/suggestions/sent - Get sent suggestions
 * - GET /api/suggestions/:id - Get suggestion details
 * - POST /api/suggestions - Create suggestion
 * - DELETE /api/suggestions/:id - Delete suggestion
 * - PUT /api/suggestions/:id/view - Mark as viewed
 * - PUT /api/suggestions/:id/like - Like suggestion
 * 
 * Suggestion Table Structure:
 * - id: UUID
 * - creator_id: UUID (who created the suggestion)
 * - target_user_id: UUID (who it's for)
 * - items_data: JSONB (item positions and arrangement)
 * - status: 'new' | 'viewed' | 'liked'
 * - created_at: timestamp
 * 
 * Reference:
 * - requirements/api-endpoints.md for endpoint specifications
 * - requirements/database-schema.md for outfit_suggestions table
 * - tasks/05-suggestion-system.md for suggestion features
 * - components/social/SuggestionCanvas.vue for items_data format
 */

import { supabase } from '../config/supabase'

/**
 * Get suggestions received by current user
 * @param {Object} filters - Optional filters { unread_only }
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getReceivedSuggestions(filters = {}) {
  try {
    let query = supabase
      .from('suggestions')
      .select(`
        id,
        from_user_id,
        to_user_id,
        suggested_item_ids,
        message,
        is_read,
        viewed_at,
        created_at,
        from_user:users!suggestions_from_user_id_fkey(id, name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
    
    // Apply unread filter if requested
    if (filters.unread_only) {
      query = query.eq('is_read', false)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    // For each suggestion, fetch the actual item details
    const suggestionsWithItems = await Promise.all(
      (data || []).map(async (suggestion) => {
        // Fetch items for this suggestion
        const { data: items } = await supabase
          .from('clothes')
          .select('*')
          .in('id', suggestion.suggested_item_ids)
        
        return {
          ...suggestion,
          items: items || [],
          itemsCount: suggestion.suggested_item_ids.length
        }
      })
    )
    
    return suggestionsWithItems
  } catch (error) {
    console.error('Failed to fetch received suggestions:', error)
    throw new Error(`Failed to fetch received suggestions: ${error.message}`)
  }
}

/**
 * Get suggestions sent by current user
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getSentSuggestions() {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        id,
        from_user_id,
        to_user_id,
        suggested_item_ids,
        message,
        is_read,
        viewed_at,
        created_at,
        to_user:users!suggestions_to_user_id_fkey(id, name, email, avatar_url)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // Fetch item details for each suggestion
    const suggestionsWithItems = await Promise.all(
      (data || []).map(async (suggestion) => {
        const { data: items } = await supabase
          .from('clothes')
          .select('*')
          .in('id', suggestion.suggested_item_ids)
        
        return {
          ...suggestion,
          items: items || [],
          itemsCount: suggestion.suggested_item_ids.length
        }
      })
    )
    
    return suggestionsWithItems
  } catch (error) {
    console.error('Failed to fetch sent suggestions:', error)
    throw new Error(`Failed to fetch sent suggestions: ${error.message}`)
  }
}

/**
 * Get single suggestion by ID
 * @param {string} id - Suggestion ID
 * @returns {Promise<Object>} Suggestion object
 */
export async function getSuggestion(id) {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        id,
        from_user_id,
        to_user_id,
        suggested_item_ids,
        message,
        is_read,
        viewed_at,
        created_at,
        from_user:users!suggestions_from_user_id_fkey(id, name, email, avatar_url),
        to_user:users!suggestions_to_user_id_fkey(id, name, email, avatar_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Fetch items
    const { data: items } = await supabase
      .from('clothes')
      .select('*')
      .in('id', data.suggested_item_ids)
    
    return {
      ...data,
      items: items || []
    }
  } catch (error) {
    console.error('Failed to fetch suggestion:', error)
    throw new Error(`Failed to fetch suggestion: ${error.message}`)
  }
}

/**
 * Create new suggestion
 * @param {Object} suggestionData - { to_user_id, suggested_item_ids, message }
 * @returns {Promise<Object>} Created suggestion
 */
export async function createSuggestion(suggestionData) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Validate item count (1-10 items)
    if (!suggestionData.suggested_item_ids || suggestionData.suggested_item_ids.length === 0) {
      throw new Error('At least one item is required')
    }
    if (suggestionData.suggested_item_ids.length > 10) {
      throw new Error('Maximum 10 items per suggestion')
    }
    
    // Validate message length (max 100 chars)
    if (suggestionData.message && suggestionData.message.length > 100) {
      throw new Error('Message must be 100 characters or less')
    }
    
    // Verify friendship exists
    const requesterId = user.id < suggestionData.to_user_id ? user.id : suggestionData.to_user_id
    const receiverId = user.id < suggestionData.to_user_id ? suggestionData.to_user_id : user.id
    
    const { data: friendship } = await supabase
      .from('friends')
      .select('status')
      .eq('requester_id', requesterId)
      .eq('receiver_id', receiverId)
      .eq('status', 'accepted')
      .single()
    
    if (!friendship) {
      throw new Error('You can only send suggestions to friends')
    }
    
    // Verify all items belong to the target user and have friends privacy
    const { data: items, error: itemsError } = await supabase
      .from('clothes')
      .select('id, owner_id, privacy')
      .in('id', suggestionData.suggested_item_ids)
    
    if (itemsError) throw itemsError
    
    if (!items || items.length !== suggestionData.suggested_item_ids.length) {
      throw new Error('Some items were not found')
    }
    
    const invalidItems = items.filter(
      item => item.owner_id !== suggestionData.to_user_id || item.privacy !== 'friends'
    )
    
    if (invalidItems.length > 0) {
      throw new Error('All items must belong to the target user and have friends privacy')
    }
    
    // Create suggestion
    const { data, error } = await supabase
      .from('suggestions')
      .insert({
        from_user_id: user.id,
        to_user_id: suggestionData.to_user_id,
        suggested_item_ids: suggestionData.suggested_item_ids,
        message: suggestionData.message || null,
        is_read: false
      })
      .select()
      .single()
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Failed to create suggestion:', error)
    throw new Error(`Failed to create suggestion: ${error.message}`)
  }
}

/**
 * Delete suggestion
 * @param {string} id - Suggestion ID
 * @returns {Promise<void>}
 */
export async function deleteSuggestion(id) {
  try {
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  } catch (error) {
    console.error('Failed to delete suggestion:', error)
    throw new Error(`Failed to delete suggestion: ${error.message}`)
  }
}

/**
 * Mark suggestion as read
 * @param {string} id - Suggestion ID
 * @returns {Promise<Object>} Updated suggestion
 */
export async function markAsRead(id) {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .update({
        is_read: true,
        viewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Failed to mark suggestion as read:', error)
    throw new Error(`Failed to mark suggestion as read: ${error.message}`)
  }
}

/**
 * Get unread count
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount() {
  try {
    const { count, error } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)
    
    if (error) throw error
    
    return count || 0
  } catch (error) {
    console.error('Failed to get unread count:', error)
    return 0
  }
}
