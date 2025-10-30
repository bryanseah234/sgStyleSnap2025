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
    <!-- Global Loading Overlay: visible until all sections finish loading -->
    <div v-if="loadingAll" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-zinc-900">
      <div class="spinner-modern mb-4"></div>
      <div class="flex items-center gap-2 text-stone-600 dark:text-zinc-300">
        <Shirt class="w-5 h-5" />
        <span>Loading your dashboard…</span>
      </div>
    </div>
    <!-- Debug info -->
    <div v-if="!user" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
      <p class="text-yellow-800">Debug: No user data available</p>
      <p class="text-sm">Auth: {{ authStore.isAuthenticated }}, User: {{ !!authStore.user }}, Profile: {{ !!authStore.profile }}</p>
    </div>
    
    <!-- Loading Bar Animation -->
    <div class="h-1 w-full mb-12 rounded-full bg-gradient-to-r from-stone-300 via-black to-stone-300 dark:from-zinc-700 dark:via-white dark:to-zinc-700" />

    <!-- Hero Section with Liquid Glass Reveal -->
    <div 
      ref="heroRef"
      class="max-w-6xl mx-auto mb-16 liquid-reveal relative"
      v-scroll-animate.up
      @mousemove="handleHeroMouseMove"
      @mouseleave="handleHeroMouseLeave"
    >
      <h1 
        class="text-4xl font-bold mb-4 text-foreground"
      >
        Welcome back{{ userName }}
      </h1>
      <!-- Notifications Badge (top-right) -->
      <button
        class="absolute top-0 right-0 inline-flex items-center gap-2 px-3 py-2 rounded-full border border-stone-200 bg-white/90 backdrop-blur text-stone-700 hover:text-black hover:bg-white shadow-sm transition dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-300 dark:hover:text-white"
        @click="showNotificationsModal = true"
        title="View notifications"
      >
        <Bell class="w-5 h-5" />
        <span class="text-sm font-medium">Notifications</span>
        <span
          class="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold text-white bg-red-500"
        >
          {{ unreadCount }}
        </span>
      </button>
      <p 
        class="text-xl md:text-2xl liquid-text text-stone-600 dark:text-zinc-400 max-w-2xl"
      >
        Your digital wardrobe awaits. Create stunning outfits, discover new styles, and share your fashion journey.
      </p>
    </div>

    <!-- Notifications Section replaced by badge + modal -->

    <!-- Stats Cards with Liquid Glass Hover - Second on mobile -->
    <div class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <router-link
        v-for="(stat, index) in stats"
        :key="stat.label"
        :to="stat.route"
        v-scroll-animate.up
        class="liquid-card p-8 rounded-3xl group cursor-pointer bg-white border border-stone-200 hover:border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700"
        :style="{ transitionDelay: `${index * 100}ms` }"
        @mouseenter="handleCardHover($event, index)"
        @mouseleave="handleCardLeave($event, index)"
        @mousemove="handleCardMouseMove($event, index)"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="liquid-icon p-3 rounded-2xl bg-stone-100 dark:bg-zinc-800">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <span class="text-4xl font-bold text-foreground liquid-number">
            {{ stat.value }}
          </span>
        </div>
        <p class="text-lg font-medium liquid-text text-stone-600 dark:text-zinc-400">
          {{ stat.label }}
        </p>
      </router-link>
    </div>

  </div>

  <!-- Notifications Modal -->
  <div v-if="showNotificationsModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="showNotificationsModal = false" />
    <!-- Modal Content -->
    <div class="relative z-10 w-[92%] sm:w-[560px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-zinc-800">
        <div class="flex items-center gap-2">
          <Bell class="w-5 h-5" />
          <h3 class="text-lg font-semibold">Notifications</h3>
          <span class="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold text-white bg-red-500">{{ unreadCount }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-black hover:bg-stone-100 transition dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
          >
            Mark all as read
          </button>
          <button
            class="p-2 rounded-lg text-stone-600 hover:text-black hover:bg-stone-100 transition dark:text-zinc-400 dark:hover:text-white dark:hover:bg-zinc-800"
            @click="showNotificationsModal = false"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <!-- Body -->
      <div class="p-4 overflow-y-auto" style="max-height: calc(80vh - 64px);">
        <div v-if="loadingNotifications" class="flex flex-col items-center justify-center py-12">
          <div class="w-12 h-12 spinner-modern mb-4"></div>
          <p class="text-sm text-stone-600 dark:text-zinc-400">Loading notifications...</p>
        </div>
        <div v-else-if="notifications.length > 0" class="space-y-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            @click="handleNotificationClick(notification)"
            :class="`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
              notification.is_read
                ? 'bg-stone-50 border border-stone-200 dark:bg-zinc-800/50 dark:border-zinc-800'
                : 'bg-stone-100 border border-stone-300 dark:bg-zinc-800 dark:border-zinc-700'
            }`"
          >
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg flex-shrink-0 bg-white dark:bg-zinc-700">
                <component :is="getNotificationIcon(notification.type)" class="w-5 h-5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <h4 class="font-semibold text-sm text-foreground">{{ getNotificationTitle(notification) }}</h4>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span class="text-xs text-stone-500 dark:text-zinc-500">{{ formatTimeAgo(notification.created_at) }}</span>
                    <div v-if="!notification.is_read" class="w-2 h-2 rounded-full bg-blue-500" title="Unread" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-stone-100 dark:bg-zinc-800">
            <Bell class="w-8 h-8 text-stone-500 dark:text-zinc-400" />
          </div>
          <p class="text-lg font-medium text-stone-600 dark:text-zinc-400">No notifications yet</p>
          <p class="text-sm mt-1 text-stone-500 dark:text-zinc-500">We'll notify you when something happens</p>
        </div>
      </div>
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
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/api/base44Client'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { NotificationsService } from '@/services/notificationsService'
import { UserService } from '@/services/userService'
import { vScrollAnimate } from '@/composables/useScrollAnimation'
import { useLiquidReveal, useLiquidHover } from '@/composables/useLiquidGlass'
import { Shirt, Palette, Users, Bell, UserPlus, Heart, Share2, Sparkles, CloudRain, Check, CheckCheck } from 'lucide-vue-next'

// Theme and auth composables
const { theme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()

// Liquid glass composables
const { elementRef: heroRef, reveal: heroReveal } = useLiquidReveal()
const { elementRef: cardRefs, hoverIn: cardHoverIn, hoverOut: cardHoverOut } = useLiquidHover()

// Service instances
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()
const notificationsService = new NotificationsService()
const userService = new UserService()

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
const loadingNotifications = ref(false) // Loading state for notifications
const showNotificationsModal = ref(false)
const loadingAll = ref(true) // Global loading gate for the whole page

/**
 * Computed statistics for the dashboard cards
 * 
 * Calculates and returns statistics for items, outfits, and friends
 * to display in the dashboard cards.
 * 
 * @returns {Array<Object>} Array of stat objects with label, value, icon, and route
 */
const stats = computed(() => [
  { label: 'Closet', value: totalItemsCount.value, icon: Shirt, route: '/closet' },
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
    loadingNotifications.value = true
    if (user.value?.id) {
      const [notificationsData, count] = await Promise.all([
        notificationsService.getNotifications({ limit: 5 }),
        notificationsService.getUnreadCount()
      ])
      
      // Enrich notifications with actor first names for personalisation
      const base = notificationsData || []
      const actorIds = Array.from(new Set((base
        .map(n => n.actor_id)
        .filter(Boolean)) as string[]))

      let actorMap = new Map()
      if (actorIds.length > 0) {
        const profiles = await Promise.all(
          actorIds.map(async (id) => ({ id, profile: await userService.getUserById(id) }))
        )
        profiles.forEach(({ id, profile }) => {
          if (profile?.name || profile?.username) {
            const full = profile.name || profile.username
            const first = String(full).split(' ')[0]
            actorMap.set(id, first)
          }
        })
      }

      notifications.value = base.map(n => ({
        ...n,
        actor_first_name: n.actor_id ? actorMap.get(n.actor_id) : undefined
      }))
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
  } finally {
    loadingNotifications.value = false
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
 * Handles notification click - navigates to appropriate page and marks as read
 */
const handleNotificationClick = async (notification) => {
  // Mark as read first
  await markNotificationAsRead(notification)
  
  // Navigate based on notification type
  switch (notification.type) {
    case 'friend_request':
      // Navigate to friend requests (received) page
      router.push('/friends/requests/received')
      break
    case 'friend_request_accepted':
      // Navigate to friends page
      router.push('/friends')
      break
    case 'outfit_shared':
      // Navigate to outfits page
      router.push('/outfits')
      break
    case 'friend_outfit_suggestion':
      // Navigate to outfit suggestions page
      router.push('/outfits/suggested')
      break
    case 'outfit_like':
      // Navigate to outfits page
      router.push('/outfits')
      break
    case 'item_like':
      // Navigate to closet page
      router.push('/closet')
      break
    default:
      // Default to notifications page if it exists
      console.log('Unknown notification type:', notification.type)
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
  const first = notification.actor_first_name
  const someone = first ? first : 'Someone'
  const messages = {
    friend_request: `${someone} sent you a friend request`,
    friend_request_accepted: `${someone} accepted your friend request`,
    outfit_shared: `${someone} shared an outfit with you`,
    friend_outfit_suggestion: `${someone} suggested an outfit using your items`,
    outfit_like: `${someone} liked your outfit`,
    item_like: `${someone} liked your closet item`
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
    
    console.log('🏠 Home: Loading items/outfits/friends/notifications in parallel...')
    await Promise.all([
      loadItems(),
      loadOutfits(),
      loadFriends(),
      loadNotifications()
    ])
    console.log('🏠 Home: All data loaded successfully')
  } catch (error) {
    console.error('❌ Home: Error loading data:', error)
  }
  finally {
    loadingAll.value = false
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
