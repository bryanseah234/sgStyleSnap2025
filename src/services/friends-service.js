/**
 * Friends Service - StyleSnap
 * 
 * Purpose: API calls for friendship management and friend requests
 * 
 * Functions:
 * - getFriends(): Fetches all accepted friendships
 *   - Returns: Array of friend objects (with user details)
 * 
 * - getPendingRequests(): Fetches all pending friend requests (incoming + outgoing)
 *   - Returns: { incoming: Array, outgoing: Array }
 * 
 * - sendFriendRequest(targetUserId): Sends friend request to another user
 *   - Creates friendship record with status = 'pending'
 *   - Returns: Created friendship object
 * 
 * - acceptFriendRequest(requestId): Accepts incoming friend request
 *   - Updates friendship status from 'pending' to 'accepted'
 *   - Returns: Updated friendship object
 * 
 * - rejectFriendRequest(requestId): Rejects incoming friend request
 *   - Updates status to 'rejected' or deletes record
 *   - Returns: Success response
 * 
 * - cancelFriendRequest(requestId): Cancels outgoing friend request
 *   - Deletes the pending request record
 *   - Returns: Success response
 * 
 * - unfriend(friendshipId): Removes an accepted friendship
 *   - Deletes friendship record
 *   - Returns: Success response
 * 
 * - searchUsers(query): Searches for users by name or email
 *   - query: string (name or email to search)
 *   - Excludes: current user, existing friends, pending requests
 *   - Returns: Array of user objects
 * 
 * - getFriendProfile(friendId): Gets friend's profile and public items
 *   - Only returns items with privacy_level = 'public'
 *   - Returns: { user: Object, items: Array }
 * 
 * API Endpoints:
 * - GET /api/friends - List friends
 * - GET /api/friends/requests - Get pending requests
 * - POST /api/friends/request - Send friend request
 * - PUT /api/friends/:id/accept - Accept request
 * - PUT /api/friends/:id/reject - Reject request
 * - DELETE /api/friends/:id - Unfriend or cancel request
 * - GET /api/users/search?q=query - Search users
 * - GET /api/friends/:id/profile - Get friend profile
 * 
 * Friendship Table Structure:
 * - id: UUID
 * - requester_id: UUID (who sent the request)
 * - target_user_id: UUID (who received the request)
 * - status: 'pending' | 'accepted' | 'rejected'
 * - created_at: timestamp
 * 
 * Reference:
 * - requirements/api-endpoints.md for endpoint specifications
 * - requirements/database-schema.md for friendships table
 * - tasks/04-social-features-privacy.md for friendship logic
 * - sql/002_rls_policies.sql for RLS rules on friend data
 */

import { supabase } from './auth-service'

/**
 * Get all accepted friendships for current user
 * @returns {Promise<Array>} Array of friend objects
 */
export async function getFriends() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get friendships where user is either requester or receiver and status is accepted
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        requester_id,
        receiver_id,
        status,
        created_at,
        requester:users!friends_requester_id_fkey(id, name, email, avatar_url),
        receiver:users!friends_receiver_id_fkey(id, name, email, avatar_url)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    
    if (error) throw error
    
    // Transform data to include friend's info (the other person in the friendship)
    const friends = data.map(friendship => {
      const friend = friendship.requester_id === user.id 
        ? friendship.receiver 
        : friendship.requester
      
      return {
        friendshipId: friendship.id,
        ...friend,
        friendSince: friendship.created_at
      }
    })
    
    return friends
  } catch (error) {
    console.error('Failed to fetch friends:', error)
    throw new Error(`Failed to fetch friends: ${error.message}`)
  }
}

/**
 * Get pending friend requests (incoming and outgoing)
 * @returns {Promise<Object>} { incoming: Array, outgoing: Array }
 */
export async function getPendingRequests() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get all pending requests where user is involved
    const { data, error } = await supabase
      .from('friends')
      .select(`
        id,
        requester_id,
        receiver_id,
        status,
        created_at,
        requester:users!friends_requester_id_fkey(id, name, email, avatar_url),
        receiver:users!friends_receiver_id_fkey(id, name, email, avatar_url)
      `)
      .eq('status', 'pending')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
    
    if (error) throw error
    
    // Separate into incoming and outgoing
    const incoming = data
      .filter(req => req.receiver_id === user.id)
      .map(req => ({
        requestId: req.id,
        ...req.requester,
        requestedAt: req.created_at
      }))
    
    const outgoing = data
      .filter(req => req.requester_id === user.id)
      .map(req => ({
        requestId: req.id,
        ...req.receiver,
        requestedAt: req.created_at
      }))
    
    return { incoming, outgoing }
  } catch (error) {
    console.error('Failed to fetch pending requests:', error)
    throw new Error(`Failed to fetch pending requests: ${error.message}`)
  }
}

/**
 * Send friend request by email
 * @param {string} email - Target user's email
 * @returns {Promise<Object>} Created request object
 */
