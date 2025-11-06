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
  <div v-if="loading" :class="`min-h-screen flex items-center justify-center bg-stone-50`">
    <div class="spinner-modern mx-auto" />
  </div>

  <div v-else class="min-h-screen text-foreground transition-colors duration-200">

    <!-- Desktop Sidebar Navigation with Liquid Glass -->
    <aside 
      v-if="!isLandingPage"
      ref="navbarRef"
      :class="`hidden md:flex fixed left-0 top-0 h-full ${sidebarWidthClass} navbar-glass flex-col items-stretch py-8 px-4 z-50 shadow-[12px_0_24px_-16px_rgba(0,0,0,0.25)] dark:shadow-[12px_0_28px_-18px_rgba(0,0,0,0.6)] transition-all duration-300 ease-in-out`"
      style="overflow: visible;"
      @mouseenter="navbarHoverIn"
      @mouseleave="navbarHoverOut"
    >
      <!-- Logo section with toggle button -->
      <div class="mb-12 relative flex items-center justify-between transition-all duration-300 ease-in-out">
        <!-- Logo - morphs to expand icon on hover when collapsed, navigates to home when expanded -->
        <div
          v-if="isSidebarCollapsed"
          @click="toggleSidebar"
          @mouseenter="logoHovered = true"
          @mouseleave="logoHovered = false"
          class="liquid-reveal flex items-center justify-center cursor-pointer transition-all duration-300 ease-in-out flex-shrink-0 group"
          title="Expand sidebar"
        >
          <div 
            :class="`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all duration-300 ease-in-out ${
              logoHovered 
                ? 'bg-zinc-800 dark:bg-zinc-200 shadow-md' 
                : 'bg-black dark:bg-white'
            }`"
          >
            <!-- Logo - morphs out on hover when collapsed -->
            <StyleSnapLogo 
              :class="`absolute transition-all duration-300 ease-out collapsed-sidebar-logo ${
                logoHovered 
                  ? 'opacity-0 scale-50 rotate-180' 
                  : 'opacity-100 scale-100 rotate-0'
              }`" 
              size="lg"
              style="transform-origin: center; will-change: transform, opacity;"
            />
            <!-- PanelLeftOpen icon - morphs in on hover when collapsed -->
            <PanelLeftOpen 
              :class="`w-5 h-5 absolute text-white dark:text-black transition-all duration-300 ease-out ${
                logoHovered 
                  ? 'opacity-100 scale-100 rotate-0' 
                  : 'opacity-0 scale-50 -rotate-180'
              }`" 
              style="transform-origin: center; will-change: transform, opacity;"
            />
          </div>
        </div>
        
        <!-- Logo - navigates to home when expanded -->
        <router-link 
          v-else
          to="/home" 
          class="liquid-reveal flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0 justify-start"
        >
          <StyleSnapLogo size="lg" />
          <h1 class="text-2xl font-bold tracking-tight text-foreground whitespace-nowrap transition-all duration-300 ease-in-out opacity-100">
            <StyleSnapBrand size="2xl" />
          </h1>
        </router-link>
        
        <!-- Toggle Button - visible only when expanded, positioned beside logo -->
        <button
          v-if="!isSidebarCollapsed"
          @click.stop="toggleSidebar"
          class="flex-shrink-0 w-11 h-11 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110"
          title="Collapse sidebar"
        >
          <PanelLeftClose class="w-5 h-5 text-secondary-foreground" />
        </button>
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
            :class="`nav-item-liquid flex items-center justify-start ${isSidebarCollapsed ? '' : 'gap-3'} px-3 py-3 rounded-xl group relative transition-all duration-300 ease-in-out min-h-[44px] ${
              isActiveRoute(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-secondary hover:text-secondary-foreground'
            }`"
            :title="isSidebarCollapsed ? item.name : undefined"
          >
            <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
            <span 
              class="font-medium whitespace-nowrap transition-all duration-300 ease-in-out"
              :class="isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'"
            >
              {{ item.name }}
            </span>
          </div>
        </router-link>
      </nav>

      <!-- Theme Toggle & Logout -->
      <div class="space-y-2">
        <div class="relative" style="overflow: visible;">
          <button
            ref="themeButtonRef"
            @click="handleThemeButtonClick"
            @mousedown="themePressIn($event.currentTarget)"
            @mouseup="themePressOut($event.currentTarget)"
            @mouseleave="themePressOut($event.currentTarget)"
            :class="`nav-item-liquid liquid-press w-full flex items-center justify-between  ${isSidebarCollapsed ? '' : 'gap-3'} px-3 py-3 rounded-xl bg-secondary hover:bg-accent group relative transition-all duration-300 ease-in-out min-h-[44px]`"
            :title="isSidebarCollapsed ? `${getThemeLabel(currentTheme)} Theme` : getThemeLabel(currentTheme)"
          >
            <div class="flex gap-3">
              <Sun v-if="currentTheme === 'light'" class="w-5 h-5 text-secondary-foreground flex-shrink-0" />
              <Moon v-else-if="currentTheme === 'dark'" class="w-5 h-5 text-secondary-foreground flex-shrink-0" />
              <Monitor v-else class="w-5 h-5 text-secondary-foreground flex-shrink-0" />
              <span 
                class="font-medium text-secondary-foreground whitespace-nowrap transition-all duration-300 ease-in-out flex-1"
                :class="isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'"
              >
                Theme
              </span>              
            </div>

            <ChevronDown 
              class="w-4 h-4 text-secondary-foreground flex-shrink-0 transition-all duration-300"
              :class="[
                showThemeDropdown ? 'opacity-100' : 'opacity-50',
                isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : ''
              ]"
            />
          </button>

          <!-- Theme Dropdown Menu - Tooltip style -->
          <Teleport v-if="isSidebarCollapsed && showThemeDropdown" to="body">
            <div
              data-theme-dropdown
              :class="`fixed bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 z-[9999] overflow-hidden min-w-[160px]`"
              :style="themeDropdownStyle"
            >
              <button
                v-for="option in themeOptions"
                :key="option.value"
                @click.stop="selectTheme(option.value)"
                :class="`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                  currentTheme === option.value
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`"
              >
                <component :is="option.icon" class="w-5 h-5 flex-shrink-0" />
                <span class="font-medium text-sm">{{ option.label }}</span>
                <!-- Selected indicator checkmark -->
                <svg 
                  v-if="currentTheme === option.value" 
                  class="w-5 h-5 ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
          </Teleport>
          <div
            v-if="!isSidebarCollapsed && showThemeDropdown"
            data-theme-dropdown
            class="absolute bottom-full left-0 mb-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 z-[100] overflow-hidden"
          >
            <button
              v-for="option in themeOptions"
              :key="option.value"
              @click.stop="selectTheme(option.value)"
              :class="`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                currentTheme === option.value
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`"
            >
              <component :is="option.icon" class="w-5 h-5 flex-shrink-0" />
              <span class="font-medium text-sm">{{ option.label }}</span>
              <!-- Selected indicator checkmark -->
              <svg 
                v-if="currentTheme === option.value" 
                class="w-5 h-5 ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>

        <button
          ref="logoutButtonRef"
          @click="handleLogout"
          @mousedown="logoutPressIn($event.currentTarget)"
          @mouseup="logoutPressOut($event.currentTarget)"
          @mouseleave="logoutPressOut($event.currentTarget)"
          :disabled="loading"
          :class="[
            `nav-item-liquid w-full flex items-center liquid-press justify-start ${isSidebarCollapsed ? '' : 'gap-3'} px-3 py-3 rounded-xl liquid-press bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-all duration-300 ease-in-out min-h-[44px]`,
            {
              'opacity-50 cursor-not-allowed text-muted-foreground': loading,
            }
          ]"
          :title="isSidebarCollapsed ? 'Logout' : undefined"
        >
          <LogOut v-if="!loading" class="w-5 h-5 flex-shrink-0" />
          <div v-else class="w-5 h-5 spinner-modern flex-shrink-0" />
          <span 
            class="font-medium whitespace-nowrap transition-all duration-300 ease-in-out"
            :class="isSidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'"
          >
            {{ loading ? 'Logging out...' : 'Logout' }}
          </span>
        </button>
      </div>
    </aside>

    <!-- Mobile Top Bar -->
    <div 
      v-if="!isLandingPage"
      class="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-black border-b border-stone-200 dark:border-zinc-800 z-50 px-4 py-3 pt-safe"
      style="padding-top: calc(0.75rem + env(safe-area-inset-top))"
    >
      <div class="flex items-center justify-center">
        <button
          @click="scrollToTop"
          class="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <StyleSnapLogo size="xl" class="hidden" />
          <h1 class="text-xl font-bold tracking-tight text-black dark:text-white">
            <StyleSnapBrand size="xl" />
          </h1>
        </button>
      </div>
    </div>

    <!-- Mobile Bottom Navigation with pill shape -->
    <nav 
      v-if="!isLandingPage"
      ref="mobileNavRef"
      class="md:hidden fixed bottom-4 left-0 right-0 z-[1100] px-4"
      style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))"
      @mouseenter="mobileNavHoverIn"
      @mouseleave="mobileNavHoverOut"
    >
      <div class="mobile-nav-blur flex items-center justify-around py-2.5 px-4 rounded-full border shadow-lg max-w-md mx-auto w-full">
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          class="relative flex-1"
        >
          <div class="flex flex-col items-center justify-center py-2">
            <div :class="`p-2.5 rounded-2xl transition-all duration-200 ${
              isActiveRoute(item.path)
                ? 'bg-black dark:bg-white/20 scale-110 -translate-y-0.5'
                : 'bg-transparent'
            }`">
              <component 
                :is="item.icon" 
                :class="`w-5 h-5 transition-colors duration-200 ${
                  isActiveRoute(item.path)
                    ? 'text-white dark:text-white'
                    : 'text-gray-900 dark:text-white'
                }`"
              />
            </div>
            
            <span :class="`text-xs font-medium transition-all duration-200 ${
              isActiveRoute(item.path)
                ? 'text-gray-900 dark:text-white opacity-100 scale-100'
                : 'text-gray-900 dark:text-white opacity-60 dark:opacity-80 scale-90'
            }`">
              {{ item.name }}
            </span>

            <!-- Active indicator -->
            <div
              v-if="isActiveRoute(item.path)"
              class="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black"
            />
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="`${isLandingPage ? '' : isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} ${isLandingPage ? '' : 'pt-16 pb-24 md:pt-0 md:pb-0'} min-h-screen transition-all duration-300 ease-in-out`">
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

import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/stores/theme-store'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { useAuthStore } from '@/stores/auth-store'
import { createPageUrl } from '@/utils'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import StyleSnapLogo from '@/components/StyleSnapLogo.vue'
import StyleSnapBrand from '@/components/StyleSnapBrand.vue'
import { NotificationsService } from '@/services/notificationsService'
import { useNavbarLiquid, useLiquidPress, useLiquidHover, useReducedMotion } from '@/composables/useLiquidGlass'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { 
  Home, 
  Shirt, 
  Users, 
  Layers, 
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import GlobalPopup from './GlobalPopup.vue'
import { PanelLeft } from 'lucide-vue-next'
import { PanelLeftClose } from 'lucide-vue-next'
import { PanelLeftOpen } from 'lucide-vue-next'

// Router, theme, and auth composables
const router = useRouter()
const route = useRoute()
const { loadUser, refreshTheme, toggleTheme, setTheme } = useTheme()
const themeStore = useThemeStore()
const { theme: themeFromStore } = storeToRefs(themeStore)
const { showConfirm } = usePopup()
const authStore = useAuthStore()

// Liquid glass composables
const { navbarRef, isScrolled, hoverIn: navbarHoverIn, hoverOut: navbarHoverOut } = useNavbarLiquid()
const { elementRef: themeButtonRef, pressIn: themePressIn, pressOut: themePressOut } = useLiquidPress()
const { elementRef: logoutButtonRef, pressIn: logoutPressIn, pressOut: logoutPressOut } = useLiquidPress()
const { elementRef: mobileNavRef, hoverIn: mobileNavHoverIn, hoverOut: mobileNavHoverOut } = useLiquidHover()
const { prefersReducedMotion } = useReducedMotion()

// Keyboard shortcuts
const { registerSearchInput } = useKeyboardShortcuts()

// Computed property to check if current route is landing page
const isLandingPage = computed(() => route.path === '/')

// Scroll to top of page
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Helper function to check if a navigation item is active (memoized for performance)
const isActiveRoute = (itemPath) => {
  const currentPath = route.path
  return currentPath === itemPath || 
         (currentPath.startsWith('/outfits/add') && itemPath === '/outfits') || 
         (currentPath.startsWith('/outfits/edit') && itemPath === '/outfits') ||
         (currentPath.startsWith('/closet/') && itemPath === '/closet') ||
         ((currentPath.startsWith('/friends') || currentPath.startsWith('/friend/')) && itemPath === '/friends')
}

// Service instances for data prefetching
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()
const notificationsService = new NotificationsService()

// Loading state for initial app setup
const loading = ref(true)
const showThemeDropdown = ref(false)
const themeDropdownStyle = ref('')

// Sidebar collapsed state - persist in localStorage
const isSidebarCollapsed = ref(false)

// Logo hover state for icon morphing when collapsed
const logoHovered = ref(false)

// Load sidebar state from localStorage on mount
const loadSidebarState = () => {
  const saved = localStorage.getItem('sidebarCollapsed')
  if (saved !== null) {
    isSidebarCollapsed.value = saved === 'true'
  }
}

// Toggle sidebar collapsed state
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value.toString())
  // Close theme dropdown when collapsing
  if (isSidebarCollapsed.value) {
    showThemeDropdown.value = false
  }
  // Reset logo hover state when sidebar state changes
  logoHovered.value = false
}

// Computed sidebar width class
const sidebarWidthClass = computed(() => {
  return isSidebarCollapsed.value ? 'w-20' : 'w-64'
})

// Use store ref directly - storeToRefs already gives us a reactive ref
const currentTheme = themeFromStore

// Theme options with icons
const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
]

// Get theme label
const getThemeLabel = (themeValue) => {
  const option = themeOptions.find(opt => opt.value === themeValue)
  return option ? option.label : 'Theme'
}

// Select theme
const selectTheme = async (themeValue) => {
  // Close dropdown immediately for better UX
  showThemeDropdown.value = false
  // Then apply theme change
  await setTheme(themeValue)
  // Wait for DOM update
  await nextTick()
  // Force refresh to ensure UI updates
  refreshTheme()
}

// Handle theme button click
const handleThemeButtonClick = async () => {
  showThemeDropdown.value = !showThemeDropdown.value
  
  // Update position when collapsed and opening
  if (isSidebarCollapsed.value && showThemeDropdown.value) {
    await nextTick()
    updateThemeDropdownPosition()
  }
}

// Update dropdown position when collapsed
const updateThemeDropdownPosition = () => {
  if (themeButtonRef.value) {
    const rect = themeButtonRef.value.getBoundingClientRect()
    themeDropdownStyle.value = `left: ${rect.right + 8}px; top: ${rect.top}px;`
  }
}

// Update position when sidebar state changes while dropdown is open
watch(isSidebarCollapsed, async () => {
  // Reset logo hover state when sidebar state changes
  logoHovered.value = false
  
  if (isSidebarCollapsed.value && showThemeDropdown.value) {
    await nextTick()
    updateThemeDropdownPosition()
  } else {
    themeDropdownStyle.value = ''
  }
})

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
  { name: "Outfits", path: "/outfits", icon: Layers },
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
// Handle click outside to close theme dropdown
const handleClickOutside = (event) => {
  if (!themeButtonRef.value || !showThemeDropdown.value) return
  
  const button = themeButtonRef.value
  const dropdown = document.querySelector('[data-theme-dropdown]')
  
  // Check if click is outside both button and dropdown
  const isClickOutsideButton = !button.contains(event.target)
  const isClickOutsideDropdown = !dropdown?.contains(event.target)
  
  if (isClickOutsideButton && isClickOutsideDropdown) {
    showThemeDropdown.value = false
  }
}

onMounted(async () => {
  // Load sidebar state from localStorage
  loadSidebarState()
  
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
  
  // Add click outside listener for theme dropdown
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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

/* Mobile navigation blur - matches desktop toolbar */
.mobile-nav-blur {
  background: rgba(255, 255, 255, 0.85) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  transition: background-color 0.3s ease !important;
}

.dark .mobile-nav-blur {
  background: rgba(0, 0, 0, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

/* Collapsed sidebar logo visibility fix:
   Light mode: Container is black, so invert logo to white
   Dark mode: Container is white, so keep logo black (original) */
:deep(.collapsed-sidebar-logo.stylesnap-logo) {
  filter: invert(1) !important;
}

.dark :deep(.collapsed-sidebar-logo.stylesnap-logo) {
  filter: none !important;
}
</style>  
