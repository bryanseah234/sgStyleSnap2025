/**
 * Service for managing clothing items in user's closet.
 * 
 * Purpose: CRUD operations for clothes table
 * 
 * Features:
 * - Upload images to Cloudinary
 * - Create/Read/Update/Delete clothing items
 * - Favorite/unfavorite items (heart toggle)
 * - Filter by category, favorites, clothing type, privacy
 * - Get unique categories from user's closet
 * - Soft delete with 30-day recovery
 * - Quota enforcement (50 uploads max)
 * - Auto-contribute uploads to catalog (anonymous, background)
 * 
 * Auto-Catalog Contribution:
 * - After successful upload, item automatically added to catalog_items
 * - No user prompt or confirmation required
 * - Catalog entry has no owner_id (anonymous)
 * - Happens silently in background
 * 
 * Dependencies:
 * - Supabase client (auth-service.js)
 * - Cloudinary (via upload preset)
 * - Image compression (image-compression.js)
 */

import { supabase } from '../config/supabase'
import { compressImage } from '../utils/image-compression'
import { useAuthStore } from '../stores/auth-store'

/**
 * Upload image to Cloudinary with WebP optimization
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} { url: string, thumbnail_url: string, public_id: string }
 */
export async function uploadImage(file) {
  try {
    // Compress image first (converts to WebP)
    const compressedFile = await compressImage(file)
    
    // Get Cloudinary credentials from environment
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
    
    if (!cloudName || !uploadPreset) {
      throw new Error('Cloudinary credentials not configured. Check .env file.')
    }
    
    // Create form data for upload
    const formData = new FormData()
    formData.append('file', compressedFile)
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'closet-items') // Organize uploads
    // Note: format and quality parameters are not allowed with unsigned uploads
    // These will be applied via URL transformations instead
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary')
    }
    
    const data = await response.json()
    
    // Generate optimized URLs with Cloudinary transformations
    // const baseUrl = data.secure_url
    const publicId = data.public_id
    
    // Full size image URL (WebP, quality optimized)
    const fullImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto:good/${publicId}`
    
    // Thumbnail URL (400x400, WebP, quality optimized)
    const thumbnailUrl = `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto:good,w_400,h_400,c_fill/${publicId}`
    
    return {
      url: fullImageUrl,
      thumbnail_url: thumbnailUrl,
      public_id: publicId
    }
  } catch (error) {
    console.error('Image upload failed:', error)
    throw new Error(`Image upload failed: ${error.message}`)
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} Public ID
 */
// Commented out - not currently used
// function extractPublicId(url) {
//   // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
//   const parts = url.split('/')
//   const filename = parts[parts.length - 1]
//   const publicId = filename.split('.')[0]
//   return publicId
// }

/**
 * Get all items for current user
 * @param {Object} filters - Optional filters { category, search, sort }
 * @returns {Promise<Array>} Array of items
 */
export async function getItems(filters = {}) {
  try {
    // Check if this is a mock user
    const authStore = useAuthStore()
    const user = authStore.user
    const isMockUser = user && user.id === '123e4567-e89b-12d3-a456-426614174000'
    
    if (isMockUser) {
      // For mock users, get items from localStorage
      console.log('🔧 Mock user detected - fetching local items')
      const mockItems = JSON.parse(localStorage.getItem('mock-closet-items') || '[]')
      
      // Apply filters to mock items
      let filteredItems = mockItems
      
      if (filters.category && filters.category !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === filters.category)
      }
      
      if (filters.clothing_type && filters.clothing_type !== 'all') {
        filteredItems = filteredItems.filter(item => item.clothing_type === filters.clothing_type)
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredItems = filteredItems.filter(item => 
          item.name.toLowerCase().includes(searchLower) || 
          (item.brand && item.brand.toLowerCase().includes(searchLower))
        )
      }
      
      // Apply sorting
      if (filters.sort === 'name') {
        filteredItems.sort((a, b) => a.name.localeCompare(b.name))
      } else if (filters.sort === 'newest') {
        filteredItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      } else if (filters.sort === 'oldest') {
        filteredItems.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      }
      
      console.log(`✅ Found ${filteredItems.length} mock items:`, filteredItems)
      
      // Debug: Check if items have required fields
      if (filteredItems.length > 0) {
        const firstItem = filteredItems[0]
        console.log('🔍 First mock item structure:', {
          id: firstItem.id,
          name: firstItem.name,
          category: firstItem.category,
          clothing_type: firstItem.clothing_type,
          image_url: firstItem.image_url,
          thumbnail_url: firstItem.thumbnail_url,
          hasAllRequiredFields: !!(firstItem.id && firstItem.name && firstItem.category)
        })
      }
      
      return filteredItems
    }
    
    let query = supabase
      .from('clothes')
      .select('*')
      .is('removed_at', null) // Only active items
    
    // Apply category filter
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category)
    }
    
    // Apply clothing_type filter
    if (filters.clothing_type && filters.clothing_type !== 'all') {
      query = query.eq('clothing_type', filters.clothing_type)
    }
    
    // Apply favorite filter
    if (filters.is_favorite === true) {
      query = query.eq('is_favorite', true)
    }
    
    // Apply search filter
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`)
    }
    
    // Apply sorting
    switch (filters.sort) {
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'category':
        query = query.order('category', { ascending: true })
        break
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false })
        break
    }
    
    const { data, error } = await query
    
    if (error) {
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Failed to fetch items:', error)
    throw new Error(`Failed to fetch items: ${error.message}`)
  }
}

