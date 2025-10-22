<template>
  <div :class="`min-h-screen p-6 md:p-12 ${
    theme.value === 'dark' ? 'bg-black' : 'bg-white'
  }`">
    <!-- Header -->
    <div class="max-w-6xl mx-auto mb-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-4xl font-bold text-foreground mb-2">
            Your Outfits
          </h1>
          <p :class="`text-lg ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Browse and manage your saved outfit combinations
          </p>
        </div>
        
        <!-- Add Outfit Dropdown Button -->
        <div class="relative">
          <button
            @click="showAddMenu = !showAddMenu"
            :class="`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            <Plus class="w-5 h-5" />
            Add Outfit
            <ChevronDown :class="`w-4 h-4 transition-transform ${showAddMenu ? 'rotate-180' : ''}`" />
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
              @click="navigateToCreate('personal')"
              :class="`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-white'
                  : 'hover:bg-stone-50 text-black'
              }`"
            >
              <User class="w-5 h-5" />
              <div>
                <div class="font-medium">Manual Creation</div>
                <div :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">
                  Create your own outfit combinations
                </div>
              </div>
            </button>
            
            <button
              @click="navigateToCreate('friend')"
              :class="`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-white'
                  : 'hover:bg-stone-50 text-black'
              }`"
            >
              <Users class="w-5 h-5" />
              <div>
                <div class="font-medium">Friend Creation</div>
                <div :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">
                  Use items from friends' closets
                </div>
              </div>
            </button>
            
            <button
              @click="navigateToCreate('suggested')"
              :class="`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-white'
                  : 'hover:bg-stone-50 text-black'
              }`"
            >
              <Sparkles class="w-5 h-5" />
              <div>
                <div class="font-medium">AI Suggestions</div>
                <div :class="`text-xs ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`">
                  Get AI-powered outfit recommendations
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="flex flex-wrap gap-4 mb-6">
        <button
          v-for="filter in filters"
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeFilter === filter.value
              ? theme.value === 'dark'
                ? 'bg-white text-black'
                : 'bg-black text-white'
              : theme.value === 'dark'
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Outfits Grid -->
    <div class="max-w-6xl mx-auto">
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="i in 6"
          :key="i"
          :class="`aspect-square rounded-xl skeleton-shimmer ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-200'
          }`"
        />
      </div>

      <div v-else-if="filteredOutfits.length === 0" class="text-center py-12">
        <div :class="`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
          <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <h3 :class="`text-xl font-semibold mb-2 ${
          theme.value === 'dark' ? 'text-white' : 'text-black'
        }`">
          No outfits found
        </h3>
        <p :class="`text-lg mb-4 ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Start creating your first outfit!
        </p>
        <button
          @click="navigateToCreate('personal')"
          :class="`px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-white text-black hover:bg-zinc-200'
              : 'bg-black text-white hover:bg-zinc-800'
          }`"
        >
          Create Outfit
        </button>
      </div>

      <TransitionGroup 
        v-else 
        name="list" 
        tag="div" 
        class="grid grid-cols-2 md:grid-cols-3 gap-6"
      >
        <div
          v-for="(outfit, index) in filteredOutfits"
          :key="outfit.id"
          :class="`group cursor-pointer transition-all duration-300 hover:scale-105 ${
            theme.value === 'dark'
              ? 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
              : 'bg-white border border-stone-200 hover:border-stone-300'
          } rounded-xl overflow-hidden`"
          :style="{ transitionDelay: `${index * 50}ms` }"
          @click="viewOutfit(outfit)"
        >
          <div class="aspect-square relative overflow-hidden">
            <!-- Outfit Canvas Miniature (shows items in their positions) -->
            <OutfitCanvasMiniature 
              :items="outfit.outfit_items || []"
              :scale-factor="0.4"
            />
            
            <!-- Favorite button (top right) -->
            <button
              @click.stop="toggleFavorite(outfit)"
              :class="`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                outfit.is_favorite
                  ? 'bg-red-500 text-white'
                  : theme.value === 'dark'
                  ? 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700/80'
                  : 'bg-white/80 text-stone-500 hover:bg-stone-100/80'
              }`"
            >
              <Heart :class="`w-4 h-4 ${outfit.is_favorite ? 'fill-current' : ''}`" />
            </button>
            
            <!-- Action buttons overlay -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
              <button
                @click.stop="editOutfit(outfit)"
                :class="`p-3 rounded-xl transition-all duration-200 ${
                  theme.value === 'dark'
                    ? 'bg-white text-black hover:bg-zinc-200'
                    : 'bg-black text-white hover:bg-zinc-800'
                }`"
                title="Edit"
              >
                <Pencil class="w-5 h-5" />
              </button>
              <button
                @click.stop="deleteOutfit(outfit)"
                class="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
                title="Delete"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div class="p-4">
            <h3 :class="`font-semibold mb-1 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ outfit.outfit_name || outfit.name || 'Untitled Outfit' }}
            </h3>
            <p :class="`text-sm ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ outfit.item_count || 0 }} items
            </p>
            <p :class="`text-xs mt-1 ${
              theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
            }`">
              {{ formatDate(outfit.created_at) }}
            </p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Click outside to close dropdown -->
    <div
      v-if="showAddMenu"
      class="fixed inset-0 z-40"
      @click="showAddMenu = false"
    />

    <!-- Outfit Detail Modal -->
    <Transition name="modal-backdrop">
      <div
        v-if="showOutfitDetail && selectedOutfit"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click="closeOutfitDetail"
      >
        <Transition name="modal" appear>
          <div
            v-if="showOutfitDetail && selectedOutfit"
            :class="`relative w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden ${
              theme.value === 'dark' ? 'bg-zinc-900' : 'bg-white'
            }`"
            @click.stop
          >
        <!-- Modal Header -->
        <div :class="`p-6 border-b ${
          theme.value === 'dark' ? 'border-zinc-800' : 'border-stone-200'
        }`">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h2 :class="`text-2xl font-bold mb-2 ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">
                {{ selectedOutfit.outfit_name || selectedOutfit.name || 'Untitled Outfit' }}
              </h2>
              <div class="flex items-center gap-4 text-sm">
                <span :class="`${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  {{ selectedOutfit.item_count || 0 }} items
                </span>
                <span :class="`${
                  theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                }`">
                  Created {{ formatDate(selectedOutfit.created_at) }}
                </span>
              </div>
            </div>
            
            <!-- Close button -->
            <button
              @click="closeOutfitDetail"
              :class="`icon-rotate-hover p-2 rounded-lg transition-all ${
                theme.value === 'dark'
                  ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
                  : 'hover:bg-stone-100 text-stone-500 hover:text-black'
              }`"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-rotate-hover">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto" style="max-height: calc(90vh - 180px);">
          <!-- Description -->
          <div v-if="selectedOutfit.description" class="mb-6">
            <h3 :class="`text-sm font-semibold mb-2 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Description
            </h3>
            <p :class="`${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              {{ selectedOutfit.description }}
            </p>
          </div>

          <!-- Outfit Items -->
          <div v-if="selectedOutfit.outfit_items && selectedOutfit.outfit_items.length > 0">
            <h3 :class="`text-sm font-semibold mb-4 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Items in this Outfit
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="outfitItem in selectedOutfit.outfit_items"
                :key="outfitItem.id"
                :class="`rounded-xl overflow-hidden ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border border-zinc-700'
                    : 'bg-stone-50 border border-stone-200'
                }`"
              >
                <div class="aspect-square relative">
                  <img
                    v-if="outfitItem.clothing_item?.image_url"
                    :src="outfitItem.clothing_item.image_url"
                    :alt="outfitItem.clothing_item.name"
                    class="w-full h-full object-cover"
                  />
                  <div
                    v-else
                    :class="`w-full h-full flex items-center justify-center ${
                      theme.value === 'dark' ? 'bg-zinc-900' : 'bg-stone-100'
                    }`"
                  >
                    <Shirt :class="`w-12 h-12 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
                  </div>
                </div>
                <div class="p-3">
                  <p :class="`text-sm font-medium truncate ${
                    theme.value === 'dark' ? 'text-white' : 'text-black'
                  }`">
                    {{ outfitItem.clothing_item?.name || 'Unknown Item' }}
                  </p>
                  <p :class="`text-xs truncate capitalize ${
                    theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
                  }`">
                    {{ outfitItem.clothing_item?.category || 'No category' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty state for items -->
          <div v-else class="text-center py-12">
            <Shirt :class="`w-16 h-16 mx-auto mb-4 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
            <p :class="`${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
              No items in this outfit
            </p>
          </div>

          <!-- Metadata -->
          <div v-if="selectedOutfit.occasion || selectedOutfit.weather_condition" class="mt-6 pt-6 border-t" :class="theme.value === 'dark' ? 'border-zinc-800' : 'border-stone-200'">
            <h3 :class="`text-sm font-semibold mb-3 ${
              theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
            }`">
              Additional Details
            </h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-if="selectedOutfit.occasion"
                :class="`px-3 py-1 rounded-full text-sm ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-stone-100 text-stone-700'
                }`"
              >
                {{ selectedOutfit.occasion }}
              </span>
              <span
                v-if="selectedOutfit.weather_condition"
                :class="`px-3 py-1 rounded-full text-sm ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-stone-100 text-stone-700'
                }`"
              >
                {{ selectedOutfit.weather_condition }}
              </span>
            </div>
          </div>
        </div>

        <!-- Modal Footer with Actions -->
        <div :class="`p-6 border-t flex items-center justify-end gap-3 ${
          theme.value === 'dark' ? 'border-zinc-800' : 'border-stone-200'
        }`">
          <button
            @click="closeOutfitDetail"
            :class="`px-6 py-3 rounded-xl font-medium transition-all ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            Close
          </button>
          <button
            @click="editOutfit(selectedOutfit)"
            :class="`px-6 py-3 rounded-xl font-medium transition-all ${
              theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-200'
                : 'bg-black text-white hover:bg-zinc-800'
            }`"
          >
            Edit Outfit
          </button>
        </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { OutfitsService } from '@/services/outfitsService'
import { Plus, Shirt, User, Users, Sparkles, ChevronDown, Pencil, Trash2, Heart } from 'lucide-vue-next'
import OutfitCanvasMiniature from '@/components/dashboard/OutfitCanvasMiniature.vue'

const { theme } = useTheme()
const authStore = useAuthStore()
const router = useRouter()

// Initialize outfits service
const outfitsService = new OutfitsService()

// Use computed to get reactive user data from auth store
const currentUser = computed(() => authStore.user || authStore.profile)

const outfits = ref([])
const loading = ref(true)
const showAddMenu = ref(false)
const activeFilter = ref('all')
const showOutfitDetail = ref(false)
const selectedOutfit = ref(null)

const filters = [
  { value: 'all', label: 'All Outfits' },
  { value: 'favorites', label: 'Favorites' }
]

const filteredOutfits = computed(() => {
  let filtered = outfits.value

  if (activeFilter.value === 'favorites') {
    filtered = filtered.filter(outfit => outfit.is_favorite)
  }

  return filtered
})

const loadOutfits = async () => {
  try {
    console.log('Outfits: Loading outfits for user:', currentUser.value?.id)
    
    if (!currentUser.value?.id) {
      console.log('Outfits: No user ID, cannot load outfits')
      outfits.value = []
      return
    }
    
    // Load outfits from Supabase using OutfitsService
    console.log('Outfits: Fetching from Supabase...')
    const data = await outfitsService.getOutfits({
      orderBy: '-created_at', // Most recent first
      limit: 50
    })
    
    // Transform outfit data to include item_count and preview
    outfits.value = (data || []).map(outfit => ({
      ...outfit,
      item_count: outfit.outfit_items?.length || 0,
      // Use first item's image as preview if no preview_url
      preview_url: outfit.preview_url || outfit.outfit_items?.[0]?.clothing_item?.image_url
    }))
    
    console.log('Outfits: Loaded', outfits.value.length, 'outfits from Supabase')
    
  } catch (error) {
    console.error('Outfits: Error loading outfits:', error)
    outfits.value = []
  } finally {
    loading.value = false
  }
}

const navigateToCreate = (type) => {
  showAddMenu.value = false
  
  if (type === 'personal') {
    router.push('/outfits/add/personal')
  } else if (type === 'friend') {
    // TODO: For now, navigate to a placeholder friend route
    router.push('/outfits/add/friend/placeholder')
  } else if (type === 'suggested') {
    router.push('/outfits/add/suggested')
  }
}

const viewOutfit = (outfit) => {
  // Show outfit details in modal
  selectedOutfit.value = outfit
  showOutfitDetail.value = true
}

const editOutfit = (outfit) => {
  // Navigate to outfit editor with outfit ID
  console.log('Edit outfit:', outfit)
  router.push(`/outfits/edit/${outfit.id}`)
}

const closeOutfitDetail = () => {
  showOutfitDetail.value = false
  selectedOutfit.value = null
}

const toggleFavorite = async (outfit) => {
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
    
    // Toggle the favorite status using the outfits service
    const result = await outfitsService.toggleFavorite(outfit.id)
    
    if (result.success) {
      outfit.is_favorite = result.data.is_favorite
      console.log('Outfits: Toggled favorite for outfit:', outfit.outfit_name || outfit.name, 'New status:', outfit.is_favorite)
    } else {
      console.error('Outfits: Failed to toggle favorite:', result.error)
    }
  } catch (error) {
    console.error('Outfits: Error toggling favorite:', error)
  }
}

const deleteOutfit = async (outfit) => {
  const outfitName = outfit.outfit_name || outfit.name || 'this outfit'
  if (confirm(`Are you sure you want to delete "${outfitName}"?`)) {
    try {
      console.log('Outfits: Deleting outfit:', outfit.id)
      await outfitsService.deleteOutfit(outfit.id)
      
      // Remove from local array
      outfits.value = outfits.value.filter(o => o.id !== outfit.id)
      
      // Close detail modal if the deleted outfit was being viewed
      if (selectedOutfit.value?.id === outfit.id) {
        closeOutfitDetail()
      }
      
      console.log('Outfits: Successfully deleted outfit')
    } catch (error) {
      console.error('Outfits: Error deleting outfit:', error)
      alert('Failed to delete outfit. Please try again.')
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  console.log('Outfits: Component mounted, initializing...')
  
  // Ensure auth store is initialized
  if (!authStore.isAuthenticated) {
    console.log('Outfits: Auth not initialized, initializing...')
    await authStore.initializeAuth()
  }
  
  // Only load outfits if user is authenticated
  if (authStore.isAuthenticated && authStore.user?.id) {
    console.log('Outfits: User is authenticated, loading outfits...')
    await loadOutfits()
  } else {
    console.log('Outfits: User not authenticated, skipping outfit loading')
    loading.value = false
  }
})
</script>

