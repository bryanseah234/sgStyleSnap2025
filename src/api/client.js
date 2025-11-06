/**
 * StyleSnap - Main API Client
 * 
 * Centralized API client that aggregates all service methods and provides
 * a unified interface for frontend components to interact with backend services.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { authService } from '@/services/authService'
import { clothesService } from '@/services/clothesService'
import { friendsService } from '@/services/friendsService'
import { outfitsService } from '@/services/outfitsService'
import { notificationsService } from '@/services/notificationsService'
import { catalogService } from '@/services/catalogService'
import { analyticsService } from '@/services/analyticsService'
import { weatherService } from '@/services/weatherService'

/**
 * Main API Client Object
 * 
 * Aggregates all service methods into a single, organized interface.
 * Provides consistent method signatures and error handling across all services.
 * 
 * @type {Object} API client with organized service methods
 */
export const api = {
  /**
   * Authentication Service Methods
   * 
   * Handles user authentication, profile management, and session control.
   */
  auth: {
    /**
     * Sign in with Google OAuth
     * @returns {Promise<Object>} User authentication result
     */
    signInWithGoogle: () => authService.signInWithGoogle(),
    
    /**
     * Sign out the current user
     * @returns {Promise<void>}
     */
    signOut: () => authService.signOut(),
    
    /**
     * Get current user data
     * @returns {Promise<Object>} Current user information
     */
    me: () => authService.me(),
    
    /**
     * Update current user profile
     * @param {Object} updates - User data to update
     * @returns {Promise<Object>} Updated user data
     */
    updateMe: (updates) => authService.updateMe(updates),
    
    /**
     * Get current user (alias for me)
     * @returns {Promise<Object>} Current user information
     */
    getCurrentUser: () => authService.getCurrentUser(),
    
    /**
     * Get current user profile
     * @returns {Promise<Object>} Current user profile
     */
    getCurrentProfile: () => authService.getCurrentProfile(),
    
    /**
     * Check if user is authenticated
     * @returns {Promise<boolean>} Authentication status
     */
    isAuthenticated: () => authService.isAuthenticated(),
    
    /**
     * Check authentication status
     * @returns {Promise<Object>} Authentication check result
     */
    checkAuth: () => authService.checkAuth()
  },

  /**
   * Entity-based Service Methods
   * 
   * Provides CRUD operations for all main entities in the system.
   */
  entities: {
    /**
     * Clothing Item Entity Methods
     * 
     * Manages clothing items in user's wardrobe.
     */
    ClothingItem: {
      /**
       * List clothing items with pagination and sorting
       * @param {string} orderBy - Sort order (default: '-created_at')
       * @param {number} limit - Maximum items to return (default: 20)
       * @returns {Promise<Array>} Array of clothing items
       */
      list: (orderBy = '-created_at', limit = 20) => clothesService.getClothes({ orderBy, limit }),
      
      /**
       * Get a specific clothing item by ID
       * @param {string} id - Clothing item ID
       * @returns {Promise<Object>} Clothing item data
       */
      get: (id) => clothesService.getClothesById(id),
      
      /**
       * Create a new clothing item
       * @param {Object} data - Clothing item data
       * @returns {Promise<Object>} Created clothing item
       */
      create: (data) => clothesService.addClothes(data),
      
      /**
       * Update an existing clothing item
       * @param {string} id - Clothing item ID
       * @param {Object} data - Updated clothing item data
       * @returns {Promise<Object>} Updated clothing item
       */
      update: (id, data) => clothesService.updateClothes(id, data),
      
      /**
       * Delete a clothing item
       * @param {string} id - Clothing item ID
       * @returns {Promise<void>}
       */
      delete: (id) => clothesService.deleteClothes(id),
      
      /**
       * Filter clothing items with custom criteria
       * @param {Object} filters - Filter criteria
       * @param {string} orderBy - Sort order (default: '-created_at')
       * @param {number} limit - Maximum items to return (default: 20)
       * @returns {Promise<Array>} Filtered clothing items
       */
      filter: (filters, orderBy = '-created_at', limit = 20) => clothesService.getClothes({ ...filters, orderBy, limit }),
      
      /**
       * Toggle favorite status of a clothing item
       * @param {string} id - Clothing item ID
       * @returns {Promise<Object>} Updated clothing item
       */
      toggleFavorite: (id) => clothesService.toggleFavorite(id),
      
      /**
       * Search clothing items by query
       * @param {string} query - Search query
       * @returns {Promise<Array>} Search results
       */
      search: (query) => clothesService.searchClothes(query)
    },

    /**
     * User Entity Methods
     * 
     * Manages user profiles and user-related operations.
     */
    User: {
      /**
       * Get user by ID
       * @param {string} id - User ID
       * @returns {Promise<Object>} User data
       */
      get: (id) => friendsService.getUser(id),
      
      /**
       * Search users by query
       * @param {string} query - Search query
       * @returns {Promise<Array>} Search results
       */
      search: (query) => friendsService.searchUsers(query),
      
      /**
       * Update user data
       * @param {string} id - User ID
       * @param {Object} data - Updated user data
       * @returns {Promise<Object>} Updated user data
       */
      update: (id, data) => friendsService.updateUser(id, data)
    },

    /**
     * Friend Entity Methods
     * 
     * Manages friend relationships and friend requests.
     */
    Friend: {
      /**
       * List friends with sorting
       * @param {string} orderBy - Sort order (default: '-created_at')
       * @returns {Promise<Array>} Array of friends
       */
      list: (orderBy = '-created_at') => friendsService.getFriends({ orderBy }),
      
      /**
       * Get friend by ID
       * @param {string} id - Friend ID
       * @returns {Promise<Object>} Friend data
       */
      get: (id) => friendsService.getFriend(id),
      
      /**
       * Send friend request to user
       * @param {string} userId - Target user ID
       * @returns {Promise<Object>} Friend request result
       */
      sendRequest: (userId) => friendsService.sendFriendRequest(userId),
      
      /**
       * Accept a friend request
       * @param {string} requestId - Friend request ID
       * @returns {Promise<Object>} Acceptance result
       */
      acceptRequest: (requestId) => friendsService.acceptFriendRequest(requestId),
      
      /**
       * Reject a friend request
       * @param {string} requestId - Friend request ID
       * @returns {Promise<void>}
       */
      rejectRequest: (requestId) => friendsService.rejectFriendRequest(requestId),
      
      /**
       * Remove a friend
       * @param {string} friendId - Friend ID
       * @returns {Promise<void>}
       */
      remove: (friendId) => friendsService.removeFriend(friendId),
      
      /**
       * Get pending friend requests
       * @returns {Promise<Array>} Array of friend requests
       */
      getRequests: () => friendsService.getFriendRequests()
    },

    /**
     * Outfit Entity Methods
     * 
     * Manages outfit creation, storage, and sharing.
     */
    Outfit: {
      /**
       * List outfits with pagination and sorting
       * @param {string} orderBy - Sort order (default: '-created_at')
       * @param {number} limit - Maximum items to return (default: 20)
       * @returns {Promise<Array>} Array of outfits
       */
      list: (orderBy = '-created_at', limit = 20) => outfitsService.getOutfits({ orderBy, limit }),
      
      /**
       * Get outfit by ID
       * @param {string} id - Outfit ID
       * @returns {Promise<Object>} Outfit data
       */
      get: (id) => outfitsService.getOutfit(id),
      
      /**
       * Create a new outfit
       * @param {Object} data - Outfit data
       * @returns {Promise<Object>} Created outfit
       */
      create: (data) => outfitsService.createOutfit(data),
      
      /**
       * Update an existing outfit
       * @param {string} id - Outfit ID
       * @param {Object} data - Updated outfit data
       * @returns {Promise<Object>} Updated outfit
       */
      update: (id, data) => outfitsService.updateOutfit(id, data),
      
      /**
       * Delete an outfit
       * @param {string} id - Outfit ID
       * @returns {Promise<void>}
       */
      delete: (id) => outfitsService.deleteOutfit(id),
      
      /**
       * Like an outfit
       * @param {string} id - Outfit ID
       * @returns {Promise<Object>} Like result
       */
      like: (id) => outfitsService.likeOutfit(id),
      
      /**
       * Unlike an outfit
       * @param {string} id - Outfit ID
       * @returns {Promise<Object>} Unlike result
       */
      unlike: (id) => outfitsService.unlikeOutfit(id),
      
      /**
       * Share an outfit with friends
       * @param {string} id - Outfit ID
       * @param {Array<string>} friendIds - Array of friend IDs
       * @returns {Promise<Object>} Share result
       */
      share: (id, friendIds) => outfitsService.shareOutfit(id, friendIds)
    },

    /**
     * Notification Entity Methods
     * 
     * Manages user notifications and alerts.
     */
    Notification: {
      /**
       * List notifications with pagination
       * @param {number} limit - Maximum items to return (default: 20)
       * @returns {Promise<Array>} Array of notifications
       */
      list: (limit = 20) => notificationsService.getNotifications({ limit }),
      
      /**
       * Mark notification as read
       * @param {string} id - Notification ID
       * @returns {Promise<Object>} Updated notification
       */
      markAsRead: (id) => notificationsService.markAsRead(id),
      
      /**
       * Mark all notifications as read
       * @returns {Promise<void>}
       */
      markAllAsRead: () => notificationsService.markAllAsRead(),
      
      /**
       * Delete a notification
       * @param {string} id - Notification ID
       * @returns {Promise<void>}
       */
      delete: (id) => notificationsService.deleteNotification(id),
      
      /**
       * Get unread notification count
       * @returns {Promise<number>} Unread count
       */
      getUnreadCount: () => notificationsService.getUnreadCount()
    }
  },

  /**
   * Feature-specific Service Methods
   * 
   * Provides specialized functionality for specific features.
   */
  outfits: {
    /**
     * Generate outfit based on preferences
     * @param {Object} preferences - Outfit generation preferences
     * @returns {Promise<Object>} Generated outfit
     */
    generateOutfit: (preferences) => outfitsService.generateOutfit(preferences),
    
    /**
     * Create outfit (alias for entities.Outfit.create)
     * @param {Object} outfitData - Outfit data
     * @returns {Promise<Object>} Created outfit
     */
    createOutfit: (outfitData) => outfitsService.createOutfit(outfitData),
    
    /**
     * Save outfit (alias for createOutfit)
     * @param {Object} outfitData - Outfit data
     * @returns {Promise<Object>} Saved outfit
     */
    saveOutfit: (outfitData) => outfitsService.createOutfit(outfitData),
    
    /**
     * Get outfit suggestions for a specific item
     * @param {string} itemId - Clothing item ID
     * @returns {Promise<Array>} Outfit suggestions
     */
    getOutfitSuggestions: (itemId) => outfitsService.getOutfitSuggestions(itemId),
    
    /**
     * Get weather-based outfit suggestions
     * @param {Object} weatherData - Weather information
     * @returns {Promise<Array>} Weather-based outfit suggestions
     */
    getWeatherBasedOutfits: (weatherData) => outfitsService.getWeatherBasedOutfits(weatherData)
  },

  /**
   * Friends Service Methods
   * 
   * Provides social features and friend management.
   */
  friends: {
    /**
     * Get user's friends
     * @returns {Promise<Array>} Array of friends
     */
    getFriends: () => friendsService.getFriends(),
    
    /**
     * Get pending friend requests
     * @returns {Promise<Array>} Array of friend requests
     */
    getFriendRequests: () => friendsService.getFriendRequests(),
    
    /**
     * Get sent friend requests
     * @returns {Promise<Array>} Array of sent requests
     */
    getSentRequests: () => friendsService.getSentRequests(),
    
    /**
     * Send friend request
     * @param {string} userId - Target user ID
     * @returns {Promise<Object>} Request result
     */
    sendFriendRequest: (userId) => friendsService.sendFriendRequest(userId),
    
    /**
     * Accept friend request
     * @param {string} requestId - Friend request ID
     * @returns {Promise<Object>} Acceptance result
     */
    acceptFriendRequest: (requestId) => friendsService.acceptFriendRequest(requestId),
    
    /**
     * Decline friend request
     * @param {string} requestId - Friend request ID
     * @returns {Promise<void>}
     */
    declineFriendRequest: (requestId) => friendsService.declineFriendRequest(requestId),
    
    /**
     * Search users
     * @param {string} query - Search query
     * @returns {Promise<Array>} Search results
     */
    searchUsers: (query) => friendsService.searchUsers(query),
    
    /**
     * Get activity feed
     * @param {number} limit - Maximum items to return (default: 20)
     * @returns {Promise<Array>} Activity feed
     */
    getActivityFeed: (limit = 20) => friendsService.getActivityFeed({ limit }),
    
    /**
     * Get mutual friends with a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Mutual friends
     */
    getMutualFriends: (userId) => friendsService.getMutualFriends(userId),
    
    /**
     * Get friend suggestions
     * @returns {Promise<Array>} Friend suggestions
     */
    getFriendSuggestions: () => friendsService.getFriendSuggestions()
  },

  /**
   * Catalog Service Methods
   * 
   * Provides access to clothing catalogs and reference data.
   */
  catalog: {
    /**
     * Get clothing categories
     * @returns {Promise<Array>} Array of categories
     */
    getCategories: () => catalogService.getCategories(),
    
    /**
     * Get clothing brands
     * @returns {Promise<Array>} Array of brands
     */
    getBrands: () => catalogService.getBrands(),
    
    /**
     * Get available colors
     * @returns {Promise<Array>} Array of colors
     */
    getColors: () => catalogService.getColors(),
    
    /**
     * Get clothing styles
     * @returns {Promise<Array>} Array of styles
     */
    getStyles: () => catalogService.getStyles(),
    
    /**
     * Search catalog items
     * @param {string} query - Search query
     * @returns {Promise<Array>} Search results
     */
    searchItems: (query) => catalogService.searchItems(query),
    
    /**
     * Get trending items
     * @returns {Promise<Array>} Trending items
     */
    getTrendingItems: () => catalogService.getTrendingItems()
  },

  /**
   * Analytics Service Methods
   * 
   * Provides wardrobe analytics and insights.
   */
  analytics: {
    /**
     * Get wardrobe statistics
     * @returns {Promise<Object>} Wardrobe stats
     */
    getWardrobeStats: () => analyticsService.getWardrobeStats(),
    
    /**
     * Get outfit statistics
     * @returns {Promise<Object>} Outfit stats
     */
    getOutfitStats: () => analyticsService.getOutfitStats(),
    
    /**
     * Get style insights
     * @returns {Promise<Object>} Style insights
     */
    getStyleInsights: () => analyticsService.getStyleInsights(),
    
    /**
     * Get usage statistics
     * @param {string} period - Time period (default: '30d')
     * @returns {Promise<Object>} Usage stats
     */
    getUsageStats: (period = '30d') => analyticsService.getUsageStats(period),
    
    /**
     * Get color analysis
     * @returns {Promise<Object>} Color analysis
     */
    getColorAnalysis: () => analyticsService.getColorAnalysis(),
    
    /**
     * Get brand analysis
     * @returns {Promise<Object>} Brand analysis
     */
    getBrandAnalysis: () => analyticsService.getBrandAnalysis()
  },

  /**
   * Weather Service Methods
   * 
   * Provides weather data and weather-based recommendations.
   */
  weather: {
    /**
     * Get current weather for location
     * @param {string} location - Location string
     * @returns {Promise<Object>} Current weather data
     */
    getCurrentWeather: (location) => weatherService.getCurrentWeather(location),
    
    /**
     * Get weather forecast
     * @param {string} location - Location string
     * @param {number} days - Number of days (default: 5)
     * @returns {Promise<Array>} Weather forecast
     */
    getWeatherForecast: (location, days = 5) => weatherService.getWeatherForecast(location, days),
    
    /**
     * Get weather-based outfit suggestions
     * @param {Object} weatherData - Weather information
     * @returns {Promise<Array>} Weather-based suggestions
     */
    getWeatherBasedSuggestions: (weatherData) => weatherService.getWeatherBasedSuggestions(weatherData)
  },

  /**
   * Notifications Service Methods
   * 
   * Provides real-time notification management.
   */
  notifications: {
    /**
     * Subscribe to notifications
     * @param {Function} callback - Notification callback function
     * @returns {Object} Subscription object
     */
    subscribe: (callback) => notificationsService.subscribe(callback),
    
    /**
     * Unsubscribe from notifications
     * @param {Object} subscription - Subscription object
     * @returns {void}
     */
    unsubscribe: (subscription) => notificationsService.unsubscribe(subscription),
    
    /**
     * Send a notification
     * @param {Object} data - Notification data
     * @returns {Promise<Object>} Sent notification
     */
    sendNotification: (data) => notificationsService.sendNotification(data)
  }
}

export default api