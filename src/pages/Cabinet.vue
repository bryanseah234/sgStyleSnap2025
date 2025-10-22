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
        <button
          @click="showUpload = true"
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
      <div v-if="currentSubRoute === 'manual'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800">
        <div class="flex items-center gap-3 mb-4">
          <Plus class="w-6 h-6 text-green-600 dark:text-green-400" />
          <h3 class="text-xl font-semibold text-green-900 dark:text-green-100">Add Item Manually</h3>
        </div>
        <p class="text-green-700 dark:text-green-300 mb-4">
          Add your clothing items manually by filling out the form below. This gives you full control over the details.
        </p>
        <div class="text-center py-8">
          <Plus class="w-16 h-16 text-green-400 dark:text-green-500 mx-auto mb-4" />
          <p class="text-green-600 dark:text-green-400">Manual add form will be implemented here...</p>
        </div>
      </div>
      
      <div v-if="currentSubRoute === 'catalogue'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-3 mb-4">
          <Shirt class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 class="text-xl font-semibold text-blue-900 dark:text-blue-100">Browse Catalogue</h3>
        </div>
        <p class="text-blue-700 dark:text-blue-300 mb-4">
          Browse our curated catalogue of clothing items. Find pieces that match your style and add them to your closet.
        </p>
        <div class="text-center py-8">
          <Shirt class="w-16 h-16 text-blue-400 dark:text-blue-500 mx-auto mb-4" />
          <p class="text-blue-600 dark:text-blue-400">Catalogue browsing will be implemented here...</p>
        </div>
      </div>
      
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
    <div
      v-if="showUpload"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="showUpload = false"
    >
      <div
        :class="`w-full max-w-md rounded-xl p-6 ${
          theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
        }`"
        @click.stop
      >
        <h2 :class="`text-xl font-bold mb-4 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          Add New Item
        </h2>
        
        <form @submit.prevent="handleUpload">
          <div class="space-y-4">
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Item Name
              </label>
              <input
                v-model="newItem.name"
                type="text"
                required
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                    : 'bg-white border-stone-300 text-black placeholder-stone-500'
                }`"
                placeholder="Enter item name"
              />
            </div>
            
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Category
              </label>
              <select
                v-model="newItem.category"
                required
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                    : 'bg-white border-stone-300 text-black placeholder-stone-500'
                }`"
              >
                <option value="">Select category</option>
                <option value="tops">Tops</option>
                <option value="bottoms">Bottoms</option>
                <option value="outerwear">Outerwear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
              </select>
            </div>
            
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Brand
              </label>
              <input
                v-model="newItem.brand"
                type="text"
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                    : 'bg-white border-stone-300 text-black placeholder-stone-500'
                }`"
                placeholder="Enter brand (optional)"
              />
            </div>
            
            <div>
              <label :class="`block text-sm font-medium mb-2 ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Image
              </label>
              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                @change="handleFileSelect"
                :class="`w-full px-3 py-2 rounded-lg border ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                    : 'bg-white border-stone-300 text-black placeholder-stone-500'
                }`"
              />
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              type="button"
              @click="showUpload = false"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="uploading"
              :class="`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                theme.value === 'dark'
                  ? 'bg-white text-black hover:bg-zinc-200'
                  : 'bg-black text-white hover:bg-zinc-800'
              } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`"
            >
              {{ uploading ? 'Adding...' : 'Add Item' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { ClothesService } from '@/services/clothesService'
import { Plus, Heart, Shirt } from 'lucide-vue-next'

const { theme } = useTheme()
const authStore = useAuthStore()
const route = useRoute()

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
const activeCategory = ref('all')
const showFavoritesOnly = ref(false)
const uploading = ref(false)
const fileInput = ref(null)

const newItem = ref({
  name: '',
  category: '',
  brand: '',
  image_url: ''
})

const categories = ['all', 'tops', 'bottoms', 'outerwear', 'shoes', 'accessories']

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

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      newItem.value.image_url = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const handleUpload = async () => {
  if (!newItem.value.name || !newItem.value.category) return

  uploading.value = true
  try {
    console.log('Cabinet: Creating new item:', newItem.value)
    
    // Prepare item data for Supabase
    const itemData = {
      name: newItem.value.name,
      category: newItem.value.category,
      brand: newItem.value.brand || null,
      privacy: 'private', // Default to private
      is_favorite: false,
      style_tags: []
    }
    
    // If there's an image file, add it to the data
    if (fileInput.value?.files?.[0]) {
      itemData.image_file = fileInput.value.files[0]
    } else if (newItem.value.image_url) {
      // If it's a base64 image from file reader, we need to handle it differently
      // For now, we'll skip image upload if it's base64
      console.warn('Cabinet: Base64 images not supported in this version, skipping image')
    }
    
    // Create the item using the real Supabase service
    const result = await clothesService.addClothes(itemData)
    
    if (result.success) {
      items.value.unshift(result.data)
      console.log('Cabinet: Successfully created item:', result.data.name)
    } else {
      console.error('Cabinet: Failed to create item:', result.error)
    }
    
    // Reset form
    newItem.value = {
      name: '',
      category: '',
      brand: '',
      image_url: ''
    }
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    showUpload.value = false
  } catch (error) {
    console.error('Cabinet: Error uploading item:', error)
  } finally {
    uploading.value = false
  }
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
