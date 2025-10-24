<template>
  <!-- Main container with theme-aware background -->
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    
    <!-- Page Header Section -->
    <div class="max-w-6xl mx-auto mb-8">
      <!-- Header with title and add button -->
      <div class="flex items-center justify-between mb-6">
        <!-- Dynamic page title based on current sub-route -->
        <h1 class="text-4xl font-bold text-foreground">
          {{ subRouteTitle }}
        </h1>
        
        <!-- Add Item Dropdown Button (only shown on default closet view) -->
        <div v-if="currentSubRoute === 'default'" class="relative">
          <!-- Toggle button for add item dropdown menu -->
          <button
            @click="showAddMenu = !showAddMenu"
            :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            <Plus class="w-5 h-5" />
            Add Item
            <!-- Animated chevron icon that rotates when menu is open -->
            <svg :class="`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Dropdown Menu with Add Item Options -->
          <div
            v-if="showAddMenu"
            :class="`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${
              theme.value === 'dark'
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-white border-stone-200'
            }`"
          >
            <!-- Manual Upload Option -->
            <button
              @click="navigateToManual"
              :class="`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-white'
                  : 'hover:bg-stone-50 text-black'
              }`"
            >
              <Plus class="w-5 h-5" />
              <div>
                <div class="font-medium">Manual Upload</div>
                <div :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">
                  Upload your own clothing items
                </div>
              </div>
            </button>

            <!-- Catalogue Browse Option -->
            <button
              @click="navigateToCatalogue"
              :class="`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-white'
                  : 'hover:bg-stone-50 text-black'
              }`"
            >
              <Shirt class="w-5 h-5" />
              <div>
                <div class="font-medium">Add from Catalogue</div>
                <div :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">
                  Browse pre-populated items
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Sub-route Navigation - Individual Buttons -->
      <div v-if="currentSubRoute === 'manual' || currentSubRoute === 'catalogue'" class="mb-8">
        <div class="flex flex-wrap gap-2">
          <button
            @click="$router.push('/closet/add/manual')"
            :class="`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base flex items-center gap-2 ${
              currentSubRoute === 'manual'
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <Plus class="w-4 h-4" />
            Manual Add
          </button>
          <button
            @click="$router.push('/closet/add/catalogue')"
            :class="`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base flex items-center gap-2 ${
              currentSubRoute === 'catalogue'
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <Shirt class="w-4 h-4" />
            Browse Catalogue
          </button>
        </div>
      </div>
      
      <!-- Sub-route Content -->
      <ManualUploadForm v-if="currentSubRoute === 'manual'" @item-added="handleItemAdded" />
      
      <CatalogueBrowser v-if="currentSubRoute === 'catalogue'" @item-added="handleItemAdded" />
      
      <div v-if="currentSubRoute === 'friend'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
        <div class="flex items-center gap-3 mb-4">
          <Heart class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 class="text-xl font-semibold text-purple-900 dark:text-purple-100">{{ route.params.username }}'s Closet</h3>
        </div>
        <p class="text-purple-700 dark:text-purple-300 mb-4">
          Browse {{ route.params.username }}'s clothing collection. Get inspired by their style and see what they're wearing.
        </p>
        <div class="text-center py-8">
          <Heart class="w-16 h-16 text-purple-400 dark:text-purple-500 mx-auto mb-4" />
          <p class="text-purple-600 dark:text-purple-400">Loading {{ route.params.username }}'s closet...</p>
        </div>
      </div>

      <!-- Filters (only show for default closet view) -->
      <div v-if="currentSubRoute === 'default'" class="mb-6">
        <!-- Category Filters -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="activeCategory = category"
            :class="`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base ${
              activeCategory === category
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            {{ getCategoryLabel(category) }}
          </button>
          
          <!-- Favorites Button - Same size as other filter buttons -->
          <button
            @click="showFavoritesOnly = !showFavoritesOnly"
            :class="`px-3 py-2 md:px-4 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm md:text-base flex items-center gap-2 ${
              showFavoritesOnly
                ? theme.value === 'dark'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-500 text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <Heart :class="`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`" />
            Favorites
          </button>
        </div>
      </div>

      <!-- Search Bar (only show for default closet view) -->
      <div v-if="currentSubRoute === 'default'" class="mb-6">
        <div class="relative">
          <Search :class="`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-400'
          }`" />
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search your closet..."
            :class="`w-full pl-10 pr-4 py-3 rounded-lg border ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                : 'bg-stone-100 border-stone-300 text-black placeholder-stone-500'
            }`"
            @input="handleSearch"
          />
        </div>
      </div>
    </div>

    <!-- Items Grid (only show for default closet view) -->
    <div v-if="currentSubRoute === 'default'" class="max-w-6xl mx-auto">
      <!-- Loading state -->
      <div v-if="loading" class="flex flex-col items-center py-16">
        <div class="spinner-modern mb-6"></div>
        <p :class="theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'">
          Loading your closet...
        </p>
      </div>

      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h3 class="text-xl font-semibold mb-2 text-foreground">
          {{ searchTerm ? 'No items found matching your search.' : 'No items found' }}
        </h3>
        <p :class="`text-lg mb-4 ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          {{ searchTerm ? 'Try adjusting your search terms.' : 'Start building your wardrobe by adding your first item!' }}
        </p>
        
        <!-- Add Item Button (only show when not searching and user is authenticated) -->
        <div v-if="!searchTerm && authStore.isAuthenticated && currentUser?.id">
          <button
            @click="$router.push('/closet/add/manual')"
            :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            <Plus class="w-5 h-5" />
            Add Item
          </button>
        </div>
        
        <div v-if="!authStore.isAuthenticated" :class="`mt-4 p-4 rounded-lg ${
          theme.value === 'dark' 
            ? 'bg-yellow-900/20 border border-yellow-800 text-yellow-300' 
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`">
          <p class="text-sm">
            You need to be logged in to see your items. Please <router-link to="/login" class="underline hover:no-underline">sign in</router-link> to access your closet.
          </p>
        </div>
        <div v-else-if="!currentUser?.id" :class="`mt-4 p-4 rounded-lg ${
          theme.value === 'dark' 
            ? 'bg-yellow-900/20 border border-yellow-800 text-yellow-300' 
            : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
        }`">
          <p class="text-sm">
            User data is loading. If you have items in Supabase but they're not showing, check the browser console for debugging information.
          </p>
        </div>
      </div>

      <TransitionGroup 
        v-else 
        name="list" 
        tag="div" 
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <div
          v-for="(item, index) in filteredItems"
          :key="item.id"
          @click="openItemDetails(item)"
          @mouseenter="handleItemHover($event, index)"
          @mouseleave="handleItemLeave($event, index)"
          @mousemove="handleItemMouseMove($event, index)"
          class="liquid-item-card group cursor-pointer bg-white border border-stone-200 hover:border-stone-300 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
          :style="{ transitionDelay: `${index * 50}ms` }"
        >
          <div class="aspect-square relative overflow-hidden">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="liquid-item-image w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-stone-100"
            >
              <Shirt class="w-12 h-12 text-stone-500" />
            </div>
            
            <button
              @click.stop="toggleFavorite(item)"
              @mousedown="handleFavoritePress($event, item)"
              @mouseup="handleFavoriteRelease($event, item)"
              :class="`liquid-favorite-btn absolute top-2 right-2 p-2 rounded-full ${
                item.is_favorite
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-stone-500 hover:bg-stone-100/90'
              }`"
            >
              <Heart :class="`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`" />
            </button>
          </div>
          
          <div class="p-4">
            <h3 class="liquid-item-title font-semibold mb-1 text-black">
              {{ item.name }}
            </h3>
            <p class="liquid-item-category text-sm text-stone-600">
              {{ item.brand || 'No brand' }}
            </p>
            <span class="inline-block px-2 py-1 mt-2 text-xs rounded-full bg-stone-100 text-stone-700">
              {{ item.category }}
            </span>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Upload Modal -->
    <UploadItemModal
      :is-open="showUpload"
      @close="showUpload = false"
      @item-added="handleItemAdded"
    />

    <!-- Item Details Modal -->
    <ItemDetailsModal
      :is-open="showItemDetails"
      :item="selectedItem"
      @close="closeItemDetails"
      @item-removed="handleItemRemoved"
      @item-updated="handleItemUpdated"
    />
  </div>
</template>

<script setup>
/**
 * Cabinet.vue - Closet Management Page
 * 
 * Main component for managing clothing items in the user's wardrobe.
 * Provides functionality for viewing, adding, editing, and organizing
 * clothing items with search and filtering capabilities.
 * 
 * Features:
 * - Display clothing items in responsive grid layout
 * - Search functionality across name, brand, color, and category
 * - Category and favorites filtering
 * - Add items via manual upload or catalogue browsing
 * - Item details modal with edit/delete functionality
 * - Liquid glass hover effects for enhanced UX
 * - Theme-aware styling (dark/light mode)
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

// Vue 3 Composition API imports
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Composables and stores
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { ClothesService } from '@/services/clothesService'
import { useLiquidHover, useLiquidPress } from '@/composables/useLiquidGlass'

// UI Components
import { Plus, Heart, Shirt, Search } from 'lucide-vue-next'
import UploadItemModal from '@/components/cabinet/UploadItemModal.vue'
import ManualUploadForm from '@/components/cabinet/ManualUploadForm.vue'
import CatalogueBrowser from '@/components/cabinet/CatalogueBrowser.vue'
import ItemDetailsModal from '@/components/cabinet/ItemDetailsModal.vue'

// Initialize composables and services
const { theme } = useTheme()                    // Theme management
const authStore = useAuthStore()                // Authentication state
const route = useRoute()                        // Current route information
const router = useRouter()                      // Router for navigation

// Liquid glass animation effects for enhanced UX
const { elementRef: itemCardRefs, hoverIn: itemHoverIn, hoverOut: itemHoverOut } = useLiquidHover()
const { elementRef: favoriteButtonRefs, pressIn: favoritePressIn, pressOut: favoritePressOut } = useLiquidPress()

// Route-based computed properties for dynamic content
const currentSubRoute = computed(() => route.meta.subRoute || 'default')
const subRouteTitle = computed(() => {
  switch (currentSubRoute.value) {
    case 'manual': return 'Add Item Manually'
    case 'catalogue': return 'Browse Catalogue'
    case 'friend': return `${route.params.username}'s Closet`
    default: return 'Your Closet'
  }
})

