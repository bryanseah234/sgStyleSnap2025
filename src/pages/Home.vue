<!--
  StyleSnap - Home Page Component
  
  The main dashboard page that displays user statistics, recent items,
  and quick access to key features. Provides an overview of the user's
  wardrobe and activity.
  
  Features:
  - Personalized welcome message
  - Statistics cards (items, outfits, friends)
  - Recent items preview
  - Quick action cards
  - Responsive design
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <!-- Debug info -->
    <div v-if="!user" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
      <p class="text-yellow-800">Debug: No user data available</p>
      <p class="text-sm">Auth: {{ authStore.isAuthenticated }}, User: {{ !!authStore.user }}, Profile: {{ !!authStore.profile }}</p>
    </div>
    
    <!-- Loading Bar Animation -->
    <div :class="`h-1 w-full mb-12 rounded-full ${
      theme.value === 'dark' 
        ? 'bg-gradient-to-r from-zinc-700 via-white to-zinc-700' 
        : 'bg-gradient-to-r from-stone-300 via-black to-stone-300'
    }`" />

    <!-- Hero Section with Liquid Glass Reveal -->
    <div 
      ref="heroRef"
      class="max-w-6xl mx-auto mb-16 liquid-reveal"
      v-scroll-animate.up
      @mousemove="handleHeroMouseMove"
      @mouseleave="handleHeroMouseLeave"
    >
      <h1 
        class="text-5xl md:text-7xl font-bold tracking-tight mb-4 liquid-text text-foreground"
      >
        Welcome back{{ userName }}
      </h1>
      <p 
        :class="`text-xl md:text-2xl liquid-text ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        } max-w-2xl`"
      >
        Your digital wardrobe awaits. Create stunning outfits, discover new styles, and share your fashion journey.
      </p>
    </div>

    <!-- Notifications Section - First on mobile -->
    <div class="max-w-6xl mx-auto mb-16" v-scroll-animate.scale>
      <div :class="`p-8 rounded-3xl transition-all duration-300 ${
        theme.value === 'dark'
          ? 'bg-zinc-900 border border-zinc-800'
          : 'bg-white border border-stone-200'
      }`">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <div :class="`p-3 rounded-2xl ${
              theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
            }`">
              <Bell class="w-6 h-6" />
            </div>
            <div>
              <h2 class="text-2xl font-bold text-foreground">
                Notifications
              </h2>
              <p v-if="unreadCount > 0" :class="`text-sm ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">
                {{ unreadCount }} unread
              </p>
            </div>
          </div>
          
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            :class="`text-sm px-4 py-2 rounded-lg transition-all duration-200 ${
              theme.value === 'dark'
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                : 'text-stone-600 hover:text-black hover:bg-stone-100'
            }`"
          >
            Mark all as read
          </button>
        </div>

        <!-- Notifications List -->
        <div v-if="notifications.length > 0" class="space-y-3">
          <div
            v-for="(notification, index) in notifications"
            :key="notification.id"
            @click="markNotificationAsRead(notification)"
            :class="`stagger-item p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              notification.is_read
                ? theme.value === 'dark'
                  ? 'bg-zinc-800/50 border border-zinc-800'
                  : 'bg-stone-50 border border-stone-200'
                : theme.value === 'dark'
                ? 'bg-zinc-800 border border-zinc-700'
                : 'bg-stone-100 border border-stone-300'
            }`"
          >
            <div class="flex items-start gap-4">
              <!-- Icon -->
              <div :class="`p-2 rounded-lg flex-shrink-0 ${
                theme.value === 'dark' ? 'bg-zinc-700' : 'bg-white'
              }`">
                <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-sm mb-1 text-foreground">
                      {{ getNotificationTitle(notification) }}
                    </h3>
                    <p :class="`text-sm ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                    }`">
                      {{ getNotificationMessage(notification) }}
                    </p>
                  </div>
                  
                  <!-- Time and unread indicator -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span :class="`text-xs ${
                      theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
                    }`">
                      {{ formatTimeAgo(notification.created_at) }}
                    </span>
                    <div
                      v-if="!notification.is_read"
                      class="w-2 h-2 rounded-full bg-blue-500"
                      title="Unread"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div :class="`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
          }`">
            <Bell :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
          </div>
          <p :class="`text-lg font-medium ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            No notifications yet
          </p>
          <p :class="`text-sm mt-1 ${
            theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
          }`">
            We'll notify you when something happens
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Cards with Liquid Glass Hover - Second on mobile -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <router-link
        v-for="(stat, index) in stats"
        :key="stat.label"
        :to="stat.route"
        v-scroll-animate.up
        class="liquid-card p-8 rounded-3xl group cursor-pointer bg-white border border-stone-200 hover:border-stone-300"
        :style="{ transitionDelay: `${index * 100}ms` }"
        @mouseenter="handleCardHover($event, index)"
        @mouseleave="handleCardLeave($event, index)"
        @mousemove="handleCardMouseMove($event, index)"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="liquid-icon p-3 rounded-2xl bg-stone-100">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <span class="text-4xl font-bold text-foreground liquid-number">
            {{ stat.value }}
          </span>
        </div>
        <p class="text-lg font-medium liquid-text text-stone-600">
          {{ stat.label }}
        </p>
      </router-link>
    </div>

  </div>
</template>

<script setup>
/**
 * Home Page Component Script
 * 
 * Manages the home dashboard with user statistics, recent items,
 * and quick access to key features. Loads and displays user data
 * including wardrobe items, outfits, and friends.
 */

import { ref, onMounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/api/base44Client'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { NotificationsService } from '@/services/notificationsService'
import { vScrollAnimate } from '@/composables/useScrollAnimation'
import { useLiquidReveal, useLiquidHover } from '@/composables/useLiquidGlass'
import { Shirt, Palette, Users, Bell, UserPlus, Heart, Share2, Sparkles, CloudRain, Check } from 'lucide-vue-next'

// Theme and auth composables
const { theme } = useTheme()
const authStore = useAuthStore()

// Liquid glass composables
const { elementRef: heroRef, reveal: heroReveal } = useLiquidReveal()
const { elementRef: cardRefs, hoverIn: cardHoverIn, hoverOut: cardHoverOut } = useLiquidHover()

// Service instances
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()
const notificationsService = new NotificationsService()

// Use computed to get reactive user data from auth store
const user = computed(() => {
  const userData = authStore.user || authStore.profile
  console.log('🏠 Home: User computed property accessed:', {
    authStoreUser: authStore.user,
    authStoreProfile: authStore.profile,
    computedUser: userData
  })
  return userData
})

// Get user's first name for welcome message
const userName = computed(() => {
  // Try to get name from various sources
  // Priority:
  // 1. Profile name (from database users table)
  // 2. User metadata name (from Google OAuth)
  // 3. Auth store userName getter
  const fullName = authStore.profile?.name || 
                   user.value?.name || 
                   user.value?.user_metadata?.name || 
                   user.value?.user_metadata?.full_name || 
                   authStore.userName
  
  console.log('🏠 Home: userName computed:', {
    'authStore.profile': authStore.profile,
    'authStore.profile.name': authStore.profile?.name,
    'user.value': user.value,
    'user.value.name': user.value?.name,
    'user_metadata.name': user.value?.user_metadata?.name,
    'authStore.userName': authStore.userName,
    'resolved fullName': fullName
  })
  
  if (fullName && fullName !== 'User') {
    // Extract first name
    const firstName = fullName.split(' ')[0]
    return `, ${firstName}`
  }
  
  return '' // No name, just show "Welcome back"
})

// Reactive data for content
const items = ref([])
const outfits = ref([])
const friends = ref([])
const notifications = ref([])
const unreadCount = ref(0)
const totalItemsCount = ref(0) // Total count of all items in closet

/**
 * Computed statistics for the dashboard cards
 * 
 * Calculates and returns statistics for items, outfits, and friends
 * to display in the dashboard cards.
 * 
 * @returns {Array<Object>} Array of stat objects with label, value, icon, and route
 */
const stats = computed(() => [
  { label: 'Items', value: totalItemsCount.value, icon: Shirt, route: '/closet' },
  { label: 'Outfits', value: outfits.value.length, icon: Palette, route: '/outfits' },
  { label: 'Friends', value: friends.value.length, icon: Users, route: '/friends' },
])

/**
 * Loads user's clothing items and total count
 * 
 * Fetches the user's total items count for statistics
 * and the 6 most recent items for the dashboard preview.
 */
const loadItems = async () => {
  try {
    console.log('🏠 Home: Loading items...')
    if (user.value?.id) {
      // Get total items count from stats
      const statsResult = await clothesService.getClothesStats()
      if (statsResult && statsResult.success) {
        totalItemsCount.value = statsResult.data.total_items || 0
        console.log('🏠 Home: Total items count:', totalItemsCount.value)
      } else {
        totalItemsCount.value = 0
      }
      
      // Still load recent items for any potential display (future feature)
      const result = await clothesService.getClothes({
        owner_id: user.value.id,
        limit: 6
      })
      
      if (result.success) {
        items.value = result.data || []
        console.log('🏠 Home: Items loaded successfully:', items.value.length, 'recent items')
      } else {
        console.error('🏠 Home: Failed to load items:', result.error)
        items.value = []
      }
    } else {
      console.log('🏠 Home: No user ID, setting items to empty array')
      items.value = []
      totalItemsCount.value = 0
    }
  } catch (error) {
    console.error('❌ Home: Error loading items:', error)
    items.value = []
    totalItemsCount.value = 0
  }
}

/**
 * Loads user's outfits
 * 
 * Fetches the user's outfits from the API, limited to
 * the 3 most recent outfits for the dashboard preview.
 */
const loadOutfits = async () => {
  try {
    console.log('🏠 Home: Loading outfits...')
    if (user.value?.id) {
      const outfitsData = await outfitsService.getOutfits({
        limit: 3
      })
      
      outfits.value = outfitsData || []
      console.log('🏠 Home: Outfits loaded successfully:', outfits.value.length, 'outfits')
    } else {
      console.log('🏠 Home: No user ID, setting outfits to empty array')
      outfits.value = []
    }
  } catch (error) {
    console.error('❌ Home: Error loading outfits:', error)
    outfits.value = []
  }
}

/**
 * Loads user's friends
 * 
 * Fetches the user's friends list from the API to display
 * the friends count in the statistics.
 */
const loadFriends = async () => {
  try {
    console.log('🏠 Home: Loading friends...')
    if (user.value?.id) {
      const friendsData = await friendsService.getFriends()
      
      friends.value = friendsData || []
      console.log('🏠 Home: Friends loaded successfully:', friends.value.length, 'friends')
    } else {
      console.log('🏠 Home: No user ID, setting friends to empty array')
      friends.value = []
    }
  } catch (error) {
    console.error('❌ Home: Error loading friends:', error)
    friends.value = []
  }
}

/**
 * Loads user's notifications
 * 
 * Fetches the user's recent notifications from Supabase
 * and displays them in the notifications section.
 */
const loadNotifications = async () => {
  try {
    console.log('🏠 Home: Loading notifications...')
    if (user.value?.id) {
      const [notificationsData, count] = await Promise.all([
        notificationsService.getNotifications({ limit: 5 }),
        notificationsService.getUnreadCount()
      ])
      
      notifications.value = notificationsData || []
      unreadCount.value = count || 0
      console.log('🏠 Home: Notifications loaded successfully:', notifications.value.length, 'notifications,', unreadCount.value, 'unread')
    } else {
      console.log('🏠 Home: No user ID, setting notifications to empty array')
      notifications.value = []
      unreadCount.value = 0
    }
  } catch (error) {
    console.error('❌ Home: Error loading notifications:', error)
    notifications.value = []
    unreadCount.value = 0
  }
}

/**
 * Marks a notification as read
 */
const markNotificationAsRead = async (notification) => {
  if (notification.is_read) return
  
  try {
    await notificationsService.markAsRead(notification.id)
    notification.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
  } catch (error) {
    console.error('❌ Home: Error marking notification as read:', error)
  }
}

/**
 * Marks all notifications as read
 */
const markAllAsRead = async () => {
  try {
    await notificationsService.markAllAsRead()
    notifications.value.forEach(notification => {
      notification.is_read = true
    })
    unreadCount.value = 0
  } catch (error) {
    console.error('❌ Home: Error marking all notifications as read:', error)
  }
}

/**
 * Gets the appropriate icon for a notification type
 */
const getNotificationIcon = (type) => {
  const icons = {
    friend_request: UserPlus,
    friend_request_accepted: Check,
    outfit_shared: Share2,
    friend_outfit_suggestion: Sparkles,
    outfit_like: Heart,
    item_like: Heart
  }
  return icons[type] || Bell
}

/**
 * Gets notification title based on type
 */
const getNotificationTitle = (notification) => {
  const titles = {
    friend_request: 'New Friend Request',
    friend_request_accepted: 'Friend Request Accepted',
    outfit_shared: 'Outfit Shared',
    friend_outfit_suggestion: 'Outfit Suggestion',
    outfit_like: 'Outfit Liked',
    item_like: 'Item Liked'
  }
  return titles[notification.type] || 'Notification'
}

/**
 * Gets notification message based on type and data
 */
const getNotificationMessage = (notification) => {
  // If there's a custom message, use it
  if (notification.custom_message) {
    return notification.custom_message
  }

  // Generate message based on type
  const messages = {
    friend_request: 'Someone sent you a friend request',
    friend_request_accepted: 'Your friend request was accepted',
    outfit_shared: 'Someone shared an outfit with you',
    friend_outfit_suggestion: 'Someone created an outfit suggestion using your items',
    outfit_like: 'Someone liked your outfit',
    item_like: 'Someone liked your closet item'
  }
  return messages[notification.type] || 'You have a new notification'
}

/**
 * Formats time ago for notifications
 */
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now - date) / 1000)
  
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Component mounted lifecycle hook
 * 
 * Loads all necessary data when the component is mounted:
 * - User profile data
 * - Recent clothing items
 * - Recent outfits
 * - Friends list
 */
onMounted(async () => {
  console.log('🏠 Home: Component mounted, starting data loading...')
  console.log('🏠 Home: Auth state:', {
    isAuthenticated: authStore.isAuthenticated,
    hasUser: !!authStore.user,
    hasProfile: !!authStore.profile,
    loading: authStore.loading
  })
  
  try {
    // Ensure auth store is initialized
    if (!authStore.isAuthenticated) {
      console.log('🏠 Home: Auth not initialized, calling initializeAuth...')
      await authStore.initializeAuth()
    }
    
    // If we have a user but no profile, fetch the profile
    if (authStore.user && !authStore.profile) {
      console.log('🏠 Home: User found but no profile, fetching profile...')
      await authStore.fetchUserProfile()
    }
    
    console.log('🏠 Home: Loading items...')
    await loadItems()
    console.log('🏠 Home: Loading outfits...')
    await loadOutfits()
    console.log('🏠 Home: Loading friends...')
    await loadFriends()
    console.log('🏠 Home: Loading notifications...')
    await loadNotifications()
    console.log('🏠 Home: All data loaded successfully')
  } catch (error) {
    console.error('❌ Home: Error loading data:', error)
  }
})

// Liquid glass event handlers
const handleHeroMouseMove = (event) => {
  // Apply parallax distortion to hero text
  const heroText = event.target.querySelector('.liquid-text')
  if (heroText) {
    const rect = event.target.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotateX = (y - centerY) / centerY * 2
    const rotateY = (x - centerX) / centerX * 2
    
    heroText.style.transform = `translateZ(5px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`
  }
}

const handleHeroMouseLeave = () => {
  // Reset hero distortion
  const heroTexts = document.querySelectorAll('.liquid-text')
  heroTexts.forEach(text => {
    text.style.transform = 'translateZ(0px) rotateX(0deg) rotateY(0deg)'
  })
}

const handleCardHover = (event, index) => {
  cardHoverIn(event.target)
}

const handleCardLeave = (event, index) => {
  cardHoverOut(event.target)
}

const handleCardMouseMove = (event, index) => {
  // Apply subtle parallax to cards
  const card = event.target
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = (y - centerY) / centerY * 2
  const rotateY = (x - centerX) / centerX * 2
  
  card.style.transform = `translateY(-8px) translateZ(15px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`
}
</script>
