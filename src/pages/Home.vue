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
  <div class="min-h-0 md:min-h-screen p-4 md:p-12 pb-4 md:pb-12 bg-background max-w-full overflow-x-hidden">
    <!-- Right-side Loading Spinner: keeps nav and top content visible -->
    <!-- Debug info -->
    <div v-if="!user" class="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
      <p class="text-yellow-800">Debug: No user data available</p>
      <p class="text-sm">Auth: {{ authStore.isAuthenticated }}, User: {{ !!authStore.user }}, Profile: {{ !!authStore.profile }}</p>
    </div>
    
    <!-- Loading Bar Animation -->
    <div class="h-1 w-full mb-8 md:mb-12 rounded-full bg-gradient-to-r from-stone-300 via-black to-stone-300 dark:from-zinc-700 dark:via-white dark:to-zinc-700" />

    <!-- Hero Section with Liquid Glass Reveal -->
    <div 
      ref="heroRef"
      class="max-w-6xl mx-auto mb-8 md:mb-12 liquid-reveal relative"
      v-scroll-animate.up
      @mousemove="handleHeroMouseMove"
      @mouseleave="handleHeroMouseLeave"
    >
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <h1 class="text-[3.375rem] md:text-[3.375rem] font-bold text-foreground text-left leading-tight">
          Welcome Back{{ userName }}
        </h1>
        <button
          class="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-gray-300 dark:text-black dark:hover:bg-gray-400 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed w-[160px] min-w-[160px] max-w-[160px] flex-shrink-0 self-start md:self-auto"
          @click="showNotificationsModal = true"
          :disabled="loadingAll || loadingNotifications"
          :aria-disabled="(loadingAll || loadingNotifications) ? 'true' : 'false'"
          title="View notifications"
        >
          <div class="relative flex-shrink-0">
            <Bell class="w-5 h-5 dark:text-black" />
            <span v-if="unreadCount > 0" class="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold text-white bg-red-500">
              {{ unreadCount }}
            </span>
          </div>
          <span class="font-medium whitespace-nowrap">Notifications</span>
        </button>
      </div>
      <p 
        class="text-xl md:text-2xl liquid-text text-stone-600 dark:text-zinc-400 max-w-2xl"
      >
        Your digital wardrobe awaits. Create stunning outfits, discover new styles, and share your fashion journey.
      </p>
    </div>

    <!-- Main Content Below Hero: Spinner/cards area -->
    <div class="max-w-6xl mx-auto min-h-[200px]">
      <div v-if="loadingAll" class="flex justify-center items-center min-h-[200px] py-12">
        <div class="spinner-modern" style="width:64px;height:64px;"></div>
      </div>
      <div v-else>
        <!-- Mobile-only themed cards -->
        <div class="md:hidden grid grid-cols-3 gap-4 mb-8 md:mb-16">
          <router-link
            v-for="(stat, index) in stats"
            :key="stat.label"
            :to="stat.route"
            class="p-4 rounded-xl cursor-pointer bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 transition-all active:scale-95"
          >
            <div class="flex flex-col items-center text-center">
              <!-- Icon at top center -->
              <div class="mb-3">
                <component :is="stat.icon" class="w-6 h-6 text-stone-700 dark:text-zinc-300 mx-auto stroke-2" />
              </div>
              <!-- Number in middle -->
              <span class="text-4xl font-bold text-stone-800 dark:text-zinc-200 mb-1">
                {{ stat.value }}
              </span>
              <!-- Label at bottom -->
              <p class="text-sm font-medium text-stone-600 dark:text-zinc-400">
                {{ stat.label }}
              </p>
            </div>
          </router-link>
        </div>

        <!-- Desktop cards (hidden on mobile) -->
        <div class="hidden md:grid grid-cols-3 gap-6 mb-8 md:mb-16">
          <router-link
            v-for="(stat, index) in stats"
            :key="stat.label"
            :to="stat.route"
            v-scroll-animate.up
            class="nav-item-liquid p-6 rounded-xl cursor-pointer bg-white border border-stone-200 hover:border-stone-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700 transition-all hover:shadow-md"
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <div class="flex flex-col items-center text-center">
              <!-- Icon at top center -->
              <div class="mb-4">
                <component :is="stat.icon" class="w-8 h-8 text-stone-700 dark:text-zinc-300 mx-auto" />
              </div>
              <!-- Number in middle -->
              <span class="text-5xl font-bold text-stone-800 dark:text-zinc-200 mb-2">
                {{ stat.value }}
              </span>
              <!-- Label at bottom -->
              <p class="text-base font-medium text-stone-600 dark:text-zinc-400">
                {{ stat.label }}
              </p>
            </div>
          </router-link>
        </div>
      </div>
    </div>

  </div>

  <!-- Notifications Modal -->
  <div v-if="showNotificationsModal" class="fixed inset-0 z-50 flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/40" @click="showNotificationsModal = false" />
      <!-- Modal Content -->
      <div class="relative z-10 w-[480px] max-w-[92vw] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 flex flex-col" @click="closeContextMenu">
      <!-- Header -->
      <div class="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-zinc-800 flex-shrink-0">
        <div class="flex items-center gap-2">
          <Bell class="w-5 h-5" />
          <h3 class="text-lg font-semibold">Notifications</h3>
          <span v-if="unreadCount > 0" class="ml-1 inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full text-xs font-bold text-white bg-red-500">{{ unreadCount }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-700 hover:text-black hover:bg-stone-100 transition dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
          >
            Mark all as read
          </button>
          <div class="flex items-center gap-2">
            <!-- ESC Key Hint (Desktop only) -->
            <div v-if="isDesktop" class="keyboard-hint-modal">
              <span class="keyboard-hint-key">ESC</span>
            </div>
            <button
              @click="showNotificationsModal = false"
              class="p-2 rounded-lg transition-all bg-white/90 shadow-lg hover:bg-stone-100 text-stone-600 hover:text-black dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
              aria-label="Close"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      <!-- Body - Scrollable Content -->
      <div class="p-4 overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar" style="scroll-behavior: smooth; overscroll-behavior: contain;">
        <div v-if="loadingNotifications" class="flex flex-col items-center justify-center py-12">
          <div class="w-12 h-12 spinner-modern mb-4"></div>
          <p class="text-sm text-stone-600 dark:text-zinc-400">Loading notifications...</p>
        </div>
        <div v-else-if="notifications.length > 0" class="space-y-3">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-item relative overflow-hidden"
            :class="`rounded-xl transition-all duration-200 ${
              notification.is_read
                ? 'bg-stone-50 border border-stone-200 dark:bg-zinc-800/50 dark:border-zinc-800'
                : 'bg-stone-100 border border-stone-300 dark:bg-zinc-800 dark:border-zinc-700'
            }`"
            :style="{ transform: `translateX(${notification.swipeOffset || 0}px)` }"
            @touchstart="handleTouchStart($event, notification)"
            @touchmove="handleTouchMove($event, notification)"
            @touchend="handleTouchEnd($event, notification)"
            @click="handleNotificationClick(notification)"
            @contextmenu.prevent="handleRightClick($event, notification)"
          >
            <!-- Swipe Action Indicator (Left side when swiping left) -->
            <div 
              v-if="notification.swipeOffset && notification.swipeOffset < -30"
              class="absolute inset-y-0 left-0 flex items-center justify-center px-4 transition-opacity duration-200 bg-blue-500 text-white"
              style="width: 120px;"
            >
              <span class="text-sm font-medium">
                {{ notification.is_read ? 'Mark Unread' : 'Mark Read' }}
              </span>
            </div>
            
            <!-- Notification Content -->
            <div class="p-4 cursor-pointer hover:scale-[1.01]" :class="{ 'pointer-events-none': Math.abs(notification.swipeOffset || 0) > 10 }">
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
                  <p class="text-xs mt-1 truncate text-stone-600 dark:text-zinc-400">{{ getNotificationMessage(notification) }}</p>
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
        
        <!-- Context Menu for Desktop (Right-click) -->
        <div
          v-if="contextMenu.visible"
          class="fixed z-[100] bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-lg shadow-xl py-1 min-w-[160px]"
          :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
          @click.stop
        >
          <button
            v-if="contextMenu.notification?.is_read"
            @click="handleContextMenuAction('mark-unread', contextMenu.notification)"
            class="w-full px-4 py-2 text-left text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Mark as Unread
          </button>
          <button
            v-else
            @click="handleContextMenuAction('mark-read', contextMenu.notification)"
            class="w-full px-4 py-2 text-left text-sm text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Mark as Read
          </button>
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

import { ref, onMounted, onUnmounted, computed } from 'vue'
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
import { useLiquidReveal } from '@/composables/useLiquidGlass'
import { Shirt, Layers, Users, Bell, UserPlus, Heart, Share2, Sparkles, CloudRain, Check, CheckCheck, X } from 'lucide-vue-next'

// Theme and auth composables
const { theme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()

// Liquid glass composables
const { elementRef: heroRef, reveal: heroReveal } = useLiquidReveal()
// Card hover effects removed - using simpler card style

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
  
  return '' // No name, just show "Welcome Back"
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

// Desktop detection for keyboard hints
const isDesktop = ref(false)
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

// ESC key handler for notifications modal
const handleEsc = (e) => {
  if (e.key === 'Escape') {
    if (contextMenu.value.visible) {
      closeContextMenu()
    } else if (showNotificationsModal.value) {
      showNotificationsModal.value = false
    }
  }
}

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
  { label: 'Outfits', value: outfits.value.length, icon: Layers, route: '/outfits' },
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
      const actorIds = Array.from(new Set(
        base
          .map(n => n.actor_id)
          .filter(Boolean)
      ))

      let actorMap = new Map()
      if (actorIds.length > 0) {
        const profiles = await Promise.all(
          actorIds.map(async (id) => ({ id, profile: await userService.getUserById(id) }))
        )
        profiles.forEach(({ id, profile }) => {
          if (profile?.username || profile?.name) {
            const full = profile.name || profile.username
            const first = String(full).split(' ')[0]
            const username = profile.username || undefined
            actorMap.set(id, { first, username })
          }
        })
      }

      notifications.value = base.map(n => ({
        ...n,
        actor_first_name: n.actor_id ? actorMap.get(n.actor_id)?.first : undefined,
        actor_username: n.actor_id ? actorMap.get(n.actor_id)?.username : undefined
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

// Swipe gesture state
const touchStartX = ref(0)
const touchStartY = ref(0)
const isSwiping = ref(false)

// Context menu state for desktop right-click
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  notification: null
})

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
 * Marks a notification as unread
 */
const markNotificationAsUnread = async (notification) => {
  if (!notification.is_read) return
  
  try {
    await notificationsService.markAsUnread(notification.id)
    notification.is_read = false
    unreadCount.value += 1
  } catch (error) {
    console.error('❌ Home: Error marking notification as unread:', error)
  }
}

/**
 * Toggles notification read/unread status
 */
const toggleNotificationReadStatus = async (notification) => {
  if (notification.is_read) {
    await markNotificationAsUnread(notification)
  } else {
    await markNotificationAsRead(notification)
  }
}

/**
 * Handles touch start for swipe gesture
 */
const handleTouchStart = (event, notification) => {
  const touch = event.touches[0]
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  isSwiping.value = false
  if (!notification.swipeOffset) {
    notification.swipeOffset = 0
  }
}

/**
 * Handles touch move for swipe gesture
 */
const handleTouchMove = (event, notification) => {
  if (!touchStartX.value) return
  
  const touch = event.touches[0]
  const deltaX = touch.clientX - touchStartX.value
  const deltaY = touch.clientY - touchStartY.value
  
  // Only allow horizontal swipes (left swipe)
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
    isSwiping.value = true
    event.preventDefault()
    
    // Only allow swiping left (negative deltaX)
    if (deltaX < 0) {
      notification.swipeOffset = Math.max(deltaX, -120) // Max swipe distance
    }
  }
}

/**
 * Handles touch end for swipe gesture
 */
const handleTouchEnd = (event, notification) => {
  if (!isSwiping.value) {
    touchStartX.value = 0
    touchStartY.value = 0
    return
  }
  
  const swipeThreshold = 60 // Minimum swipe distance to trigger action
  
  if (notification.swipeOffset <= -swipeThreshold) {
    // Swipe left completed - toggle read/unread
    toggleNotificationReadStatus(notification)
  }
  
  // Reset swipe offset
  notification.swipeOffset = 0
  touchStartX.value = 0
  touchStartY.value = 0
  isSwiping.value = false
}

/**
 * Handles right-click context menu on desktop
 */
const handleRightClick = (event, notification) => {
  event.preventDefault()
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    notification: notification
  }
}

/**
 * Closes context menu
 */
const closeContextMenu = () => {
  contextMenu.value = {
    visible: false,
    x: 0,
    y: 0,
    notification: null
  }
}

/**
 * Handles context menu action
 */
const handleContextMenuAction = async (action, notification) => {
  closeContextMenu()
  
  if (action === 'toggle-read') {
    await toggleNotificationReadStatus(notification)
  } else if (action === 'mark-read' && !notification.is_read) {
    await markNotificationAsRead(notification)
  } else if (action === 'mark-unread' && notification.is_read) {
    await markNotificationAsUnread(notification)
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
  // Don't trigger click if user was swiping
  if (isSwiping.value) {
    return
  }
  
  // Mark as read first
  await markNotificationAsRead(notification)
  
  // Close notifications modal
  showNotificationsModal.value = false
  
  // Navigate based on notification type
  switch (notification.type) {
    case 'friend_request':
      // Navigate to friend requests (received) page
      router.push('/friends/requests/received')
      break
    case 'friend_request_accepted':
      // Navigate to friend's profile page if username is available
      if (notification.actor_username) {
        router.push(`/friend/${notification.actor_username}/profile`)
      } else {
        // Fallback to friends page if no username
        router.push('/friends')
      }
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
  const user = notification.actor_username ? `@${notification.actor_username}` : null
  const titles = {
    friend_request: user ? `Friend Request from ${user}` : 'New Friend Request',
    friend_request_accepted: user ? `Request Accepted by ${user}` : 'Friend Request Accepted',
    outfit_shared: user ? `Outfit Shared by ${user}` : 'Outfit Shared',
    friend_outfit_suggestion: user ? `Outfit Suggestion from ${user}` : 'Outfit Suggestion',
    outfit_like: user ? `Outfit Liked by ${user}` : 'Outfit Liked',
    item_like: user ? `Item Liked by ${user}` : 'Item Liked'
  }
  return titles[notification.type] || (user ? `Notification from ${user}` : 'Notification')
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
  // Initialize desktop detection
  isDesktop.value = window.innerWidth >= 1024
  window.addEventListener('resize', handleResize)
  // Close context menu when clicking outside
  window.addEventListener('click', closeContextMenu)
  window.addEventListener('keydown', handleEsc)
  
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

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEsc)
  window.removeEventListener('click', closeContextMenu)
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

// Card hover handlers removed - using simpler card style
</script>
