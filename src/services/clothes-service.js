/**
 * Clothes Service - StyleSnap
 * 
 * Purpose: API calls for closet items CRUD operations
 * 
 * Functions:
 * - getItems(filters): Fetches all user's items with optional filters
 *   - filters: { category?, clothing_type?, search?, sort? }
 *   - Returns: Array of closet items
 * 
 * - getItem(id): Fetches single item by ID
 *   - Returns: Item object
 * 
 * - createItem(itemData): Creates new closet item
 *   - itemData: { name, category, color?, brand?, season?, image_url }
 *   - Must upload image to Cloudinary FIRST, then pass image_url
 *   - Returns: Created item object
 * 
 * - updateItem(id, itemData): Updates existing item
 *   - itemData: Partial item object with fields to update
 *   - Returns: Updated item object
 * 
 * - deleteItem(id): Deletes item
 *   - Also should trigger Cloudinary image deletion
 *   - Returns: Success response
 * 
 * - uploadImage(file): Uploads image to Cloudinary
 *   - Compress image first using utils/image-compression.js
 *   - Upload to Cloudinary with unsigned upload preset
 *   - Returns: Cloudinary URL
 * 
 * - deleteImage(publicId): Deletes image from Cloudinary
 *   - Extract public ID from Cloudinary URL
 *   - Call Cloudinary delete API
 *   - Returns: Success response
 * 
 * API Endpoints:
 * - GET /api/closet - List items
 * - GET /api/closet/:id - Get item
 * - POST /api/closet - Create item
 * - PUT /api/closet/:id - Update item
 * - DELETE /api/closet/:id - Delete item
 * 
 * Note: All endpoints use Supabase RLS policies to ensure users only access their own items
 * 
 * Environment Variables Required:
 * - VITE_CLOUDINARY_CLOUD_NAME: Cloudinary cloud name
 * - VITE_CLOUDINARY_UPLOAD_PRESET: Unsigned upload preset
 * 
 * Reference:
 * - requirements/api-endpoints.md for endpoint specifications
 * - requirements/database-schema.md for closet_items schema
 * - tasks/03-closet-crud-image-management.md for implementation details
 * - utils/image-compression.js for image compression
 */

import { supabase } from './auth-service'
import { compressImage } from '../utils/image-compression'

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Cloudinary URL
 */
export async function uploadImage(file) {
  try {
    // Compress image first
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
    
    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    )
    
    if (!response.ok) {
      throw new Error('Failed to upload image to Cloudinary')
    }
    
    const data = await response.json()
    return data.secure_url
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
function extractPublicId(url) {
  // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  const publicId = filename.split('.')[0]
  return publicId
}

/**
 * Get all items for current user
 * @param {Object} filters - Optional filters { category, search, sort }
 * @returns {Promise<Array>} Array of items
 */
export async function getItems(filters = {}) {
  try {
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
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
      brand: itemData.brand || null
    }
    
    const { data, error } = await supabase
      .from('clothes')
      .insert(item)
      .select()
      .single()
    
    if (error) {
      // Check for quota error
      if (error.code === '23514' || error.message.includes('quota')) {
        throw new Error('You have reached your 200 item limit. Please remove some items to add new ones.')
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
    // Soft delete by setting removed_at
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
