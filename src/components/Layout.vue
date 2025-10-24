<!--
  StyleSnap - Main Layout Component
  
  Provides the main application layout with responsive navigation,
  theme management, and user authentication controls.
  
  Features:
  - Desktop sidebar navigation
  - Mobile bottom navigation
  - Theme toggle functionality
  - User logout functionality
  - Loading state management
  - Responsive design
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Loading state with modern animated spinner -->
  <div v-if="loading" :class="`min-h-screen flex items-center justify-center ${
    theme.value === 'dark' ? 'bg-black' : 'bg-stone-50'
  }`">
    <div class="spinner-modern mx-auto" />
  </div>

  <div v-else class="min-h-screen text-foreground transition-colors duration-200">
    
    <!-- Desktop Sidebar Navigation with Liquid Glass -->
    <aside 
      ref="navbarRef"
      class="hidden md:flex fixed left-0 top-0 h-full w-64 navbar-glass flex-col items-stretch py-8 px-4 z-50"
      @mouseenter="navbarHoverIn"
      @mouseleave="navbarHoverOut"
    >
      
      <!-- Logo with liquid reveal -->
      <div class="mb-12 text-center md:text-left liquid-reveal">
        <div class="flex items-center gap-3">
          <div :class="`w-8 h-8 rounded-lg flex items-center justify-center ${
            theme.value === 'dark' ? 'bg-white' : 'bg-black'
          }`">
            <Shirt :class="`w-5 h-5 ${theme.value === 'dark' ? 'text-black' : 'text-white'}`" />
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground">
            StyleSnap
          </h1>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-2">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="block"
          @mouseenter="item.name === 'Home' ? handleHomeHover : undefined"
          @touchstart="item.name === 'Home' ? handleHomeHover : undefined"
        >
          <div 
            :class="`nav-item-liquid flex items-center justify-start gap-3 px-4 py-3 rounded-xl group relative ${
              $route.path === item.path
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
            }`"
          >
            <component :is="item.icon" class="w-5 h-5" />
            <span class="font-medium">
              {{ item.name }}
            </span>
          </div>
        </router-link>
      </nav>

      <!-- Theme Toggle & Logout -->
      <div class="space-y-2">
        <button
          ref="themeButtonRef"
          @click="handleThemeToggle"
          @mousedown="themePressIn"
          @mouseup="themePressOut"
          @mouseleave="themePressOut"
          class="w-full flex items-center justify-between px-4 py-3 rounded-xl liquid-press bg-secondary hover:bg-accent"
          :title="theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="font-medium text-secondary-foreground">
            {{ theme.value === 'dark' ? 'Light Mode' : 'Dark Mode' }}
          </span>
          <!-- Sun icon for dark mode (clicking will switch to light) -->
          <Sun v-if="theme.value === 'dark'" class="w-5 h-5" />
          <!-- Moon icon for light mode (clicking will switch to dark) -->
          <Moon v-else class="w-5 h-5" />
        </button>

        <button
          ref="logoutButtonRef"
          @click="handleLogout"
          @mousedown="logoutPressIn"
          @mouseup="logoutPressOut"
          @mouseleave="logoutPressOut"
          :disabled="loading"
          :class="`w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl liquid-press ${
            loading
              ? 'opacity-50 cursor-not-allowed text-muted-foreground'
              : theme.value === 'dark'
                ? 'bg-red-900/20 hover:bg-red-900/30 text-red-400 hover:text-red-300'
                : 'bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700'
          }`"
        >
          <LogOut v-if="!loading" class="w-5 h-5" />
          <div v-else class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span class="font-medium">{{ loading ? 'Logging out...' : 'Logout' }}</span>
        </button>
      </div>
    </aside>

    <!-- Mobile Bottom Navigation with liquid glass -->
    <nav 
      ref="mobileNavRef"
      class="md:hidden fixed bottom-0 left-0 right-0 navbar-glass z-50 px-2 py-3 pb-safe"
      style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))"
      @mouseenter="mobileNavHoverIn"
      @mouseleave="mobileNavHoverOut"
    >
      
      <div class="flex items-center justify-around max-w-md mx-auto">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="relative flex-1"
        >
          <div class="flex flex-col items-center justify-center gap-1 py-2">
            <div :class="`p-2.5 rounded-2xl transition-all duration-200 ${
              $route.path === item.path
                ? 'bg-primary scale-110 -translate-y-0.5'
                : 'bg-transparent'
            }`">
              <component 
                :is="item.icon" 
                :class="`w-5 h-5 transition-colors duration-200 ${
                  $route.path === item.path
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                }`"
              />
            </div>
            
            <span :class="`text-xs font-medium transition-all duration-200 ${
              $route.path === item.path
                ? 'text-primary-foreground opacity-100 scale-100'
                : 'text-muted-foreground opacity-60 scale-90'
            }`">
              {{ item.name }}
            </span>

            <!-- Active indicator -->
            <div
              v-if="$route.path === item.path"
              class="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-primary"
            />
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="md:ml-64 pb-24 md:pb-0 min-h-screen">
      <transition
        :name="'page'"
        mode="out-in"
      >
        <router-view />
      </transition>
    </main>

    <!-- Global Popup -->
    <GlobalPopup />
  </div>
</template>

<script setup>
/**
 * Main Layout Component Script
 * 
 * Manages the application layout, navigation, theme state, and user authentication.
 * Provides responsive navigation for both desktop and mobile devices.
 */

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/auth-store'
import { createPageUrl } from '@/utils'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import { NotificationsService } from '@/services/notificationsService'
import { useNavbarLiquid, useLiquidPress, useLiquidHover, useReducedMotion } from '@/composables/useLiquidGlass'
import { 
  Home, 
  Shirt, 
  Users, 
  Palette, 
  User as UserIcon,
  LogOut,
  Sun,
  Moon
} from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import GlobalPopup from './GlobalPopup.vue'

// Router, theme, and auth composables
const router = useRouter()
const { theme, loadUser, refreshTheme, toggleTheme } = useTheme()
const { showConfirm } = usePopup()
const authStore = useAuthStore()

// Liquid glass composables
const { navbarRef, isScrolled, hoverIn: navbarHoverIn, hoverOut: navbarHoverOut } = useNavbarLiquid()
const { elementRef: themeButtonRef, pressIn: themePressIn, pressOut: themePressOut } = useLiquidPress()
const { elementRef: logoutButtonRef, pressIn: logoutPressIn, pressOut: logoutPressOut } = useLiquidPress()
const { elementRef: mobileNavRef, hoverIn: mobileNavHoverIn, hoverOut: mobileNavHoverOut } = useLiquidHover()
const { prefersReducedMotion } = useReducedMotion()

// Service instances for data prefetching
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()
const notificationsService = new NotificationsService()

// Loading state for initial app setup
const loading = ref(true)

// Cache for prefetched data
const homeDataCache = ref({
  items: null,
  outfits: null,
  friends: null,
  notifications: null,
  timestamp: null
})

/**
 * Navigation items configuration
 * 
 * Defines the main navigation items with their display names,
 * route paths, and corresponding icons.
 * 
 * @type {Array<Object>} Array of navigation item objects
 */
const navigationItems = [
  { name: "Home", path: "/home", icon: Home },
  { name: "Closet", path: "/closet", icon: Shirt },
  { name: "Outfits", path: "/outfits", icon: Palette },
  { name: "Friends", path: "/friends", icon: Users },
  { name: "Profile", path: "/profile", icon: UserIcon },
]

/**
 * Handles theme toggle functionality
 * 
 * Properly handles the async theme toggle operation and provides
 * user feedback during the process.
 */
const handleThemeToggle = async () => {
  try {
    console.log('🎨 Layout: Toggling theme...')
    await toggleTheme()
    console.log('✅ Layout: Theme toggled successfully')
  } catch (error) {
    console.error('❌ Layout: Theme toggle error:', error)
  }
}

/**
 * Handles user logout functionality
 * 
 * Signs out the current user using the auth store and redirects to the login page.
 * Clears all authentication state and user data.
 */
const handleLogout = () => {
  showConfirm(
    'Are you sure you want to logout?',
    'Logout',
    () => {
      console.log('🚪 Layout: Redirecting to logout page...')
      // Navigate to logout page which will handle the logout logic
      router.push('/logout')
    }
  )
}

/**
 * Prefetches home page data for instant loading
 * 
 * Loads all data needed by the home page in parallel to ensure
 * instant rendering when the user navigates to the home page.
 */
const prefetchHomeData = async () => {
  try {
    // Check if we already have recent data (within 2 minutes)
    if (homeDataCache.value.timestamp && 
        Date.now() - homeDataCache.value.timestamp < 2 * 60 * 1000) {
      console.log('✅ Layout: Using cached home data')
      return
    }

    console.log('🔄 Layout: Prefetching home data...')
    
    const user = authStore.user || authStore.profile
    if (!user?.id) {
      console.log('⚠️ Layout: No user ID available for prefetching')
      return
    }

    // Fetch all data in parallel for maximum speed
    const [itemsResult, outfitsData, friendsData, notificationsData] = await Promise.all([
      clothesService.getClothes({ owner_id: user.id, limit: 6 }).catch(err => {
        console.error('Layout: Error prefetching items:', err)
        return { success: false, data: [] }
      }),
      outfitsService.getOutfits({ limit: 3 }).catch(err => {
        console.error('Layout: Error prefetching outfits:', err)
        return []
      }),
      friendsService.getFriends().catch(err => {
        console.error('Layout: Error prefetching friends:', err)
        return []
      }),
      notificationsService.getNotifications().catch(err => {
        console.error('Layout: Error prefetching notifications:', err)
        return []
      })
    ])

    // Cache the results
    homeDataCache.value = {
      items: itemsResult.success ? itemsResult.data : [],
      outfits: outfitsData,
      friends: friendsData,
      notifications: notificationsData,
      timestamp: Date.now()
    }

    console.log('✅ Layout: Home data prefetched successfully', {
      items: homeDataCache.value.items?.length || 0,
      outfits: homeDataCache.value.outfits?.length || 0,
      friends: homeDataCache.value.friends?.length || 0,
      notifications: homeDataCache.value.notifications?.length || 0
    })
  } catch (error) {
    console.error('❌ Layout: Error prefetching home data:', error)
  }
}

/**
 * Handles hover/touch on Home navigation link
 * 
 * Prefetches home data in the background for instant loading
 * when the user clicks to navigate to the home page.
 */
const handleHomeHover = () => {
  // Don't block the UI, prefetch in background
  prefetchHomeData()
}

/**
 * Component mounted lifecycle hook
 * 
 * Loads user data and theme preferences when the component is mounted.
 * Sets loading state to false once initialization is complete.
 */
onMounted(async () => {
  // Load user data and theme preferences
  try {
    await loadUser() // This calls the theme store's loadUser method
    console.log('✅ Layout: User and theme loaded')
  } catch (error) {
    console.error('❌ Layout: Error loading user/theme:', error)
  }
  
  // Force refresh theme to ensure it's properly applied
  refreshTheme()
  loading.value = false

  // Prefetch home data immediately after loading user
  prefetchHomeData()
})
</script>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