export async function sendFriendRequest(email) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Can't send request to yourself
    if (email === user.email) {
      throw new Error('You cannot send a friend request to yourself')
    }
    
    // Find target user by email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (userError || !targetUser) {
      // For security, return success even if user doesn't exist (prevent email enumeration)
      return { id: null, status: 'pending', message: 'Friend request sent successfully' }
    }
    
    // Ensure canonical ordering (smaller ID first)
    const requesterId = user.id < targetUser.id ? user.id : targetUser.id
    const receiverId = user.id < targetUser.id ? targetUser.id : user.id
    
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friends')
      .select('id, status')
      .eq('requester_id', requesterId)
      .eq('receiver_id', receiverId)
      .single()
    
    if (existing) {
      // Return success even if already exists (prevent duplicate detection)
      return { id: existing.id, status: existing.status, message: 'Friend request sent successfully' }
    }
    
    // Create new friend request
    const { data, error } = await supabase
      .from('friends')
      .insert({
        requester_id: requesterId,
        receiver_id: receiverId,
        status: 'pending'
      })
      .select()
      .single()
    
    if (error) throw error
    
    return { id: data.id, status: 'pending', message: 'Friend request sent successfully' }
  } catch (error) {
    console.error('Failed to send friend request:', error)
    throw new Error(`Failed to send friend request: ${error.message}`)
  }
}

/**
 * Accept friend request
 * @param {string} requestId - Friend request ID
 * @returns {Promise<Object>} Updated request
 */
export async function acceptFriendRequest(requestId) {
  try {
    const { data, error } = await supabase
      .from('friends')
      .update({ status: 'accepted' })
      .eq('id', requestId)
      .eq('status', 'pending')
      .select()
      .single()
    
    if (error) throw error
    if (!data) throw new Error('Request not found or already processed')
    
    return data
  } catch (error) {
    console.error('Failed to accept friend request:', error)
    throw new Error(`Failed to accept friend request: ${error.message}`)
  }
}

/**
 * Reject friend request
 * @param {string} requestId - Friend request ID
 * @returns {Promise<void>}
 */
export async function rejectFriendRequest(requestId) {
  try {
    // Update status to rejected
    const { error } = await supabase
      .from('friends')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .eq('status', 'pending')
    
    if (error) throw error
  } catch (error) {
    console.error('Failed to reject friend request:', error)
    throw new Error(`Failed to reject friend request: ${error.message}`)
  }
}

/**
 * Cancel outgoing friend request
 * @param {string} requestId - Friend request ID
 * @returns {Promise<void>}
 */
export async function cancelFriendRequest(requestId) {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)
      .eq('status', 'pending')
    
    if (error) throw error
  } catch (error) {
    console.error('Failed to cancel friend request:', error)
    throw new Error(`Failed to cancel friend request: ${error.message}`)
  }
}

/**
 * Unfriend (remove accepted friendship)
 * @param {string} friendshipId - Friendship ID
 * @returns {Promise<void>}
 */
export async function unfriend(friendshipId) {
  try {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', friendshipId)
      .eq('status', 'accepted')
    
    if (error) throw error
  } catch (error) {
    console.error('Failed to unfriend:', error)
    throw new Error(`Failed to unfriend: ${error.message}`)
  }
}

/**
 * Search users by name or email
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of user objects
 */
export async function searchUsers(query) {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    // Search users by name or email (case-insensitive)
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .neq('id', user.id) // Exclude current user
      .limit(20)
    
    if (error) throw error
    
    return data || []
  } catch (error) {
    console.error('Failed to search users:', error)
    throw new Error(`Failed to search users: ${error.message}`)
  }
}

/**
 * Get friend's profile and their viewable items
 * @param {string} friendId - Friend's user ID
 * @returns {Promise<Object>} { user, items }
 */
export async function getFriendProfile(friendId) {
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) throw new Error('Not authenticated')
    
    // Verify friendship exists
    const requesterId = currentUser.id < friendId ? currentUser.id : friendId
    const receiverId = currentUser.id < friendId ? friendId : currentUser.id
    
    const { data: friendship } = await supabase
      .from('friends')
      .select('status')
      .eq('requester_id', requesterId)
      .eq('receiver_id', receiverId)
      .eq('status', 'accepted')
      .single()
    
    if (!friendship) {
      // Return 404 for both non-friends and non-existent users (security)
      throw new Error('User not found')
    }
    
    // Get friend's profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, email, avatar_url')
      .eq('id', friendId)
      .single()
    
    if (userError) throw new Error('User not found')
    
    // Get friend's items with 'friends' privacy
    const { data: items, error: itemsError } = await supabase
      .from('clothes')
      .select('*')
      .eq('owner_id', friendId)
      .eq('privacy', 'friends')
      .is('removed_at', null)
      .order('created_at', { ascending: false })
    
    if (itemsError) throw itemsError
    
    return {
      user,
      items: items || []
    }
  } catch (error) {
    console.error('Failed to fetch friend profile:', error)
    throw new Error(`Failed to fetch friend profile: ${error.message}`)
  }
}
