import { supabase, handleSupabaseError } from '@/lib/supabase'

export class FriendsService {
  async getFriends(filters = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      let query = supabase
        .from('friends')
        .select(`
          *,
          friend:friends_user_id_fkey (
            id,
            username,
            name,
            avatar_url,
            created_at,
            last_active_at
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      if (filters.orderBy) {
        const [column, direction] = filters.orderBy.startsWith('-') 
          ? [filters.orderBy.slice(1), 'desc'] 
          : [filters.orderBy, 'asc']
        query = query.order(column, { ascending: direction === 'asc' })
      }

      const { data, error } = await query

      if (error) throw error

      return data.map(friendship => ({
        id: friendship.friend.id,
        name: friendship.friend.name,
        username: friendship.friend.username,
        avatar_url: friendship.friend.avatar_url,
        created_at: friendship.friend.created_at,
        last_active_at: friendship.friend.last_active_at,
        friendship_created_at: friendship.created_at
      }))
    } catch (error) {
      handleSupabaseError(error, 'get friends')
    }
  }

  async getFriend(friendId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          friend:friends_user_id_fkey (
            id,
            username,
            name,
            avatar_url,
            created_at,
            last_active_at,
            bio,
            location
          )
        `)
        .eq('user_id', user.id)
        .eq('friend_id', friendId)
        .eq('status', 'accepted')
        .single()

      if (error) throw error

      return {
        id: data.friend.id,
        name: data.friend.name,
        username: data.friend.username,
        avatar_url: data.friend.avatar_url,
        created_at: data.friend.created_at,
        last_active_at: data.friend.last_active_at,
        bio: data.friend.bio,
        location: data.friend.location
      }
    } catch (error) {
      handleSupabaseError(error, 'get friend')
    }
  }

  async searchUsers(query) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .or(`username.ilike.%${query}%,name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('removed_at', null)
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'search users')
    }
  }

  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .eq('removed_at', null)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'get user')
    }
  }

  async sendFriendRequest(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('friend_requests')
        .select('id, status')
        .or(`and(user_id.eq.${user.id},friend_id.eq.${userId}),and(user_id.eq.${userId},friend_id.eq.${user.id})`)
        .single()

      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          throw new Error('Friend request already sent')
        } else if (existingRequest.status === 'accepted') {
          throw new Error('Already friends')
        }
      }

      const { data, error } = await supabase
        .from('friend_requests')
        .insert({
          user_id: user.id,
          friend_id: userId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Create notification for the friend
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'friend_request',
          title: 'New Friend Request',
          message: `You have a new friend request`,
          data: {
            requester_id: user.id,
            request_id: data.id
          }
        })

      return data
    } catch (error) {
      handleSupabaseError(error, 'send friend request')
    }
  }

  async getFriendRequests() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friend_requests')
        .select(`
          *,
          requester:friend_requests_user_id_fkey (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get friend requests')
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get the request details
      const { data: request, error: requestError } = await supabase
        .from('friend_requests')
        .select('*')
        .eq('id', requestId)
        .eq('friend_id', user.id)
        .eq('status', 'pending')
        .single()

      if (requestError || !request) throw new Error('Friend request not found')

      // Update request status
      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      if (updateError) throw updateError

      // Create friendship records (bidirectional)
      const { error: friendshipError } = await supabase
        .from('friends')
        .insert([
          {
            user_id: user.id,
            friend_id: request.user_id,
            status: 'accepted'
          },
          {
            user_id: request.user_id,
            friend_id: user.id,
            status: 'accepted'
          }
        ])

      if (friendshipError) throw friendshipError

      // Create notification for the requester
      await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          type: 'friend_request_accepted',
          title: 'Friend Request Accepted',
          message: `Your friend request has been accepted`,
          data: {
            accepter_id: user.id
          }
        })

      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'accept friend request')
    }
  }

  async rejectFriendRequest(requestId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('friend_id', user.id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'reject friend request')
    }
  }

  async removeFriend(friendId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Remove both friendship records
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'remove friend')
    }
  }

  async getActivityFeed(filters = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get friends list
      const { data: friends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      const friendIds = friends?.map(f => f.friend_id) || []

      if (friendIds.length === 0) return []

      // Get recent activities from friends
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          user:activities_user_id_fkey (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(filters.limit || 20)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get activity feed')
    }
  }

  async getMutualFriends(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get user's friends
      const { data: userFriends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      // Get target user's friends
      const { data: targetFriends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      const userFriendIds = userFriends?.map(f => f.friend_id) || []
      const targetFriendIds = targetFriends?.map(f => f.friend_id) || []

      // Find mutual friends
      const mutualFriendIds = userFriendIds.filter(id => 
        targetFriendIds.includes(id) && id !== user.id
      )

      if (mutualFriendIds.length === 0) return []

      // Get mutual friends details
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url')
        .in('id', mutualFriendIds)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get mutual friends')
    }
  }

  async getFriendSuggestions() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Get user's current friends
      const { data: currentFriends } = await supabase
        .from('friends')
        .select('friend_id')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

      const currentFriendIds = currentFriends?.map(f => f.friend_id) || []

      // Get users who are not already friends and not the current user
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .not('id', 'in', `(${user.id},${currentFriendIds.join(',')})`)
        .eq('removed_at', null)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      return data || []
    } catch (error) {
      handleSupabaseError(error, 'get friend suggestions')
    }
  }

  async updateUser(userId, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Users can only update their own profile
      if (user.id !== userId) {
        throw new Error('Not authorized to update this user')
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'update user')
    }
  }
}

export const friendsService = new FriendsService()