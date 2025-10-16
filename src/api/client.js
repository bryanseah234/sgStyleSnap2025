import { authService } from '@/services/authService'
import { clothesService } from '@/services/clothesService'
import { friendsService } from '@/services/friendsService'
import { outfitsService } from '@/services/outfitsService'
import { notificationsService } from '@/services/notificationsService'
import { catalogService } from '@/services/catalogService'
import { analyticsService } from '@/services/analyticsService'
import { weatherService } from '@/services/weatherService'

// Main API client that aggregates all services
export const api = {
  // Authentication
  auth: {
    signInWithGoogle: () => authService.signInWithGoogle(),
    signOut: () => authService.signOut(),
    me: () => authService.me(),
    updateMe: (updates) => authService.updateMe(updates),
    getCurrentUser: () => authService.getCurrentUser(),
    getCurrentProfile: () => authService.getCurrentProfile(),
    isAuthenticated: () => authService.isAuthenticated(),
    checkAuth: () => authService.checkAuth()
  },

  // Clothing Items
  entities: {
    ClothingItem: {
      list: (orderBy = '-created_date', limit = 20) => clothesService.getClothes({ orderBy, limit }),
      get: (id) => clothesService.getClothesById(id),
      create: (data) => clothesService.addClothes(data),
      update: (id, data) => clothesService.updateClothes(id, data),
      delete: (id) => clothesService.deleteClothes(id),
      filter: (filters, orderBy = '-created_date', limit = 20) => clothesService.getClothes({ ...filters, orderBy, limit }),
      toggleFavorite: (id) => clothesService.toggleFavorite(id),
      search: (query) => clothesService.searchClothes(query)
    },

    User: {
      get: (id) => friendsService.getUser(id),
      search: (query) => friendsService.searchUsers(query),
      update: (id, data) => friendsService.updateUser(id, data)
    },

    Friend: {
      list: (orderBy = '-created_date') => friendsService.getFriends({ orderBy }),
      get: (id) => friendsService.getFriend(id),
      sendRequest: (userId) => friendsService.sendFriendRequest(userId),
      acceptRequest: (requestId) => friendsService.acceptFriendRequest(requestId),
      rejectRequest: (requestId) => friendsService.rejectFriendRequest(requestId),
      remove: (friendId) => friendsService.removeFriend(friendId),
      getRequests: () => friendsService.getFriendRequests()
    },

    Outfit: {
      list: (orderBy = '-created_date', limit = 20) => outfitsService.getOutfits({ orderBy, limit }),
      get: (id) => outfitsService.getOutfit(id),
      create: (data) => outfitsService.createOutfit(data),
      update: (id, data) => outfitsService.updateOutfit(id, data),
      delete: (id) => outfitsService.deleteOutfit(id),
      like: (id) => outfitsService.likeOutfit(id),
      unlike: (id) => outfitsService.unlikeOutfit(id),
      share: (id, friendIds) => outfitsService.shareOutfit(id, friendIds)
    },

    Notification: {
      list: (limit = 20) => notificationsService.getNotifications({ limit }),
      markAsRead: (id) => notificationsService.markAsRead(id),
      markAllAsRead: () => notificationsService.markAllAsRead(),
      delete: (id) => notificationsService.deleteNotification(id),
      getUnreadCount: () => notificationsService.getUnreadCount()
    }
  },

  // Feature-specific services
  outfits: {
    generateOutfit: (preferences) => outfitsService.generateOutfit(preferences),
    createOutfit: (outfitData) => outfitsService.createOutfit(outfitData),
    saveOutfit: (outfitData) => outfitsService.createOutfit(outfitData),
    getOutfitSuggestions: (itemId) => outfitsService.getOutfitSuggestions(itemId),
    getWeatherBasedOutfits: (weatherData) => outfitsService.getWeatherBasedOutfits(weatherData)
  },

  friends: {
    getFriends: () => friendsService.getFriends(),
    getFriendRequests: () => friendsService.getFriendRequests(),
    getSentRequests: () => friendsService.getSentRequests(),
    sendFriendRequest: (userId) => friendsService.sendFriendRequest(userId),
    acceptFriendRequest: (requestId) => friendsService.acceptFriendRequest(requestId),
    declineFriendRequest: (requestId) => friendsService.declineFriendRequest(requestId),
    searchUsers: (query) => friendsService.searchUsers(query),
    getActivityFeed: (limit = 20) => friendsService.getActivityFeed({ limit }),
    getMutualFriends: (userId) => friendsService.getMutualFriends(userId),
    getFriendSuggestions: () => friendsService.getFriendSuggestions()
  },

  catalog: {
    getCategories: () => catalogService.getCategories(),
    getBrands: () => catalogService.getBrands(),
    getColors: () => catalogService.getColors(),
    getStyles: () => catalogService.getStyles(),
    searchItems: (query) => catalogService.searchItems(query),
    getTrendingItems: () => catalogService.getTrendingItems()
  },

  analytics: {
    getWardrobeStats: () => analyticsService.getWardrobeStats(),
    getOutfitStats: () => analyticsService.getOutfitStats(),
    getStyleInsights: () => analyticsService.getStyleInsights(),
    getUsageStats: (period = '30d') => analyticsService.getUsageStats(period),
    getColorAnalysis: () => analyticsService.getColorAnalysis(),
    getBrandAnalysis: () => analyticsService.getBrandAnalysis()
  },

  weather: {
    getCurrentWeather: (location) => weatherService.getCurrentWeather(location),
    getWeatherForecast: (location, days = 5) => weatherService.getWeatherForecast(location, days),
    getWeatherBasedSuggestions: (weatherData) => weatherService.getWeatherBasedSuggestions(weatherData)
  },

  notifications: {
    subscribe: (callback) => notificationsService.subscribe(callback),
    unsubscribe: (subscription) => notificationsService.unsubscribe(subscription),
    sendNotification: (data) => notificationsService.sendNotification(data)
  }
}

export default api