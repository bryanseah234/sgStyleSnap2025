import { supabase, handleSupabaseError } from '@/lib/supabase'

export class FriendsService {
  async getFriends() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:users!friends_requester_id_fkey(id, name, username, avatar_url),
          receiver:users!friends_receiver_id_fkey(id, name, username, avatar_url)
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (error) throw error

      // Transform data to show friend info
      const friends = data.map(friendship => {
        const friend = friendship.requester_id === user.id 
          ? friendship.receiver 
          : friendship.requester
        return {
          id: friend.id,
          name: friend.name,
          username: friend.username,
          avatar_url: friend.avatar_url,
          friendship_id: friendship.id,
          created_at: friendship.created_at
        }
      })

      return { success: true, data: friends }
    } catch (error) {
      handleSupabaseError(error, 'get friends')
    }
  }

  async getFriendRequests() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:users!friends_requester_id_fkey(id, name, username, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get friend requests')
    }
  }

  async getSentRequests() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          receiver:users!friends_receiver_id_fkey(id, name, username, avatar_url)
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get sent requests')
    }
  }

  async searchUsers(searchTerm) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      if (!searchTerm || searchTerm.length < 2) {
        return { success: true, data: [] }
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, name, username, avatar_url')
        .or(`name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`)
        .neq('id', user.id)
        .eq('removed_at', null)
        .limit(10)

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'search users')
    }
  }

  async sendFriendRequest(receiverId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      if (user.id === receiverId) {
        throw new Error('Cannot send friend request to yourself')
      }

      // Check if friendship already exists
      const { data: existing, error: checkError } = await supabase
        .from('friends')
        .select('*')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${receiverId}),and(requester_id.eq.${receiverId},receiver_id.eq.${user.id})`)

      if (checkError) throw checkError

      if (existing && existing.length > 0) {
        const friendship = existing[0]
        if (friendship.status === 'accepted') {
          throw new Error('Already friends')
        } else if (friendship.status === 'pending') {
          throw new Error('Friend request already sent')
        }
      }

      // Create friend request (ensuring canonical ordering)
      const requesterId = user.id < receiverId ? user.id : receiverId
      const actualReceiverId = user.id < receiverId ? receiverId : user.id

      const { data, error } = await supabase
        .from('friends')
        .insert({
          requester_id: requesterId,
          receiver_id: actualReceiverId,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'send friend request')
    }
  }

  async acceptFriendRequest(friendshipId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', friendshipId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'accept friend request')
    }
  }

  async rejectFriendRequest(friendshipId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('id', friendshipId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'reject friend request')
    }
  }

  async removeFriend(friendshipId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('friends')
        .delete()
        .eq('id', friendshipId)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .select()
        .single()

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      handleSupabaseError(error, 'remove friend')
    }
  }

  async getFriendCloset(friendId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Use the database function to get friend's viewable items
      const { data, error } = await supabase
        .rpc('get_friend_closet', {
          friend_id: friendId,
          viewer_id: user.id
        })

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error) {
      handleSupabaseError(error, 'get friend closet')
    }
  }

  async getFriendshipStatus(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      if (user.id === userId) {
        return { success: true, data: { status: 'self' } }
      }

      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${userId}),and(requester_id.eq.${userId},receiver_id.eq.${user.id})`)

      if (error) throw error

      if (!data || data.length === 0) {
        return { success: true, data: { status: 'none' } }
      }

      const friendship = data[0]
      return { 
        success: true, 
        data: { 
          status: friendship.status,
          friendship_id: friendship.id,
          is_requester: friendship.requester_id === user.id
        }
      }
    } catch (error) {
      handleSupabaseError(error, 'get friendship status')
    }
  }
}

export const friendsService = new FriendsService()
