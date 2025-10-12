/**
 * Friends Store - StyleSnap
 * 
 * Purpose: Manages friendships, friend requests, and friend data
 * 
 * State:
 * - friends: Array (accepted friendships)
 * - pendingRequests: Object
 *   - incoming: Array (requests received)
 *   - outgoing: Array (requests sent)
 * - currentFriend: Object | null (selected friend's profile)
 * - isLoading: boolean
 * 
 * Actions:
 * - fetchFriends(): Fetches accepted friendships
 * - fetchPendingRequests(): Fetches all pending requests (incoming + outgoing)
 * - sendFriendRequest(targetUserId): Sends friend request
 * - acceptRequest(requestId): Accepts incoming friend request
 * - rejectRequest(requestId): Rejects incoming friend request
 * - cancelRequest(requestId): Cancels outgoing friend request
 * - unfriend(friendshipId): Removes friendship
 * - searchUsers(query): Searches for users by name/email
 * - fetchFriendProfile(friendId): Gets friend's profile and public items
 * 
 * Getters:
 * - friendsCount: returns friends.length
 * - incomingRequestsCount: returns pendingRequests.incoming.length
 * - hasPendingRequests: returns incomingRequestsCount > 0
 * 
 * Friendship States:
 * - pending: request sent, awaiting response
 * - accepted: active friendship
 * - rejected: request denied (not shown in UI)
 * 
 * Reference:
 * - services/friends-service.js for API calls
 * - requirements/database-schema.md for friendships table
 * - tasks/04-social-features-privacy.md for friendship logic
 */

import { defineStore } from 'pinia'

export const useFriendsStore = defineStore('friends', {
  state: () => ({
    friends: [],
    pendingRequests: {
      incoming: [],
      outgoing: []
    },
    currentFriend: null,
    searchResults: [],
    isLoading: false
  }),
  
  getters: {
    friendsCount: (state) => state.friends.length,
    incomingRequestsCount: (state) => state.pendingRequests.incoming.length,
    outgoingRequestsCount: (state) => state.pendingRequests.outgoing.length,
    hasPendingRequests: (state) => state.pendingRequests.incoming.length > 0
  },
  
  actions: {
    /**
     * Fetch all accepted friendships
     */
    async fetchFriends() {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        const friends = await friendsService.getFriends()
        this.friends = friends
      } catch (error) {
        console.error('Failed to fetch friends:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch pending friend requests
     */
    async fetchPendingRequests() {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        const requests = await friendsService.getPendingRequests()
        this.pendingRequests = requests
      } catch (error) {
        console.error('Failed to fetch pending requests:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Send friend request by email
     */
    async sendFriendRequest(email) {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        const result = await friendsService.sendFriendRequest(email)
        
        // Refresh pending requests to include new request
        await this.fetchPendingRequests()
        
        return result
      } catch (error) {
        console.error('Failed to send friend request:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Accept incoming friend request
     */
    async acceptRequest(requestId) {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        await friendsService.acceptFriendRequest(requestId)
        
        // Remove from pending incoming
        this.pendingRequests.incoming = this.pendingRequests.incoming.filter(
          req => req.requestId !== requestId
        )
        
        // Refresh friends list
        await this.fetchFriends()
      } catch (error) {
        console.error('Failed to accept friend request:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Reject incoming friend request
     */
    async rejectRequest(requestId) {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        await friendsService.rejectFriendRequest(requestId)
        
        // Remove from pending incoming
        this.pendingRequests.incoming = this.pendingRequests.incoming.filter(
          req => req.requestId !== requestId
        )
      } catch (error) {
        console.error('Failed to reject friend request:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Cancel outgoing friend request
     */
    async cancelRequest(requestId) {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        await friendsService.cancelFriendRequest(requestId)
        
        // Remove from pending outgoing
        this.pendingRequests.outgoing = this.pendingRequests.outgoing.filter(
          req => req.requestId !== requestId
        )
      } catch (error) {
        console.error('Failed to cancel friend request:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Unfriend
     */
    async unfriend(friendshipId) {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        await friendsService.unfriend(friendshipId)
        
        // Remove from friends list
        this.friends = this.friends.filter(
          friend => friend.friendshipId !== friendshipId
        )
      } catch (error) {
        console.error('Failed to unfriend:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Search users by name or email
     */
    async searchUsers(query) {
      if (!query || query.trim().length < 2) {
        this.searchResults = []
        return
      }
      
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        const results = await friendsService.searchUsers(query)
        this.searchResults = results
        return results
      } catch (error) {
        console.error('Failed to search users:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Fetch friend's profile and items
     */
    async fetchFriendProfile(friendId) {
      this.isLoading = true
      try {
        const friendsService = await import('../services/friends-service')
        const profile = await friendsService.getFriendProfile(friendId)
        this.currentFriend = profile
        return profile
      } catch (error) {
        console.error('Failed to fetch friend profile:', error)
        throw error
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Clear current friend
     */
    clearCurrentFriend() {
      this.currentFriend = null
    }
  }
})
