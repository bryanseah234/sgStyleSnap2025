<template>
  <div class="min-h-screen p-4 md:p-12 bg-background max-w-full overflow-x-hidden">
    <div class="max-w-5xl mx-auto">
      <!-- Loading -->
      <div v-if="isLoading" class="flex flex-col items-center py-16">
        <div class="spinner-modern mb-6"></div>
        <p class="text-stone-600 dark:text-zinc-400">Loading profile...</p>
      </div>

      <!-- Error -->
      <div v-else-if="errorMessage" class="text-center py-12">
        <p class="text-red-500 mb-4">{{ errorMessage }}</p>
        <button
          @click="goBack"
          class="px-4 py-2 rounded-lg font-medium bg-black text-white dark:bg-white dark:text-black">
          Go Back
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Header -->
        <div class="p-6 rounded-xl mb-6 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
          <!-- Desktop Layout -->
          <div class="hidden md:flex items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
                <img v-if="proxiedAvatarUrl" :src="proxiedAvatarUrl" :alt="friend?.name" class="w-full h-full object-cover" crossorigin="anonymous" @error="handleImageError" />
                <div v-else class="w-full h-full flex items-center justify-center bg-stone-200 dark:bg-zinc-700">
                  <span class="text-xl font-bold text-stone-500 dark:text-zinc-400">{{ initial }}</span>
                </div>
              </div>
              <div>
                <h1 class="text-2xl font-bold text-black dark:text-white">{{ friend?.name || 'Friend' }}</h1>
                <p class="text-sm text-stone-600 dark:text-zinc-400">@{{ friend?.username }}</p>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                @click="goCreateOutfitForFriend"
                class="px-4 py-2 rounded-lg font-medium bg-black text-white hover:bg-stone-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Create Outfit
              </button>
              <button
                @click="showUnfriend = true"
                class="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600">
                Unfriend
              </button>
            </div>
          </div>

          <!-- Mobile Layout - Centered -->
          <div class="md:hidden flex flex-col items-center text-center space-y-4">
            <div class="w-20 h-20 rounded-full overflow-hidden bg-stone-100 dark:bg-zinc-800">
              <img v-if="proxiedAvatarUrl" :src="proxiedAvatarUrl" :alt="friend?.name" class="w-full h-full object-cover" crossorigin="anonymous" @error="handleImageError" />
              <div v-else class="w-full h-full flex items-center justify-center bg-stone-200 dark:bg-zinc-700">
                <span class="text-2xl font-bold text-stone-500 dark:text-zinc-400">{{ initial }}</span>
              </div>
            </div>
            
            <div>
              <h1 class="text-2xl font-bold text-black dark:text-white">{{ friend?.name || 'Friend' }}</h1>
              <p class="text-sm text-stone-600 dark:text-zinc-400">@{{ friend?.username }}</p>
            </div>

            <div class="flex gap-2">
              <button
                @click="goCreateOutfitForFriend"
                class="px-4 py-2 rounded-lg font-medium bg-black text-white hover:bg-stone-900 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                Create Outfit
              </button>
              <button
                @click="showUnfriend = true"
                class="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600">
                Unfriend
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6">
          <button
            @click="activeTab = 'closet'"
            :class="`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'closet'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`">
            Closet
          </button>
          <button
            @click="activeTab = 'outfits'"
            :class="`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'outfits'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
            }`">
            Outfits
          </button>
        </div>

        <!-- Closet Tab -->
        <div v-if="activeTab === 'closet'">
          <!-- Filters Section -->
          <div class="mb-6">
            <div :class="`rounded-2xl border p-6 bg-white border-stone-200 dark:bg-zinc-900 dark:border-zinc-800`">
              <!-- Search Bar and Clear Filters Row -->
              <div class="flex items-center gap-3 mb-4">
                <!-- Search Bar (longer than button) -->
                <div class="flex-1 relative search-input-group">
                  <Search :class="`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-400`" />
                  <input
                    v-model="itemSearchTerm"
                    type="text"
                    :placeholder="`Search ${friend?.username || 'friend'}'s closet (name, brand, category, color)...`"
                    :class="`w-full pl-10 pr-32 py-3 rounded-lg border bg-stone-100 border-stone-300 text-black placeholder-stone-500 search-input
                      dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-400`"
                  />
                  <!-- Raycast-style keyboard hint -->
                  <div class="keyboard-hint hidden md:block">
                    <span class="keyboard-hint-key">{{ isMac ? '⌘' : 'Ctrl' }}</span>
                    <span>+</span>
                    <span class="keyboard-hint-key">K</span>
                  </div>
                </div>
                
                <!-- Clear Filters Button (same height as search bar) -->
                <div class="flex-shrink-0">
                  <button
                    @click="clearItemFilters"
                    :disabled="!hasActiveItemFilters"
                    :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
                      hasActiveItemFilters
                        ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer'
                        : 'bg-stone-50 text-stone-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed opacity-50'
                    }`"
                  >
                    <X class="w-4 h-4" />
                    <span class="hidden sm:inline">Clear Filters</span>
                  </button>
                </div>
              </div>
              
              <!-- Filter Toggle Button (Mobile Only) -->
              <button
                @click="filtersExpanded = !filtersExpanded"
                class="md:hidden w-full flex items-center justify-between py-3 px-4 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-200 dark:hover:bg-zinc-700 transition-all duration-200"
              >
                <span class="font-medium text-sm">Filters</span>
                <ChevronDown :class="`w-5 h-5 transition-transform duration-200 ${filtersExpanded ? 'rotate-180' : ''}`" />
              </button>
              
              <!-- Filter Dropdowns -->
              <div :class="`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all duration-300 ${filtersExpanded ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100 md:mt-0'} md:!mt-0`">
                <!-- Category Filter -->
                <div>
                  <label :class="`text-sm mb-2 block text-stone-600 dark:text-zinc-400`">
                    Category
                  </label>
                  <select
                    v-model="selectedItemCategory"
                    :class="`w-full h-10 px-3 rounded-lg transition-colors bg-stone-50 border-stone-200 text-black border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white`"
                  >
                    <option :value="null">All Categories</option>
                    <option v-for="category in availableItemCategoriesForDropdown" :key="category.value" :value="category.value">
                      {{ category.label }}
                    </option>
                  </select>
                </div>

                <!-- Color Filter -->
                <div>
                  <label :class="`text-sm mb-2 block text-stone-600 dark:text-zinc-400`">
                    Color
                  </label>
                  <select
                    v-model="selectedItemColor"
                    :class="`w-full h-10 px-3 rounded-lg transition-colors bg-stone-50 border-stone-200 text-black border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white`"
                  >
                    <option :value="null">All Colors</option>
                    <option v-for="color in availableItemColors" :key="color" :value="color">
                      {{ color.charAt(0).toUpperCase() + color.slice(1) }}
                    </option>
                  </select>
                </div>

                <!-- Brand Filter -->
                <div>
                  <label :class="`text-sm mb-2 block text-stone-600 dark:text-zinc-400`">
                    Brand
                  </label>
                  <select
                    v-model="selectedItemBrand"
                    :class="`w-full h-10 px-3 rounded-lg transition-colors bg-stone-50 border-stone-200 text-black border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white`"
                  >
                    <option :value="null">All Brands</option>
                    <option v-for="brand in availableItemBrands" :key="brand" :value="brand">
                      {{ brand }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Items Grid -->
          <div v-if="filteredItems.length === 0" class="text-center py-12">
            <p class="text-stone-600 dark:text-zinc-400">
              {{ hasActiveItemFilters ? 'No items found matching your filters.' : 'No public items shared.' }}
            </p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="item in filteredItems" 
              :key="item.id" 
              @click="openItemDetails(item)"
              class="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
              <div class="aspect-square bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                <img :src="item.image_url || item.thumbnail_url" :alt="item.name" class="w-full h-full object-cover" />
              </div>
              <div class="p-3">
                <p class="text-sm font-medium truncate text-black dark:text-white">{{ item.name }}</p>
                <p class="text-xs text-stone-600 dark:text-zinc-400">{{ item.category }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Outfits Tab -->
        <div v-else>
          <!-- Search Bar -->
          <div class="mb-6">
            <div class="relative search-input-group">
              <Search :class="`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-400`" />
              <input
                v-model="outfitSearchTerm"
                type="text"
                :placeholder="`Search ${friend?.username || 'friend'}'s outfits (name, tags, occasion, style, items)...`"
                :class="`w-full pl-10 pr-32 py-3 rounded-lg border bg-stone-100 border-stone-300 text-black placeholder-stone-500 search-input
                  dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-400`"
              />
              <!-- Raycast-style keyboard hint -->
              <div class="keyboard-hint hidden md:block">
                <span class="keyboard-hint-key">{{ isMac ? '⌘' : 'Ctrl' }}</span>
                <span>+</span>
                <span class="keyboard-hint-key">K</span>
              </div>
            </div>
          </div>

          <!-- Outfits Grid -->
          <div v-if="filteredOutfits.length === 0" class="text-center py-12">
            <p class="text-stone-600 dark:text-zinc-400">
              {{ outfitSearchTerm ? 'No outfits found matching your search.' : 'No public outfits.' }}
            </p>
          </div>
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="outfit in filteredOutfits" 
              :key="outfit.id" 
              @click="openOutfitDetails(outfit)"
              class="rounded-xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800">
              <!-- Outfit Canvas -->
              <div class="aspect-video bg-stone-100 dark:bg-zinc-800 relative">
                <OutfitCanvasMiniature 
                  v-if="outfit.outfit_items && outfit.outfit_items.length > 0"
                  :items="outfit.outfit_items" 
                />
                <div v-else class="w-full h-full flex items-center justify-center">
                  <span class="text-sm text-stone-400 dark:text-zinc-500">No items</span>
                </div>
              </div>
              <div class="p-4">
                <p class="text-sm font-medium text-black dark:text-white">{{ outfit.outfit_name || 'Outfit' }}</p>
                <p class="text-xs text-stone-600 dark:text-zinc-400">{{ new Date(outfit.created_at).toLocaleDateString() }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Friend Item Details Modal -->
        <div v-if="showItemDetails" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm" @click="closeItemDetails">
          <div class="w-full max-w-2xl rounded-2xl shadow-2xl bg-white border border-stone-200 dark:bg-zinc-900 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]" @click.stop>
            <!-- Close Button with ESC Hint -->
            <div class="absolute top-4 right-4 z-50 flex items-center gap-2">
              <!-- ESC Key Hint (Desktop only) -->
              <div v-if="isDesktop" class="keyboard-hint-modal">
                <span class="keyboard-hint-key">ESC</span>
              </div>
              <button
                @click="closeItemDetails"
                class="p-2 rounded-lg transition-all bg-white/90 shadow-lg hover:bg-stone-100 text-stone-500 hover:text-black dark:bg-zinc-800/90 dark:hover:bg-zinc-700 dark:text-zinc-300 dark:hover:text-white"
                aria-label="Close dialog"
              >
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Content: Image on left, Details on right -->
            <div class="flex flex-col md:flex-row overflow-hidden">
              <!-- Left: Image -->
              <div class="w-full md:w-1/2 h-[250px] sm:h-[300px] md:h-[400px] relative overflow-hidden bg-stone-100 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center">
                <img
                  v-if="selectedItem?.image_url"
                  :src="selectedItem.image_url"
                  :alt="selectedItem.name"
                  class="w-full h-full object-contain p-4"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center"
                >
                  <Shirt class="w-16 h-16 text-stone-400 dark:text-zinc-600" />
                </div>
              </div>

              <!-- Right: Details -->
              <div class="w-full md:w-1/2 p-4 sm:p-6 pb-4 sm:pb-6 space-y-3 overflow-y-auto">
                <!-- Item Name & Category -->
                <div>
                  <h2 class="text-2xl font-bold mb-2 text-black dark:text-white">
                    {{ selectedItem?.name || 'Item Details' }}
                  </h2>
                  <span v-if="selectedItem?.category" class="inline-block px-3 py-1 text-sm rounded-full bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {{ selectedItem.category.charAt(0).toUpperCase() + selectedItem.category.slice(1) }}
                  </span>
                </div>

                <!-- Item Details -->
                <div class="space-y-3">
                  <div v-if="selectedItem?.brand">
                    <p class="text-sm font-medium text-stone-600 dark:text-zinc-400">Brand</p>
                    <p class="text-base text-black dark:text-white">{{ selectedItem.brand }}</p>
                  </div>

                  <div v-if="selectedItem?.color">
                    <p class="text-sm font-medium text-stone-600 dark:text-zinc-400">Color</p>
                    <p class="text-base text-black dark:text-white capitalize">{{ selectedItem.color }}</p>
                  </div>

                  <div v-if="selectedItem?.size">
                    <p class="text-sm font-medium text-stone-600 dark:text-zinc-400">Size</p>
                    <p class="text-base text-black dark:text-white">{{ selectedItem.size }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Friend Outfit Details Modal -->
        <div v-if="showOutfitDetails" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="closeOutfitDetails">
          <div class="w-full max-w-2xl rounded-xl p-6 relative bg-white dark:bg-zinc-900" @click.stop>
            <!-- Close Button -->
            <button
              @click="closeOutfitDetails"
              class="absolute top-4 right-4 p-2 rounded-lg transition-all hover:bg-stone-100 text-stone-500 hover:text-black dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
            >
              <X class="w-5 h-5" />
            </button>

            <div class="pr-8">
              <h3 class="text-xl font-bold mb-1 text-black dark:text-white">
                {{ selectedOutfit?.outfit_name || 'Outfit Details' }}
              </h3>
              <div class="flex items-center gap-3 text-sm mb-4 text-stone-600 dark:text-zinc-400">
                <span v-if="selectedOutfit?.outfit_items" >{{ selectedOutfit.outfit_items.length }} items</span>
                <span v-if="selectedOutfit?.created_at">Created {{ new Date(selectedOutfit.created_at).toLocaleDateString() }}</span>
                <span v-if="selectedOutfit?.description" class="truncate max-w-[50%]">{{ selectedOutfit.description }}</span>
              </div>

              <div class="space-y-4">
                <!-- Outfit Canvas -->
                <div class="aspect-video bg-stone-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                  <OutfitCanvasMiniature 
                    v-if="selectedOutfit?.outfit_items && selectedOutfit.outfit_items.length > 0"
                    :items="selectedOutfit.outfit_items" 
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <span class="text-sm text-stone-400 dark:text-zinc-500">No items</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Unfriend Modal -->
        <div v-if="showUnfriend" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showUnfriend = false">
          <div class="w-full max-w-md rounded-xl p-6 bg-white dark:bg-zinc-900" @click.stop>
            <h3 class="text-xl font-bold mb-2 text-black dark:text-white">Unfriend {{ friend?.name }}?</h3>
            <p class="text-sm mb-4 text-stone-600 dark:text-zinc-400">This will remove them from your friends list.</p>
            <div class="flex gap-2 justify-end">
              <button class="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">Cancel</button>
              <button @click="confirmUnfriend" class="px-4 py-2 rounded-lg font-medium bg-red-500 text-white hover:bg-red-600">Unfriend</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { UserService } from '@/services/userService'
import { ClothesService } from '@/services/clothesService'
import { OutfitsService } from '@/services/outfitsService'
import { FriendsService } from '@/services/friendsService'
import OutfitCanvasMiniature from '@/components/dashboard/OutfitCanvasMiniature.vue'
import { X, Search, Shirt, ChevronDown } from 'lucide-vue-next'
import { getProxiedImageUrl } from '@/utils/imageProxy'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

const { theme } = useTheme()
const route = useRoute()
const router = useRouter()

const userService = new UserService()
const clothesService = new ClothesService()
const outfitsService = new OutfitsService()
const friendsService = new FriendsService()

const username = route.params.username

const isLoading = ref(true)
const errorMessage = ref('')
const friend = ref(null)
const publicItems = ref([])
const publicOutfits = ref([])
const activeTab = ref('closet')
const showUnfriend = ref(false)

// Search and filter state
const itemSearchTerm = ref('')
const outfitSearchTerm = ref('')
const selectedItemCategory = ref(null)
const selectedItemColor = ref(null)
const selectedItemBrand = ref(null)
const filtersExpanded = ref(false) // Filters expanded state (mobile only)

// Keyboard shortcuts
const { isMac } = useKeyboardShortcuts()

// Modal states
const showItemDetails = ref(false)
const showOutfitDetails = ref(false)
const selectedItem = ref(null)
const selectedOutfit = ref(null)
const isDesktop = ref(false)

const initial = computed(() => {
  const n = friend.value?.name || friend.value?.username || 'F'
  return n.charAt(0).toUpperCase()
})

// Computed property for proxied avatar URL (only proxies Google images)
const proxiedAvatarUrl = computed(() => {
  if (!friend.value?.avatar_url) return null
  return getProxiedImageUrl(friend.value.avatar_url)
})

const handleImageError = (event) => {
  console.log('❌ FriendProfile: Avatar image failed to load:', event.target.src)
  // Hide the broken image and show the fallback (initial letter)
  event.target.style.display = 'none'
}

// Handle ESC key for closing modals
const handleEsc = (e) => {
  if (e.key === 'Escape') {
    if (showItemDetails.value) {
      closeItemDetails()
    } else if (showOutfitDetails.value) {
      closeOutfitDetails()
    }
  }
}

// Handle window resize for desktop detection
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

onMounted(async () => {
  isDesktop.value = window.innerWidth >= 1024
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleEsc)
  await loadProfile()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEsc)
})

async function loadProfile() {
  try {
    isLoading.value = true
    errorMessage.value = ''

    // Friend basic info - get by username
    friend.value = await userService.getUserByUsername(username)
    
    if (!friend.value) {
      errorMessage.value = 'User not found'
      return
    }

    // Friends clothes (privacy friends)
    const itemsRes = await clothesService.getFriendCloset(friend.value.id)
    publicItems.value = itemsRes?.data || []

    // Friends outfits
    publicOutfits.value = await outfitsService.getFriendsOutfits(friend.value.id)
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to load friend profile'
  } finally {
    isLoading.value = false
  }
}

function goBack() { router.back() }

function goCreateOutfitForFriend() {
  // Navigate to friend outfits creation route defined in main.js
  if (friend.value?.username) {
    router.push(`/outfits/add/friend/${friend.value.username}`)
  } else {
    router.push('/outfits')
  }
}

async function confirmUnfriend() {
  try {
    // friendsService.removeFriend expects the friend's user id
    if (!friend.value?.id) {
      errorMessage.value = 'Cannot unfriend: user data not loaded'
      return
    }
    await friendsService.removeFriend(friend.value.id)
    showUnfriend.value = false
    router.push('/friends')
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to unfriend'
  }
}

// Item details modal functions
function openItemDetails(item) {
  selectedItem.value = item
  showItemDetails.value = true
}

function closeItemDetails() {
  showItemDetails.value = false
  selectedItem.value = null
}

// Outfit details modal functions
function openOutfitDetails(outfit) {
  selectedOutfit.value = outfit
  showOutfitDetails.value = true
}

function closeOutfitDetails() {
  showOutfitDetails.value = false
  selectedOutfit.value = null
}

/**
 * Get available categories from friend's items for dropdown
 */
const availableItemCategoriesForDropdown = computed(() => {
  const raw = new Set(
    (publicItems.value || [])
      .map(i => (i.category || '').toLowerCase())
      .filter(Boolean)
  )
  const order = ['top', 'bottom', 'outerwear', 'shoes', 'accessory']
  const ordered = order.filter(cat => raw.has(cat))
  const extras = Array.from(raw).filter(cat => !order.includes(cat))
  
  const allCategories = [...ordered, ...extras]
  
  return allCategories.map(cat => {
    const labels = {
      'top': 'Tops',
      'bottom': 'Bottoms',
      'outerwear': 'Outerwear',
      'shoes': 'Shoes',
      'accessory': 'Accessories'
    }
    return {
      value: cat,
      label: labels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
    }
  })
})

/**
 * Available colors for dropdown filter
 */
const availableItemColors = computed(() => {
  const colors = new Set(
    (publicItems.value || [])
      .map(i => i.color)
      .filter(Boolean)
  )
  return Array.from(colors).sort()
})

/**
 * Available brands for dropdown filter
 */
const availableItemBrands = computed(() => {
  const brands = new Set(
    (publicItems.value || [])
      .map(i => i.brand)
      .filter(Boolean)
  )
  return Array.from(brands).sort()
})

/**
 * Check if any item filters are active
 */
const hasActiveItemFilters = computed(() => {
  return selectedItemCategory.value !== null || 
         selectedItemColor.value !== null || 
         selectedItemBrand.value !== null || 
         (itemSearchTerm.value && itemSearchTerm.value.trim().length > 0)
})

/**
 * Clear all item filters
 */
const clearItemFilters = () => {
  selectedItemCategory.value = null
  selectedItemColor.value = null
  selectedItemBrand.value = null
  itemSearchTerm.value = ''
}

/**
 * Filtered items based on search, category, color, and brand
 */
const filteredItems = computed(() => {
  let filtered = publicItems.value

  // Apply category filter
  if (selectedItemCategory.value !== null) {
    filtered = filtered.filter(item => item.category?.toLowerCase() === selectedItemCategory.value)
  }

  // Apply color filter
  if (selectedItemColor.value !== null) {
    filtered = filtered.filter(item => item.color?.toLowerCase() === selectedItemColor.value.toLowerCase())
  }

  // Apply brand filter
  if (selectedItemBrand.value !== null) {
    filtered = filtered.filter(item => item.brand?.toLowerCase() === selectedItemBrand.value.toLowerCase())
  }

  // Apply search filter
  if (itemSearchTerm.value && itemSearchTerm.value.trim()) {
    const query = itemSearchTerm.value.toLowerCase().trim()
    filtered = filtered.filter(item => 
      item.name?.toLowerCase().includes(query) ||
      item.brand?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query) ||
      item.color?.toLowerCase().includes(query)
    )
  }

  return filtered
})

/**
 * Filtered outfits based on search
 */
const filteredOutfits = computed(() => {
  let filtered = publicOutfits.value

  // Apply search filter
  if (outfitSearchTerm.value) {
    const query = outfitSearchTerm.value.toLowerCase()
    filtered = filtered.filter(outfit => 
      outfit.outfit_name?.toLowerCase().includes(query) ||
      outfit.description?.toLowerCase().includes(query) ||
      (outfit.outfit_items && outfit.outfit_items.some(item => 
        item.clothing_item?.name?.toLowerCase().includes(query)
      ))
    )
  }

  return filtered
})
</script>


