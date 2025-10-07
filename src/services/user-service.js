/**
 * User Service
 * 
 * Handles user profile management operations:
 * - Profile retrieval
 * - Avatar updates (default avatars)
 * - Future: Custom avatar uploads
 * 
 * Profile Fields:
 * - username: Auto-generated from email (part before @), immutable
 * - name: From Google OAuth (first + last name), immutable
 * - email: From Google OAuth, immutable
 * - avatar_url: Can be changed by user (6 default options)
 */

import { supabase } from './api.js';

/**
 * Get current user's profile
 * @returns {Promise<Object>} User profile with id, email, username, name, avatar_url
 */
export async function getUserProfile() {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');
    
    // Get user profile from users table
    const { data, error } = await supabase
      .from('users')
      .select('id, email, username, name, avatar_url, created_at')
      .eq('id', user.id)
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Failed to get user profile:', error);
    throw error;
  }
}

/**
 * Update user's profile photo
 * @param {string} avatarUrl - Path to default avatar (e.g., /avatars/default-1.png)
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateUserAvatar(avatarUrl) {
  try {
    // Validate avatar URL format
    const defaultAvatarPattern = /^\/avatars\/default-[1-6]\.png$/;
    
    if (!defaultAvatarPattern.test(avatarUrl)) {
      throw new Error('Invalid avatar URL. Please select from default avatars (default-1.png through default-6.png)');
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    if (!user) throw new Error('Not authenticated');
    
    // Update avatar in users table
    const { data, error } = await supabase
      .from('users')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select('id, email, username, name, avatar_url')
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Failed to update avatar:', error);
    throw error;
  }
}

/**
 * Get list of available default avatars
 * @returns {Array<Object>} Array of avatar objects with id and url
 */
export function getDefaultAvatars() {
  return [
    { id: 1, url: '/avatars/default-1.png', alt: 'Avatar 1' },
    { id: 2, url: '/avatars/default-2.png', alt: 'Avatar 2' },
    { id: 3, url: '/avatars/default-3.png', alt: 'Avatar 3' },
    { id: 4, url: '/avatars/default-4.png', alt: 'Avatar 4' },
    { id: 5, url: '/avatars/default-5.png', alt: 'Avatar 5' },
    { id: 6, url: '/avatars/default-6.png', alt: 'Avatar 6' }
  ];
}

/**
 * Future: Upload custom avatar to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<Object>} Updated user profile with new avatar URL
 */
export async function uploadCustomAvatar(file) {
  // TODO: Implement custom avatar upload
  // 1. Validate file type (image/jpeg, image/png)
  // 2. Validate file size (max 2MB)
  // 3. Upload to Cloudinary /avatars/ folder
  // 4. Get Cloudinary URL
  // 5. Update users.avatar_url with Cloudinary URL
  // 6. Return updated user profile
  
  throw new Error('Custom avatar upload not yet implemented');
}
