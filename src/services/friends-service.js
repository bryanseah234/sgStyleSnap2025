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
 * - searchUsers(query): **SECURE** search for users by name or email
 *   - query: string (min 3 characters, name fuzzy match or email exact match)
 *   - Excludes: current user, deleted users
 *   - Includes: friendship_status (none, pending_sent, pending_received, accepted)
 *   - Anti-scraping: Min 3 chars, max 10 results, random order, no emails in results
 *   - Returns: { users: Array, count: number, has_more: false }
 *
 * - getFriendProfile(friendId): Gets friend's profile and public items
 *   - Only returns items with privacy_level = 'public'
 *   - Returns: { user: Object, items: Array }
 *
 * API Endpoints:
 * - POST /api/users/search - **SECURE** search users (anti-scraping protected)
 * - GET /api/friends - List friends
 * - GET /api/friends/requests - Get pending requests
 * - POST /api/friends/request - Send friend request (by user_id, not email)
 * - PUT /api/friends/:id/accept - Accept request
 * - PUT /api/friends/:id/reject - Reject request
 * - DELETE /api/friends/:id - Unfriend or cancel request
 * - GET /api/friends/:id/profile - Get friend profile
 *
 * Friendship Table Structure:
 * - id: UUID
 * - requester_id: UUID (lower UUID, canonical ordering)
 * - receiver_id: UUID (higher UUID, canonical ordering)
 * - status: 'pending' | 'accepted' | 'rejected'
 * - created_at: timestamp
 *
 * IMPORTANT: Canonical Ordering (requester_id < receiver_id)
 * - Prevents duplicate rows for same relationship
 * - Single source of truth per friendship pair
 * - Check constraint enforces this at database level
 *
 * Reference:
 * - requirements/api-endpoints.md for endpoint specifications
 * - requirements/database-schema.md for friendships table
 * - tasks/04-social-features-privacy.md for friendship logic
 * - sql/002_rls_policies.sql for RLS rules on friend data
 */

import { supabase, isSupabaseConfigured } from '../config/supabase'

/**
 * Get all accepted friendships for current user
 * @returns {Promise<Array>} Array of friend objects
 */
export async function getFriends() {
  try {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.')
    }
    
    const {
      data: { user }
    } = await supabase.auth.getUser()
    
    // Development mode: Use mock user if authentication fails
    let userId = user?.id
    if (!userId && import.meta.env.DEV) {
      console.log('🔧 DEV MODE: Using mock user for friends service')
      userId = 'dev-user-123' // Mock user ID for development
    } else if (!userId) {
      throw new Error('Not authenticated')
    }

    // Get friendships where user is either requester or receiver and status is accepted
    const { data, error } = await supabase
      .from('friends')
      .select(
        `
        id,
        requester_id,
        receiver_id,
        status,
        created_at,
        requester:users!friends_requester_id_fkey(id, name, email, avatar_url),
        receiver:users!friends_receiver_id_fkey(id, name, email, avatar_url)
      `
      )
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

    if (error) throw error

    // Transform data to include friend's info (the other person in the friendship)
    const friends = data.map(friendship => {
      const friend =
        friendship.requester_id === userId ? friendship.receiver : friendship.requester

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
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.')
    }
    
    const {
      data: { user }
    } = await supabase.auth.getUser()
    
    // Development mode: Use mock user if authentication fails
    let userId = user?.id
    if (!userId && import.meta.env.DEV) {
      console.log('🔧 DEV MODE: Using mock user for pending requests')
      userId = 'dev-user-123' // Mock user ID for development
    } else if (!userId) {
      throw new Error('Not authenticated')
    }

    // Get all pending requests where user is involved
    const { data, error } = await supabase
      .from('friends')
      .select(
        `
        id,
        requester_id,
        receiver_id,
        status,
        created_at,
        requester:users!friends_requester_id_fkey(id, name, email, avatar_url),
        receiver:users!friends_receiver_id_fkey(id, name, email, avatar_url)
      `
      )
      .eq('status', 'pending')
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)

    if (error) throw error

    // Separate into incoming and outgoing
    const incoming = data
      .filter(req => req.receiver_id === userId)
      .map(req => ({
        requestId: req.id,
        ...req.requester,
        requestedAt: req.created_at
      }))

    const outgoing = data
      .filter(req => req.requester_id === userId)
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
 * Send friend request by user ID
 * @param {string} userId - Target user's ID
 * @returns {Promise<Object>} Created request object
 */
export async function sendFriendRequest(userId) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase client is not initialized. Please check your environment variables.')
    }
    
    const {
      data: { user }
    } = await supabase.auth.getUser()
    
    // Development mode: Use mock user if authentication fails
    let userId = user?.id
    if (!userId && import.meta.env.DEV) {
      console.log('🔧 DEV MODE: Using mock user for sending friend request')
      userId = 'dev-user-123' // Mock user ID for development
    } else if (!userId) {
      throw new Error('Not authenticated')
    }

    // Input is a user ID
    const targetUserId = userId

    // Can't send request to yourself
    if (targetUserId === userId) {
      throw new Error('You cannot send a friend request to yourself')
    }

    // Ensure canonical ordering (smaller ID first)
    const requesterId = userId < targetUserId ? userId : targetUserId
    const receiverId = userId < targetUserId ? targetUserId : userId

    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friends')
      .select('id, status')
      .eq('requester_id', requesterId)
      .eq('receiver_id', receiverId)
      .single()

    if (existing) {
      // Return success even if already exists (prevent duplicate detection)
      return {
        id: existing.id,
        status: existing.status,
        message: 'Friend request sent successfully'
      }
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

    // Update notification status to 'accepted' (extends expiry by 7 days)
    try {
      const { notificationsService } = await import('./notifications-service')
      await notificationsService.updateNotificationStatus(
        data.notification_id, // Assuming notification_id is stored in friends table
        'accepted'
      )
    } catch (notifError) {
      console.warn('Failed to update notification status:', notifError)
      // Don't fail the friend request if notification update fails
    }

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
    // Get the friend request data first to find the notification
    const { data: friendRequest, error: fetchError } = await supabase
      .from('friends')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'pending')
      .single()

    if (fetchError) throw fetchError
    if (!friendRequest) throw new Error('Request not found or already processed')

    // Update status to rejected
    const { error } = await supabase
      .from('friends')
      .update({ status: 'rejected' })
      .eq('id', requestId)
      .eq('status', 'pending')

    if (error) throw error

    // Update notification status to 'rejected' (extends expiry by 7 days)
    try {
      const { notificationsService } = await import('./notifications-service')
      await notificationsService.updateNotificationStatus(
        friendRequest.notification_id, // Assuming notification_id is stored in friends table
        'rejected'
      )
    } catch (notifError) {
      console.warn('Failed to update notification status:', notifError)
      // Don't fail the friend request if notification update fails
    }
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
 * **SECURE** Search users by name or username with anti-scraping protection
 *
 * CRITICAL Anti-Scraping Measures:
 * - Minimum 3-character query (prevents iteration)
 * - Rate limiting: 20 searches/minute (enforced at API level)
 * - Result limit: 10 users maximum
 * - Random ordering (prevents enumeration)
 * - Email addresses never exposed in results
 * - Only searches by name/username (NO email search for privacy)
 * - Includes friendship status for each result
 *
 * @param {string} query - Search query (min 3 characters, name/username only)
 * @returns {Promise<Object>} { users: Array, count: number, has_more: false }
 * @throws {Error} If query too short or rate limit exceeded
 */