// Initialize clothes service for API operations
const clothesService = new ClothesService()

// Reactive user data from authentication store
const currentUser = computed(() => authStore.user || authStore.profile)

// Reactive state variables
const items = ref([])                    // Array of clothing items
const loading = ref(true)                // Loading state for data fetching
const showUpload = ref(false)            // Upload modal visibility
const showAddMenu = ref(false)           // Add item dropdown menu visibility
const showItemDetails = ref(false)       // Item details modal visibility
const selectedItem = ref(null)           // Currently selected item for details
const activeCategory = ref('all')        // Currently active category filter
const showFavoritesOnly = ref(false)     // Favorites-only filter toggle
const searchTerm = ref('')               // Search input value

// Available clothing categories for filtering
const categories = ['all', 'top', 'bottom', 'outerwear', 'shoes', 'hat']

/**
 * Converts category key to display label
 * 
 * @param {string} category - Category key (e.g., 'top', 'bottom')
 * @returns {string} Display label (e.g., 'Tops', 'Bottoms')
 */
const getCategoryLabel = (category) => {
  const labels = {
    'all': 'All Items',
    'top': 'Tops',
    'bottom': 'Bottoms',
    'outerwear': 'Outerwear',
    'shoes': 'Shoes',
    'hat': 'Accessories'
  }
  return labels[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

// Navigation functions for add item routes
/**
 * Navigates to manual item upload page
 * Closes the add menu dropdown before navigation
 */
const navigateToManual = () => {
  showAddMenu.value = false
  router.push('/closet/add/manual')
}

/**
 * Navigates to catalogue browsing page
 * Closes the add menu dropdown before navigation
 */
const navigateToCatalogue = () => {
  showAddMenu.value = false
  router.push('/closet/add/catalogue')
}

/**
 * Computed property that filters items based on search term, category, and favorites
 * 
 * Applies multiple filters in sequence:
 * 1. Search filter across name, brand, color, and category
 * 2. Category filter (if not 'all')
 * 3. Favorites filter (if enabled)
 * 
 * @returns {Array} Filtered array of clothing items
 */
const filteredItems = computed(() => {
  let filtered = items.value

  // Apply search filter across multiple fields
  if (searchTerm.value) {
    const query = searchTerm.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.color?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    )
  }

  // Apply category filter
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }

  // Apply favorites filter
  if (showFavoritesOnly.value) {
    filtered = filtered.filter(item => item.is_favorite)
  }

  return filtered
})

