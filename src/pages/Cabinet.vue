<template>
  <div :class="`min-h-screen p-6 md:p-12 ${
    theme.value === 'dark' ? 'bg-black' : 'bg-white'
  }`">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold text-foreground">
          {{ subRouteTitle }}
        </h1>
        <div v-if="currentSubRoute === 'default'" class="relative">
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
            <svg :class="`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showAddMenu"
            :class="`absolute right-0 mt-2 w-64 rounded-xl shadow-xl border overflow-hidden z-50 ${
              theme.value === 'dark'
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-white border-stone-200'
            }`"
          >
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
      
      <!-- Sub-route Navigation -->
      <div v-if="currentSubRoute !== 'default'" class="mb-8">
        <div class="flex space-x-1 p-1 rounded-lg bg-stone-100 dark:bg-zinc-800">
          <button
            @click="$router.push('/closet')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'default' 
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            My Closet
          </button>
          <button
            @click="$router.push('/closet/add/manual')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'manual' 
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            <Plus class="w-4 h-4 inline mr-2" />
            Manual Add
          </button>
          <button
            @click="$router.push('/closet/add/catalogue')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'catalogue' 
                ? 'bg-card text-card-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`"
          >
            <Shirt class="w-4 h-4 inline mr-2" />
            Catalogue
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

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <button
          v-for="category in categories"
          :key="category"
          @click="activeCategory = category"
          :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeCategory === category
              ? theme.value === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          {{ category === 'all' ? 'All Items' : category }}
        </button>
        
        <button
          @click="showFavoritesOnly = !showFavoritesOnly"
          :class="`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
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

    <!-- Items Grid -->
    <div class="max-w-6xl mx-auto">
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="i in 8"
          :key="i"
          :class="`aspect-square rounded-xl animate-pulse ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-200'
          }`"
        />
      </div>

      <div v-else-if="filteredItems.length === 0" class="text-center py-12">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h3 :class="`text-xl font-semibold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          No items found
        </h3>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Start building your wardrobe by adding your first item!
        </p>
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

      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          :class="`group cursor-pointer transition-all duration-300 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          } rounded-xl overflow-hidden`"
        >
          <div class="aspect-square relative overflow-hidden">
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div
              v-else
              :class="`w-full h-full flex items-center justify-center ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
              }`"
            >
              <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
            </div>
            
            <button
              @click="toggleFavorite(item)"
              :class="`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                item.is_favorite
                  ? 'bg-red-500 text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80'
                  : 'bg-white/80 text-stone-500 hover:bg-stone-100/80'
              }`"
            >
              <Heart :class="`w-4 h-4 ${item.is_favorite ? 'fill-current' : ''}`" />
            </button>
          </div>
          
          <div class="p-4">
            <h3 :class="`font-semibold mb-1 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ item.name }}
            </h3>
            <p :class="`text-sm ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ item.brand || 'No brand' }}
            </p>
            <span :class="`inline-block px-2 py-1 mt-2 text-xs rounded-full ${
              theme.value === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-stone-100 text-stone-700'
            }`">
              {{ item.category }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadItemModal
      :is-open="showUpload"
      @close="showUpload = false"
      @item-added="handleItemAdded"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { ClothesService } from '@/services/clothesService'
import { Plus, Heart, Shirt } from 'lucide-vue-next'
import UploadItemModal from '@/components/cabinet/UploadItemModal.vue'
import ManualUploadForm from '@/components/cabinet/ManualUploadForm.vue'
import CatalogueBrowser from '@/components/cabinet/CatalogueBrowser.vue'

const { theme } = useTheme()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

// Sub-route detection
const currentSubRoute = computed(() => route.meta.subRoute || 'default')
const subRouteTitle = computed(() => {
  switch (currentSubRoute.value) {
    case 'manual': return 'Add Item Manually'
    case 'catalogue': return 'Browse Catalogue'
    case 'friend': return `${route.params.username}'s Closet`
    default: return 'Your Cabinet'
  }
})

// Initialize clothes service
const clothesService = new ClothesService()

// Use computed to get reactive user data from auth store
const currentUser = computed(() => authStore.user || authStore.profile)

const items = ref([])
const loading = ref(true)
const showUpload = ref(false)
const showAddMenu = ref(false)
const activeCategory = ref('all')
const showFavoritesOnly = ref(false)

const categories = ['all', 'top', 'bottom', 'outerwear', 'shoes', 'hat']

// Navigation methods
const navigateToManual = () => {
  showAddMenu.value = false
  router.push('/closet/add/manual')
}

const navigateToCatalogue = () => {
  showAddMenu.value = false
  router.push('/closet/add/catalogue')
}

const filteredItems = computed(() => {
  let filtered = items.value

  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }

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
</script>