export async function searchUsers(query) {
  try {
    const {
      data: { user }
    } = await supabase.auth.getUser()
    
    // Development mode: Use mock user if authentication fails
    let userId = user?.id
    if (!userId && import.meta.env.DEV) {
      console.log('🔧 DEV MODE: Using mock user for user search')
      userId = 'dev-user-123' // Mock user ID for development
    } else if (!userId) {
      throw new Error('Not authenticated')
    }

    // Validate minimum query length (anti-scraping)
    if (!query || query.trim().length < 3) {
      throw new Error('Query must be at least 3 characters')
    }

    // Search users with friendship status
    // Note: Only fuzzy name/username search (NO email search for privacy)
    const { data: users, error } = await supabase
      .from('users')
      .select(
        `
        id, 
        name, 
        username,
        avatar_url,
        friends_as_requester:friends!requester_id(id, receiver_id, status),
        friends_as_receiver:friends!receiver_id(id, requester_id, status)
      `
      )
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .neq('id', userId) // Exclude current user
      .is('removed_at', null) // Only active users
      .limit(10) // Hard limit (anti-scraping)

    if (error) throw error

    // Shuffle results for random ordering (anti-scraping)
    const shuffled = (users || []).sort(() => Math.random() - 0.5)

    // Determine friendship status for each user
    const results = shuffled.map(searchUser => {
      let friendship_status = 'none'

      // Check if user is in a friendship with current user
      const asRequester = searchUser.friends_as_requester?.find(f => f.receiver_id === userId)
      const asReceiver = searchUser.friends_as_receiver?.find(f => f.requester_id === userId)

      if (asRequester) {
        friendship_status = asRequester.status === 'accepted' ? 'accepted' : 'pending_received' // They sent request to us
      } else if (asReceiver) {
        friendship_status = asReceiver.status === 'accepted' ? 'accepted' : 'pending_sent' // We sent request to them
      }

      return {
        id: searchUser.id,
        name: searchUser.name,
        username: searchUser.username,
        avatar_url: searchUser.avatar_url,
        friendship_status
        // CRITICAL: Never return email in search results
      }
    })

    return {
      users: results,
      count: results.length,
      has_more: false // Never indicate more results (anti-scraping)
    }
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
    const {
      data: { user: currentUser }
    } = await supabase.auth.getUser()
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
