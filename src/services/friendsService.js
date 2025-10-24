import { supabase, handleSupabaseError } from '@/lib/supabase'

export class FriendsService {
  async getFriends(filters = {}) {
    try {
      console.log('🔧 FriendsService: getFriends called with filters:', filters)
      console.log('🔧 FriendsService: Supabase configured:', !!supabase)
      
      if (!supabase) {
        console.error('❌ FriendsService: Supabase not configured')
        return []
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.log('❌ FriendsService: User not authenticated')
        throw new Error('Not authenticated')
      }

      console.log('🔧 FriendsService: User authenticated:', user.email)

      // Get friendships where user is either requester or receiver
      let query = supabase
        .from('friends')
        .select(`
          *,
          requester:requester_id (
            id,
            username,
            name,
            avatar_url,
            created_at
          ),
          receiver:receiver_id (
            id,
            username,
            name,
            avatar_url,
            created_at
          )
        `)
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      if (filters.orderBy) {
        const [column, direction] = filters.orderBy.startsWith('-') 
          ? [filters.orderBy.slice(1), 'desc'] 
          : [filters.orderBy, 'asc']
        // For friends, we order by the friendship creation date, not user creation date
        if (column === 'created_at') {
          query = query.order('created_at', { ascending: direction === 'asc' })
        }
      }

      console.log('🔧 FriendsService: Executing query...')
      const { data, error } = await query
      console.log('🔧 FriendsService: Query result:', { data, error })

      if (error) {
        console.error('❌ FriendsService: Query error:', error)
        throw error
      }

      console.log('🔧 FriendsService: Raw friends data:', data)

      // Map the data to extract friend information
      const friends = data.map(friendship => {
        // Determine which user is the friend (not the current user)
        const friend = friendship.requester_id === user.id 
          ? friendship.receiver 
          : friendship.requester

        return {
          id: friend.id,
          name: friend.name,
          username: friend.username,
          email: friend.email,
          avatar_url: friend.avatar_url,
          created_at: friend.created_at,
          friendship_created_at: friendship.created_at
        }
      })

      console.log('✅ FriendsService: Query successful, returning data:', friends.length, 'friends')
      return friends
    } catch (error) {
      console.error('❌ FriendsService: Error in getFriends:', error)
      // Return empty array instead of throwing error for better UX
      return []
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
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`requester_id.eq.${friendId},receiver_id.eq.${friendId}`)
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
      console.log('Searching for users with query:', query)
      
      // First, let's check if there are any users at all
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, username, name, email')
        .limit(5)
      
      console.log('All users in database (first 5):', allUsers)
      
      // Try multiple search approaches
      let searchData = []
      
      // Search by username
      const { data: usernameData, error: usernameError } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, email, created_at')
        .ilike('username', `%${query}%`)
        .limit(5)
      
      if (!usernameError && usernameData) {
        searchData = [...searchData, ...usernameData]
      }
      
      // Search by name
      const { data: nameData, error: nameError } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, email, created_at')
        .ilike('name', `%${query}%`)
        .limit(5)
      
      if (!nameError && nameData) {
        searchData = [...searchData, ...nameData]
      }
      
      // Search by email
      // const { data: emailData, error: emailError } = await supabase
      //   .from('users')
      //   .select('id, username, name, avatar_url, email, created_at')
      //   .ilike('email', `%${query}%`)
      //   .limit(5)
      
      // if (!emailError && emailData) {
      //   searchData = [...searchData, ...emailData]
      // }
      
      // Remove duplicates
      const uniqueData = searchData.filter((user, index, self) => 
        index === self.findIndex(u => u.id === user.id)
      )
      
      const data = uniqueData.slice(0, 10)
      const error = usernameError || nameError || emailError

      if (error) {
        console.error('Search users error:', error)
        throw error
      }
      
      console.log('Search results:', data)
      return data || []
    } catch (error) {
      console.error('searchUsers error:', error)
      handleSupabaseError(error, 'search users')
    }
  }

  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .is('removed_at', null)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      handleSupabaseError(error, 'get user')
    }
  }

  async getFriendByUsername(username) {
    try {
      console.log('🔧 FriendsService: getFriendByUsername called with username:', username)
      
      if (!supabase) {
        console.error('❌ FriendsService: Supabase not configured')
        return null
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.log('❌ FriendsService: User not authenticated')
        throw new Error('Not authenticated')
      }

      console.log('🔧 FriendsService: User authenticated:', user.email)

      // First, get the user by username
      const { data: users, error: userError2 } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .is('removed_at', null)

      if (userError2) {
        console.error('❌ FriendsService: Error finding user by username:', userError2)
        return null
      }

      if (!users || users.length === 0) {
        console.log('❌ FriendsService: User not found with username:', username)
        return null
      }

      const targetUser = users[0] // Get the first (and should be only) user
      console.log('🔧 FriendsService: Found target user:', targetUser.username)

      // Check if they are friends
      const { data: friendships, error: friendshipError } = await supabase
        .from('friends')
        .select('*')
        .or(`and(requester_id.eq.${user.id},receiver_id.eq.${targetUser.id}),and(requester_id.eq.${targetUser.id},receiver_id.eq.${user.id})`)
        .eq('status', 'accepted')

      if (friendshipError) {
        console.error('❌ FriendsService: Error checking friendship:', friendshipError)
        return null
      }

      if (!friendships || friendships.length === 0) {
        console.log('❌ FriendsService: Users are not friends')
        return null
      }

      console.log('✅ FriendsService: Found friendship, returning friend data')
      return {
        id: targetUser.id,
        name: targetUser.name,
        username: targetUser.username,
        email: targetUser.email,
        avatar_url: targetUser.avatar_url,
        created_at: targetUser.created_at
      }
    } catch (error) {
      console.error('❌ FriendsService: Error in getFriendByUsername:', error)
      return null
    }
  }

  async sendFriendRequest(userId) {
    try {
      console.log('🤝 FriendsService: ========== Sending Friend Request ==========')
      console.log('🤝 FriendsService: Target user ID:', userId)
      console.log('🤝 FriendsService: Supabase configured:', !!supabase)
      
      if (!supabase) {
        console.error('❌ FriendsService: Supabase not configured')
        throw new Error('Supabase not configured')
      }

      // Get current authenticated user
      console.log('🤝 FriendsService: Getting current user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ FriendsService: User not authenticated:', userError)
        throw new Error('Not authenticated')
      }
      
      console.log('✅ FriendsService: User authenticated:', {
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.name || 'Unknown'
      })

      // Check friends quota before sending request
      console.log('🤝 FriendsService: Checking friends quota...')
      const { data: canAddFriend, error: quotaError } = await supabase
        .rpc('can_add_friend', { user_id: user.id })

      console.log('🤝 FriendsService: Quota check result:', {
        canAddFriend,
        hasError: !!quotaError,
        errorMessage: quotaError?.message
      })

      if (quotaError) {
        console.error('❌ FriendsService: Error checking friends quota:', quotaError)
        throw quotaError
      }

      if (!canAddFriend) {
        console.warn('⚠️ FriendsService: Friends quota exceeded')
        throw new Error('Friends quota exceeded. You can have up to 50 friends. Please remove some friends to add new ones.')
      }

      console.log('✅ FriendsService: Friends quota check passed')

      // Check if friendship already exists (check both possible orderings)
      console.log('🤝 FriendsService: Checking for existing friendship...')
      const { data: existingFriendships1 } = await supabase
        .from('friends')
        .select('id, status')
        .eq('requester_id', user.id)
        .eq('receiver_id', userId)

      const { data: existingFriendships2 } = await supabase
        .from('friends')
        .select('id, status')
        .eq('requester_id', userId)
        .eq('receiver_id', user.id)

      console.log('🤝 FriendsService: Existing friendship check results:', {
        direction1: existingFriendships1?.length || 0,
        direction2: existingFriendships2?.length || 0,
        friendship1: existingFriendships1?.[0],
        friendship2: existingFriendships2?.[0]
      })

      const existingFriendship1 = existingFriendships1 && existingFriendships1.length > 0 ? existingFriendships1[0] : null
      const existingFriendship2 = existingFriendships2 && existingFriendships2.length > 0 ? existingFriendships2[0] : null
      const existingFriendship = existingFriendship1 || existingFriendship2

      if (existingFriendship) {
        console.warn('⚠️ FriendsService: Friendship already exists:', {
          friendship_id: existingFriendship.id,
          status: existingFriendship.status,
          requester_id: user.id,
          receiver_id: userId
        })
        
        if (existingFriendship.status === 'pending') {
          throw new Error('Friend request already sent')
        } else if (existingFriendship.status === 'accepted') {
          throw new Error('Already friends')
        }
      }

      console.log('✅ FriendsService: No existing friendship found, proceeding with request')

      // Create friend request - the authenticated user is always the requester
      console.log('🤝 FriendsService: Creating friend request...')
      const friendRequestData = {
        requester_id: user.id,
        receiver_id: userId,
        status: 'pending'
      }
      
      console.log('🤝 FriendsService: Friend request data:', friendRequestData)
      
      const { data, error } = await supabase
        .from('friends')
        .insert(friendRequestData)
        .select()
        .single()

      console.log('🤝 FriendsService: Insert result:', {
        hasData: !!data,
        hasError: !!error,
        errorMessage: error?.message,
        errorCode: error?.code
      })

      if (error) {
        console.error('❌ FriendsService: Error inserting friend request:', error)
        throw error
      }

      console.log('✅ FriendsService: Friend request sent successfully!', {
        friendship_id: data.id,
        requester_id: data.requester_id,
        receiver_id: data.receiver_id,
        status: data.status,
        created_at: data.created_at
      })

      // The notification will be created automatically by the database trigger
      // defined in the 027_friend_notifications.sql migration
      // No need to manually insert notification here
      console.log('📧 FriendsService: Notification will be created automatically by database trigger')

      return data
    } catch (error) {
      console.error('❌ FriendsService: Error in sendFriendRequest:', error)
      handleSupabaseError(error, 'send friend request')
    }
  }

  async getFriendRequests() {
    try {
      console.log('📥 FriendsService: ========== Getting Friend Requests ==========')
      console.log('📥 FriendsService: Supabase configured:', !!supabase)
      
      if (!supabase) {
        console.error('❌ FriendsService: Supabase not configured')
        return []
      }

      // Get current authenticated user
      console.log('📥 FriendsService: Getting current user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ FriendsService: User not authenticated:', userError)
        throw new Error('Not authenticated')
      }
      
      console.log('✅ FriendsService: User authenticated:', {
        user_id: user.id,
        user_email: user.email
      })

      console.log('📥 FriendsService: Getting pending friend requests where user is receiver...')

      // Get pending friend requests where current user is the receiver
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          requester:requester_id (
            id,
            username,
            name,
            avatar_url,
            email
          )
        `)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      console.log('📥 FriendsService: Query result:', {
        hasData: !!data,
        hasError: !!error,
        requestCount: data?.length || 0,
        errorMessage: error?.message
      })

      if (error) {
        console.error('❌ FriendsService: Database error in getFriendRequests:', error)
        throw error
      }

      console.log('📥 FriendsService: Raw friend requests data:', data)

      // Map the data to match expected format
      console.log('📥 FriendsService: Processing friend requests data...')
      const requests = (data || []).map(request => {
        console.log('📥 FriendsService: Processing request:', {
          request_id: request.id,
          requester_id: request.requester_id,
          receiver_id: request.receiver_id,
          status: request.status,
          requester_name: request.requester?.name,
          requester_username: request.requester?.username
        })
        
        return {
          id: request.id,
          requester: request.requester,
          status: request.status,
          created_at: request.created_at
        }
      })

      console.log('✅ FriendsService: Successfully processed friend requests:', requests.length)
      console.log('📥 FriendsService: Processed friend requests:', requests)
      return requests
    } catch (error) {
      console.error('❌ FriendsService: Error in getFriendRequests:', error)
      handleSupabaseError(error, 'get friend requests')
    }
  }

  async acceptFriendRequest(requestId) {
    try {
      console.log('✅ FriendsService: ========== Accepting Friend Request ==========')
      console.log('✅ FriendsService: Request ID:', requestId)
      console.log('✅ FriendsService: Supabase configured:', !!supabase)
      
      if (!supabase) {
        console.error('❌ FriendsService: Supabase not configured')
        throw new Error('Supabase not configured')
      }

      // Get current authenticated user
      console.log('✅ FriendsService: Getting current user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ FriendsService: User not authenticated:', userError)
        throw new Error('Not authenticated')
      }
      
      console.log('✅ FriendsService: User authenticated:', {
        user_id: user.id,
        user_email: user.email
      })

      // Get the request details
      console.log('✅ FriendsService: Fetching friend request details...')
      const { data: requests, error: requestError } = await supabase
        .from('friends')
        .select('*')
        .eq('id', requestId)
        .eq('receiver_id', user.id)
        .eq('status', 'pending')

      console.log('✅ FriendsService: Request fetch result:', {
        hasData: !!requests,
        hasError: !!requestError,
        requestCount: requests?.length || 0,
        errorMessage: requestError?.message
      })

      if (requestError) {
        console.error('❌ FriendsService: Error fetching friend request:', requestError)
        throw new Error('Error fetching friend request')
      }

      if (!requests || requests.length === 0) {
        console.warn('⚠️ FriendsService: Friend request not found or not pending')
        throw new Error('Friend request not found')
      }

      const request = requests[0]
      console.log('✅ FriendsService: Found friend request:', {
        request_id: request.id,
        requester_id: request.requester_id,
        receiver_id: request.receiver_id,
        status: request.status,
        created_at: request.created_at
      })

      // Update request status to accepted
      console.log('✅ FriendsService: Updating request status to accepted...')
      const { error: updateError } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId)

      console.log('✅ FriendsService: Update result:', {
        hasError: !!updateError,
        errorMessage: updateError?.message
      })

      if (updateError) {
        console.error('❌ FriendsService: Error updating friend request:', updateError)
        throw updateError
      }

      console.log('✅ FriendsService: Friend request accepted successfully!', {
        request_id: requestId,
        requester_id: request.requester_id,
        receiver_id: request.receiver_id
      })

      // The notification will be created automatically by the database trigger
      // defined in the 027_friend_notifications.sql migration
      // No need to manually insert notification here
      console.log('📧 FriendsService: Notification will be created automatically by database trigger')

      return { success: true }
    } catch (error) {
      console.error('❌ FriendsService: Error in acceptFriendRequest:', error)
      handleSupabaseError(error, 'accept friend request')
    }
  }

  async rejectFriendRequest(requestId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('receiver_id', user.id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'reject friend request')
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
          receiver:receiver_id (
            id,
            username,
            name,
            avatar_url
          )
        `)
        .eq('requester_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map(req => ({
        id: req.id,
        receiver: req.receiver,
        status: req.status,
        created_at: req.created_at
      }))
    } catch (error) {
      handleSupabaseError(error, 'get sent friend requests')
    }
  }

  async cancelFriendRequest(requestId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Only requester can cancel a pending request
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId)
        .eq('requester_id', user.id)
        .eq('status', 'pending')

      if (error) throw error
      return { success: true }
    } catch (error) {
      handleSupabaseError(error, 'cancel friend request')
    }
  }

  async removeFriend(friendId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) throw new Error('Not authenticated')

      // Remove friendship record (check both possible orderings)
      const { error: error1 } = await supabase
        .from('friends')
        .delete()
        .eq('requester_id', user.id)
        .eq('receiver_id', friendId)

      const { error: error2 } = await supabase
        .from('friends')
        .delete()
        .eq('requester_id', friendId)
        .eq('receiver_id', user.id)

      if (error1 && error2) throw error1 || error2
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
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const friendIds = friends?.map(f => f.requester_id === user.id ? f.receiver_id : f.requester_id) || []

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
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      // Get target user's friends
      const { data: targetFriends } = await supabase
        .from('friends')
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .eq('status', 'accepted')

      const userFriendIds = userFriends?.map(f => f.requester_id === user.id ? f.receiver_id : f.requester_id) || []
      const targetFriendIds = targetFriends?.map(f => f.requester_id === userId ? f.receiver_id : f.requester_id) || []

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
        .select('requester_id, receiver_id')
        .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('status', 'accepted')

      const currentFriendIds = currentFriends?.map(f => f.requester_id === user.id ? f.receiver_id : f.requester_id) || []

      // Get users who are not already friends and not the current user
      const { data, error } = await supabase
        .from('users')
        .select('id, username, name, avatar_url, created_at')
        .not('id', 'in', `(${user.id},${currentFriendIds.join(',')})`)
        .is('removed_at', null)
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