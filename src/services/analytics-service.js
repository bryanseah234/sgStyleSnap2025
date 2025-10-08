/**
 * Analytics Service
 * Provides wardrobe analytics and insights
 */

import { supabase } from '../config/supabase'

export default {
  /**
   * Get most worn items
   * @param {number} limit - Max results
   * @returns {Promise<Array>} Most worn items
   */
  async getMostWornItems(limit = 10) {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .rpc('get_most_worn_items', {
        p_user_id: user.user.id,
        p_limit: limit
      })
    
    if (error) throw error
    return data || []
  },

  /**
   * Get unworn or least worn items
   * @returns {Promise<Array>} Unworn items
   */
  async getUnwornItems() {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .rpc('get_unworn_combinations', {
        p_user_id: user.user.id
      })
    
    if (error) throw error
    return data || []
  },

  /**
   * Get overall wardrobe statistics
   * @returns {Promise<Object>} Statistics
   */
  async getStats() {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .rpc('get_user_outfit_stats', {
        p_user_id: user.user.id
      })
    
    if (error) throw error
    return data[0] || {}
  },

  /**
   * Get wardrobe usage by category
   * @returns {Promise<Object>} Category breakdown
   */
  async getCategoryBreakdown() {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('outfit_items')
    
    if (error) throw error
    
    const categoryCount = {}
    
    data.forEach(outfit => {
      outfit.outfit_items.forEach(item => {
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1
      })
    })
    
    return categoryCount
  },

  /**
   * Get wardrobe usage by occasion
   * @returns {Promise<Object>} Occasion breakdown
   */
  async getOccasionBreakdown() {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('occasion')
    
    if (error) throw error
    
    const occasionCount = {}
    
    data.forEach(entry => {
      if (entry.occasion) {
        occasionCount[entry.occasion] = (occasionCount[entry.occasion] || 0) + 1
      }
    })
    
    return occasionCount
  },

  /**
   * Get rating distribution
   * @returns {Promise<Object>} Rating counts
   */
  async getRatingDistribution() {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('rating')
    
    if (error) throw error
    
    const ratingCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    data.forEach(entry => {
      if (entry.rating) {
        ratingCount[entry.rating] = (ratingCount[entry.rating] || 0) + 1
      }
    })
    
    return ratingCount
  },

  /**
   * Get weather preferences
   * @returns {Promise<Object>} Weather data
   */
  async getWeatherPreferences() {
    const { data, error } = await supabase
      .from('outfit_history')
      .select('weather_temp, weather_condition')
    
    if (error) throw error
    
    const conditionCount = {}
    let totalTemp = 0
    let tempCount = 0
    
    data.forEach(entry => {
      if (entry.weather_condition) {
        conditionCount[entry.weather_condition] = 
          (conditionCount[entry.weather_condition] || 0) + 1
      }
      if (entry.weather_temp) {
        totalTemp += entry.weather_temp
        tempCount++
      }
    })
    
    return {
      avg_temp: tempCount > 0 ? Math.round(totalTemp / tempCount) : null,
      conditions: conditionCount
    }
  }
}
