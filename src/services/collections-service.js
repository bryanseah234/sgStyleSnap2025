/**
 * Collections Service
 * Handles outfit collections/lookbooks
 */

import { supabase } from './auth-service'

export default {
  /**
   * Create a new collection
   * @param {Object} collectionData - Collection details
   * @returns {Promise<Object>} Created collection
   */
  async createCollection(collectionData) {
    const { data: user } = await supabase.auth.getUser()
    
    const { data, error } = await supabase
      .from('outfit_collections')
      .insert([{
        user_id: user.user.id,
        ...collectionData
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Get user's collections
   * @returns {Promise<Array>} Collections
   */
  async getCollections() {
    const { data, error } = await supabase
      .from('outfit_collections')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  /**
   * Get specific collection
   * @param {string} id - Collection ID
   * @returns {Promise<Object>} Collection with outfits
   */
  async getCollection(id) {
    const { data: collection, error: collectionError } = await supabase
      .from('outfit_collections')
      .select('*')
      .eq('id', id)
      .single()
    
    if (collectionError) throw collectionError
    
    const { data: outfits, error: outfitsError } = await supabase
      .from('collection_outfits')
      .select('*')
      .eq('collection_id', id)
      .order('position', { ascending: true })
    
    if (outfitsError) throw outfitsError
    
    return {
      ...collection,
      outfits: outfits || []
    }
  },

  /**
   * Update collection
   * @param {string} id - Collection ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated collection
   */
  async updateCollection(id, updates) {
    const { data, error } = await supabase
      .from('outfit_collections')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Delete collection
   * @param {string} id - Collection ID
   * @returns {Promise<void>}
   */
  async deleteCollection(id) {
    const { error } = await supabase
      .from('outfit_collections')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  /**
   * Add outfit to collection
   * @param {string} collectionId - Collection ID
   * @param {Object} outfitData - Outfit to add
   * @returns {Promise<Object>} Added outfit
   */
  async addOutfitToCollection(collectionId, outfitData) {
    // Get current max position
    const { data: existing } = await supabase
      .from('collection_outfits')
      .select('position')
      .eq('collection_id', collectionId)
      .order('position', { ascending: false })
      .limit(1)
    
    const nextPosition = existing && existing.length > 0 ? existing[0].position + 1 : 0
    
    const { data, error } = await supabase
      .from('collection_outfits')
      .insert([{
        collection_id: collectionId,
        position: nextPosition,
        ...outfitData
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Remove outfit from collection
   * @param {string} outfitId - Outfit ID in collection
   * @returns {Promise<void>}
   */
  async removeOutfitFromCollection(outfitId) {
    const { error } = await supabase
      .from('collection_outfits')
      .delete()
      .eq('id', outfitId)
    
    if (error) throw error
  },

  /**
   * Update outfit in collection
   * @param {string} outfitId - Outfit ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated outfit
   */
  async updateCollectionOutfit(outfitId, updates) {
    const { data, error } = await supabase
      .from('collection_outfits')
      .update(updates)
      .eq('id', outfitId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Reorder outfits in collection
   * @param {string} collectionId - Collection ID
   * @param {Array} outfitIds - Ordered outfit IDs
   * @returns {Promise<void>}
   */
  async reorderOutfits(collectionId, outfitIds) {
    const updates = outfitIds.map((id, index) => ({
      id,
      position: index
    }))
    
    for (const update of updates) {
      const { error } = await supabase
        .from('collection_outfits')
        .update({ position: update.position })
        .eq('id', update.id)
        .eq('collection_id', collectionId)
      
      if (error) throw error
    }
  },

  /**
   * Toggle collection favorite status
   * @param {string} id - Collection ID
   * @returns {Promise<Object>} Updated collection
   */
  async toggleFavorite(id) {
    const { data: collection } = await supabase
      .from('outfit_collections')
      .select('is_favorite')
      .eq('id', id)
      .single()
    
    return this.updateCollection(id, {
      is_favorite: !collection.is_favorite
    })
  }
}