/**
 * Get single item by ID
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Item object
 */
export async function getItem(id) {
  try {
    const { data, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('id', id)
      .is('removed_at', null)
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to fetch item:', error)
    throw new Error(`Failed to fetch item: ${error.message}`)
  }
}

/**
 * Create new item
 * @param {Object} itemData - Item data
 * @returns {Promise<Object>} Created item
 */
export async function createItem(itemData) {
  try {
    // Get current user from session
    // Get user from auth store (works with both real and mock authentication)
    const authStore = useAuthStore()
    const user = authStore.user
    
    if (!user || !authStore.isAuthenticated) {
      throw new Error('User not authenticated')
    }
    
    // Check if this is a mock user (for development)
    const isMockUser = user.id === '123e4567-e89b-12d3-a456-426614174000'
    
    if (isMockUser) {
      // For mock users, create a local-only item (don't save to database)
      console.log('🔧 Mock user detected - creating local item only')
      const mockItem = {
        id: `mock-item-${Date.now()}`,
        owner_id: user.id,
        name: itemData.name,
        category: itemData.category,
        clothing_type: itemData.clothing_type || 'other', // Add missing field
        image_url: itemData.image_url,
        thumbnail_url: itemData.thumbnail_url || itemData.image_url,
        style_tags: itemData.style_tags || [],
        privacy: itemData.privacy || 'friends',
        size: itemData.size || null,
        brand: itemData.brand || null,
        primary_color: itemData.primary_color || null,
        secondary_colors: itemData.secondary_colors || [],
        is_favorite: false, // Add missing field
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Store in localStorage for mock mode
      const existingItems = JSON.parse(localStorage.getItem('mock-closet-items') || '[]')
      existingItems.push(mockItem)
      localStorage.setItem('mock-closet-items', JSON.stringify(existingItems))
      
      console.log('✅ Mock item created and stored locally')
      return mockItem
    }
    
    // Prepare item data
    const item = {
      owner_id: user.id,
      name: itemData.name,
      category: itemData.category,
      image_url: itemData.image_url,
      thumbnail_url: itemData.thumbnail_url || itemData.image_url,
      style_tags: itemData.style_tags || [],
      privacy: itemData.privacy || 'friends',
      size: itemData.size || null,
      brand: itemData.brand || null,
      primary_color: itemData.primary_color || null,
      secondary_colors: itemData.secondary_colors || []
    }
    
    const { data, error } = await supabase
      .from('clothes')
      .insert(item)
      .select()
      .single()
    
    if (error) {
      // Check for quota error
      if (error.code === '23514' || error.message.includes('quota')) {
        throw new Error('You have reached your 50 upload limit. You can add unlimited items from our catalog!')
      }
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to create item:', error)
    throw new Error(`Failed to create item: ${error.message}`)
  }
}

/**
 * Update existing item
 * @param {string} id - Item ID
 * @param {Object} itemData - Updated fields
 * @returns {Promise<Object>} Updated item
 */
export async function updateItem(id, itemData) {
  try {
    const { data, error } = await supabase
      .from('clothes')
      .update(itemData)
      .eq('id', id)
      .is('removed_at', null)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to update item:', error)
    throw new Error(`Failed to update item: ${error.message}`)
  }
}

/**
 * Delete item (soft delete)
 * @param {string} id - Item ID
 * @returns {Promise<void>}
 */
export async function deleteItem(id) {
  try {
    // Check if this is a mock user
    const authStore = useAuthStore()
    const user = authStore.user
    const isMockUser = user && user.id === '123e4567-e89b-12d3-a456-426614174000'
    
    if (isMockUser) {
      // For mock users, remove item from localStorage
      console.log('🔧 Mock user detected - deleting item from localStorage')
      const mockItems = JSON.parse(localStorage.getItem('mock-closet-items') || '[]')
      const updatedItems = mockItems.filter(item => item.id !== id)
      
      if (updatedItems.length === mockItems.length) {
        throw new Error('Item not found')
      }
      
      localStorage.setItem('mock-closet-items', JSON.stringify(updatedItems))
      console.log('✅ Mock item deleted from localStorage')
      return
    }
    
    // For real users, soft delete by setting removed_at
    const { error } = await supabase
      .from('clothes')
      .update({ removed_at: new Date().toISOString() })
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    // Note: Cloudinary cleanup is handled by maintenance script (scripts/cloudinary-cleanup.js)
    // This runs periodically to delete images of items deleted > 30 days ago
  } catch (error) {
    console.error('Failed to delete item:', error)
    throw new Error(`Failed to delete item: ${error.message}`)
  }
}

/**
 * Toggle favorite status for an item
 * @param {string} id - Item ID
 * @param {boolean} isFavorite - New favorite status
 * @returns {Promise<Object>} Updated item
 */
export async function toggleFavorite(id, isFavorite) {
  try {
    // Check if this is a mock user
    const authStore = useAuthStore()
    const user = authStore.user
    const isMockUser = user && user.id === '123e4567-e89b-12d3-a456-426614174000'
    
    if (isMockUser) {
      // For mock users, update item in localStorage
      console.log('🔧 Mock user detected - toggling favorite in localStorage')
      const mockItems = JSON.parse(localStorage.getItem('mock-closet-items') || '[]')
      const itemIndex = mockItems.findIndex(item => item.id === id)
      
      if (itemIndex === -1) {
        throw new Error('Item not found')
      }
      
      // Update the item
      mockItems[itemIndex].is_favorite = isFavorite
      mockItems[itemIndex].updated_at = new Date().toISOString()
      
      localStorage.setItem('mock-closet-items', JSON.stringify(mockItems))
      console.log('✅ Mock item favorite status updated in localStorage')
      return mockItems[itemIndex]
    }
    
    // For real users, update in database
    const { data, error } = await supabase
      .from('clothes')
      .update({ 
        is_favorite: isFavorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .is('removed_at', null)
      .select()
      .single()
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Failed to toggle favorite:', error)
    throw new Error(`Failed to toggle favorite: ${error.message}`)
  }
}

/**
 * Get detailed information about a specific item with statistics
 * @param {string} id - Item ID
 * @returns {Promise<Object>} Item with statistics
 */
export async function getItemDetails(id) {
  try {
    // Check if this is a mock user
    const authStore = useAuthStore()
    const user = authStore.user
    const isMockUser = user && user.id === '123e4567-e89b-12d3-a456-426614174000'
    
    if (isMockUser) {
      // For mock users, get item from localStorage
      console.log('🔧 Mock user detected - getting item details from localStorage')
      const mockItems = JSON.parse(localStorage.getItem('mock-closet-items') || '[]')
      const item = mockItems.find(item => item.id === id)
      
      if (!item) {
        throw new Error('Item not found')
      }
      
      // Create mock statistics
      const statistics = {
        days_in_closet: Math.floor((Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        is_favorite: item.is_favorite || false,
        times_worn: 0,
        last_worn: null,
        in_outfits: 0,
        times_shared: 0
      }
      
      console.log('✅ Mock item details found:', item.name)
      return { item, statistics }
    }
    
    // For real users, query the database
    const { data: item, error } = await supabase
      .from('clothes')
      .select('*')
      .eq('id', id)
      .is('removed_at', null)
      .single()
    
    if (error) {
      throw error
    }
    
    // Calculate days in closet
    const createdDate = new Date(item.created_at)
    const now = new Date()
    const daysInCloset = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24))
    
    // Get wear count from outfit_history (if table exists)
    let timesWorn = 0
    let lastWorn = null
    try {
      const { count } = await supabase
        .from('outfit_history')
        .select('*', { count: 'exact', head: true })
        .contains('item_ids', [id])
      
      timesWorn = count || 0
      
      // Get last worn date
      if (timesWorn > 0) {
        const { data: lastWornData } = await supabase
          .from('outfit_history')
          .select('worn_date')
          .contains('item_ids', [id])
          .order('worn_date', { ascending: false })
          .limit(1)
          .single()
        
        lastWorn = lastWornData?.worn_date || null
      }
    } catch (err) {
      console.log('outfit_history table not available yet')
    }
    
    // Get outfit count from outfit_generation_history (if table exists)
    let inOutfits = 0
    try {
      const { count } = await supabase
        .from('outfit_generation_history')
        .select('*', { count: 'exact', head: true })
        .contains('item_ids', [id])
      
      inOutfits = count || 0
    } catch (err) {
      console.log('outfit_generation_history table not available yet')
    }
    
    // Get share count from shared_outfits (if table exists)
    let timesShared = 0
    try {
      const { count } = await supabase
        .from('shared_outfits')
        .select('*', { count: 'exact', head: true })
        .contains('item_ids', [id])
      
      timesShared = count || 0
    } catch (err) {
      console.log('shared_outfits table not available yet')
    }
    
    return {
      ...item,
      statistics: {
        days_in_closet: daysInCloset,
        times_worn: timesWorn,
        last_worn: lastWorn,
        in_outfits: inOutfits,
        times_shared: timesShared
      }
    }
  } catch (error) {
    console.error('Failed to get item details:', error)
    throw new Error(`Failed to get item details: ${error.message}`)
  }
}

/**
 * Get unique categories from user's closet
 * @returns {Promise<Array<string>>} Array of category names
 */
export async function getUserCategories() {
  try {
    const { data, error } = await supabase
      .from('clothes')
      .select('category')
      .is('removed_at', null)
    
    if (error) {
      throw error
    }
    
    // Get unique categories
    const categories = [...new Set(data.map(item => item.category))]
    return categories.sort()
  } catch (error) {
    console.error('Failed to get categories:', error)
    throw new Error(`Failed to get categories: ${error.message}`)
  }
}

/**
 * Get item count for current user (for quota checking)
 * @returns {Promise<number>} Item count
 */
export async function getItemCount() {
  try {
    const { count, error } = await supabase
      .from('clothes')
      .select('*', { count: 'exact', head: true })
      .is('removed_at', null)
    
    if (error) {
      throw error
    }
    
    return count || 0
  } catch (error) {
    console.error('Failed to get item count:', error)
    return 0
  }
}

/**
 * Upload item (combines image upload and item creation)
 * @param {Object} itemData - Item data with file
 * @returns {Promise<Object>} Created item
 */
export async function uploadItem(itemData) {
  // Upload image first
  const uploadResult = await uploadImage(itemData.file)
  
  // Create item with image URLs
  return createItem({
    ...itemData,
    image_url: uploadResult.url,
    thumbnail_url: uploadResult.thumbnail_url
  })
}

/**
 * Get user's quota information
 * @returns {Promise<Object>} { used: number, max: number, remaining: number }
 */
export async function getQuota() {
  const used = await getItemCount()
  const max = 50 // From requirements
  
  return {
    used,
    max,
    remaining: max - used,
    percentage: (used / max) * 100,
    isFull: used >= max,
    isNearLimit: used >= (max * 0.9)
  }
}


/**
 * Clear all mock items (for debugging)
 */
export function clearMockItems() {
  localStorage.removeItem('mock-closet-items')
  console.log('🧹 Mock wardrobe cleared!')
}
