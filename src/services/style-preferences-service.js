/**
 * Style Preferences Service
 * Manages user style preferences
 */

import { supabase } from '../config/supabase'

export default {
  /**
   * Get user's style preferences
   * @returns {Promise<Object|null>} Style preferences
   */
  async getPreferences() {
    const { data, error } = await supabase.from('style_preferences').select('*').single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows
      throw error
    }

    return data || null
  },

  /**
   * Update style preferences
   * @param {Object} preferences - Preferences to update
   * @returns {Promise<Object>} Updated preferences
   */
  async updatePreferences(preferences) {
    const { data: user } = await supabase.auth.getUser()

    const { data: existing } = await supabase
      .from('style_preferences')
      .select('user_id')
      .eq('user_id', user.user.id)
      .single()

    let data, error

    if (existing) {
      // Update existing
      ({ data, error } = await supabase
        .from('style_preferences')
        .update(preferences)
        .eq('user_id', user.user.id)
        .select()
        .single())
    } else {
      // Create new
      ({ data, error } = await supabase
        .from('style_preferences')
        .insert([
          {
            user_id: user.user.id,
            ...preferences
          }
        ])
        .select()
        .single())
    }

    if (error) throw error
    return data
  },

  /**
   * Submit feedback on a suggestion
   * @param {string} suggestionId - Suggestion ID
   * @param {string} feedbackType - 'like', 'dislike', or 'love'
   * @param {string} reason - Optional reason
   * @returns {Promise<Object>} Feedback record
   */
  async submitFeedback(suggestionId, feedbackType, reason = null) {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('suggestion_feedback')
      .upsert(
        [
          {
            user_id: user.user.id,
            suggestion_id: suggestionId,
            feedback_type: feedbackType,
            feedback_reason: reason
          }
        ],
        {
          onConflict: 'user_id,suggestion_id'
        }
      )
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Get feedback for a suggestion
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<Object|null>} Feedback
   */
  async getFeedback(suggestionId) {
    const { data: user } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('suggestion_feedback')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('suggestion_id', suggestionId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null
  },

  /**
   * Get all user's feedback
   * @returns {Promise<Array>} All feedback
   */
  async getAllFeedback() {
    const { data, error } = await supabase
      .from('suggestion_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Delete feedback
   * @param {string} suggestionId - Suggestion ID
   * @returns {Promise<void>}
   */
  async deleteFeedback(suggestionId) {
    const { data: user } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('suggestion_feedback')
      .delete()
      .eq('user_id', user.user.id)
      .eq('suggestion_id', suggestionId)

    if (error) throw error
  }
}