const loadItems = async () => {
  try {
    console.log('Cabinet: Loading items for user:', currentUser.value?.id)
    console.log('Cabinet: Auth store state:', {
      isAuthenticated: authStore.isAuthenticated,
      user: authStore.user,
      profile: authStore.profile
    })
    
    if (currentUser.value?.id) {
      console.log('Cabinet: Calling clothesService.getClothes with owner_id:', currentUser.value.id)
      // Use the real Supabase service to fetch user's clothing items
      const result = await clothesService.getClothes({
        owner_id: currentUser.value.id,
        limit: 100 // Load up to 100 items
      })
      
      console.log('Cabinet: getClothes result:', result)
      
      if (result && result.success) {
        items.value = result.data || []
        console.log('Cabinet: Loaded items from Supabase:', items.value.length, 'items')
        console.log('Cabinet: Items data:', items.value)
      } else {
        console.error('Cabinet: Failed to load items:', result?.error || 'Unknown error')
        items.value = []
      }
    } else {
      console.log('Cabinet: No user ID found, cannot load items')
      console.log('Cabinet: currentUser.value:', currentUser.value)
      items.value = []
    }
  } catch (error) {
    console.error('Cabinet: Error loading items:', error)
    console.error('Cabinet: Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    items.value = []
  } finally {
    loading.value = false
  }
}

const toggleFavorite = async (item) => {
  try {
    // Add pulse animation to heart
    const event = window.event
    if (event && event.target) {
      const heartIcon = event.target.closest('button')?.querySelector('svg')
      if (heartIcon) {
        heartIcon.classList.add('heart-pulse')
        setTimeout(() => heartIcon.classList.remove('heart-pulse'), 300)
      }
    }
    
    // Toggle the favorite status using the real Supabase service
    const result = await clothesService.toggleFavorite(item.id)
    
    if (result.success) {
      item.is_favorite = result.data.is_favorite
      console.log('Cabinet: Toggled favorite for item:', item.name, 'New status:', item.is_favorite)
    } else {
      console.error('Cabinet: Failed to toggle favorite:', result.error)
    }
  } catch (error) {
    console.error('Cabinet: Error toggling favorite:', error)
  }
}


// Handle item added from modal
const handleItemAdded = async () => {
  console.log('Cabinet: Item added, refreshing list...')
  await loadItems()
  showUpload.value = false
}

// Item details modal functions
const openItemDetails = (item) => {
  selectedItem.value = item
  showItemDetails.value = true
}

const closeItemDetails = () => {
  showItemDetails.value = false
  selectedItem.value = null
}

const handleItemRemoved = async (itemId) => {
  console.log('Cabinet: Item removed, refreshing list...')
  await loadItems()
}

const handleItemUpdated = async () => {
  console.log('Cabinet: Item updated, refreshing list...')
  await loadItems()
}

onMounted(async () => {
  console.log('Cabinet: Component mounted, initializing...')
  
  // Ensure auth store is initialized
  if (!authStore.isAuthenticated) {
    console.log('Cabinet: Auth not initialized, initializing...')
    await authStore.initializeAuth()
  }
  
  console.log('Cabinet: Current user state:', {
    isAuthenticated: authStore.isAuthenticated,
    userId: authStore.user?.id,
    userEmail: authStore.user?.email,
    profile: authStore.profile
  })
  
  // Only load items if user is authenticated
  if (authStore.isAuthenticated && authStore.user?.id) {
    console.log('Cabinet: User is authenticated, loading items...')
    await loadItems()
    
    // Fetch profile in background (non-blocking)
    if (!authStore.profile) {
      console.log('Cabinet: Fetching user profile in background...')
      // Don't await this - let it run in background
      authStore.fetchUserProfile().catch(error => {
        console.warn('Cabinet: Background profile fetch failed:', error)
      })
    }
  } else {
    console.log('Cabinet: User not authenticated, skipping item loading')
    loading.value = false
  }
})

// Liquid glass event handlers
const handleItemHover = (event, index) => {
  itemHoverIn(event.target)
}

const handleItemLeave = (event, index) => {
  itemHoverOut(event.target)
}

const handleItemMouseMove = (event, index) => {
  // Apply subtle parallax to item cards
  const card = event.target
  const rect = card.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = (y - centerY) / centerY * 1.5
  const rotateY = (x - centerX) / centerX * 1.5
  
  card.style.transform = `translateY(-6px) translateZ(12px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg)`
}

const handleFavoritePress = (event, item) => {
  favoritePressIn(event.target)
}

const handleFavoriteRelease = (event, item) => {
  favoritePressOut(event.target)
  // Add heart pulse animation
  event.target.classList.add('heart-pulse')
  setTimeout(() => {
    event.target.classList.remove('heart-pulse')
  }, 300)
}

const handleSearch = () => {
  // Search is handled by computed property
}
</script>
