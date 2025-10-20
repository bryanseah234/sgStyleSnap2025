<template>
  <div class="min-h-screen p-6 md:p-12">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-start justify-between mb-8">
        <div>
          <h1 :class="`text-4xl font-bold mb-2 ${
            theme.value === 'dark' ? 'text-white' : 'text-black'
          }`">
            {{ subRouteTitle }}
          </h1>
          <p :class="`text-lg ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            {{ currentSubRoute === 'suggested' ? 'AI-powered outfit suggestions based on your wardrobe' : 
               currentSubRoute === 'personal' ? 'Create and save your personal looks' :
               currentSubRoute === 'friend' ? `Browse ${route.params.username}'s outfit collection` :
               'Create and save your perfect looks' }}
          </p>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <button
            @click="undoAction"
            :disabled="!canUndo"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              canUndo
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Undo"
          >
            <Undo class="w-5 h-5" />
          </button>
          
          <button
            @click="redoAction"
            :disabled="!canRedo"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              canRedo
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Redo"
          >
            <Redo class="w-5 h-5" />
          </button>
          
          <button
            @click="toggleGrid"
            :class="`p-3 rounded-lg transition-all duration-200 ${
              showGrid
                ? theme.value === 'dark'
                  ? 'bg-white text-black'
                  : 'bg-black text-white'
                : theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
            title="Toggle Grid"
          >
            <Grid3X3 class="w-5 h-5" />
          </button>
          
          <button
            @click="clearCanvas"
            :disabled="canvasItems.length === 0"
            :class="`p-3 rounded-lg transition-all duration-200 flex items-center gap-2 ${
              canvasItems.length > 0
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
            title="Clear Canvas"
          >
            <Trash2 class="w-5 h-5" />
            <span class="hidden sm:inline">Clear</span>
          </button>
          
          <button
            @click="saveOutfit"
            :disabled="canvasItems.length === 0 || savingOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              canvasItems.length > 0 && !savingOutfit
                ? theme.value === 'dark'
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'opacity-50 cursor-not-allowed'
            }`"
          >
            <Save class="w-5 h-5" />
            <span class="hidden sm:inline">Save Outfit</span>
          </button>
          
          <button
            @click="addOutfit"
            :class="`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            <Plus class="w-5 h-5" />
            <span class="hidden sm:inline">Add Outfit</span>
          </button>
        </div>
      </div>
      
      <!-- Sub-route Navigation -->
      <div v-if="currentSubRoute !== 'default'" class="mb-8">
        <div class="flex space-x-1 p-1 rounded-lg bg-stone-100 dark:bg-zinc-800">
          <button
            @click="$router.push('/outfits')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'default' 
                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' 
                : 'text-stone-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`"
          >
            All Outfits
          </button>
          <button
            @click="$router.push('/outfits/add/suggested')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'suggested' 
                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' 
                : 'text-stone-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`"
          >
            <Sparkles class="w-4 h-4 inline mr-2" />
            Suggested
          </button>
          <button
            @click="$router.push('/outfits/add/personal')"
            :class="`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentSubRoute === 'personal' 
                ? 'bg-white dark:bg-zinc-700 text-black dark:text-white shadow-sm' 
                : 'text-stone-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`"
          >
            <User class="w-4 h-4 inline mr-2" />
            Personal
          </button>
        </div>
      </div>
      
      <!-- Sub-route Content -->
      <div v-if="currentSubRoute === 'suggested'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
        <div class="flex items-center gap-3 mb-4">
          <Sparkles class="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h3 class="text-xl font-semibold text-purple-900 dark:text-purple-100">AI Outfit Suggestions</h3>
        </div>
        <p class="text-purple-700 dark:text-purple-300 mb-4">
          Our AI analyzes your wardrobe and suggests perfect outfit combinations based on your style preferences, weather, and occasion.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700">
            <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">Casual Day Out</h4>
            <p class="text-sm text-purple-600 dark:text-purple-400">Perfect for running errands or meeting friends</p>
          </div>
          <div class="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700">
            <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">Work Professional</h4>
            <p class="text-sm text-purple-600 dark:text-purple-400">Sharp and confident for the office</p>
          </div>
          <div class="p-4 rounded-lg bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-700">
            <h4 class="font-medium text-purple-900 dark:text-purple-100 mb-2">Evening Event</h4>
            <p class="text-sm text-purple-600 dark:text-purple-400">Elegant and sophisticated for special occasions</p>
          </div>
        </div>
      </div>
      
      <div v-if="currentSubRoute === 'friend'" class="mb-8 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
        <div class="flex items-center gap-3 mb-4">
          <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 class="text-xl font-semibold text-blue-900 dark:text-blue-100">{{ route.params.username }}'s Outfits</h3>
        </div>
        <p class="text-blue-700 dark:text-blue-300 mb-4">
          Browse and get inspired by {{ route.params.username }}'s outfit collection. You can save their looks to your own collection.
        </p>
        <div class="text-center py-8">
          <Users class="w-16 h-16 text-blue-400 dark:text-blue-500 mx-auto mb-4" />
          <p class="text-blue-600 dark:text-blue-400">Loading {{ route.params.username }}'s outfits...</p>
        </div>
      </div>

      <!-- Main Content -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Left Sidebar - Item Selection -->
        <div class="lg:col-span-1">
          <!-- Items Source Dropdown -->
          <div :class="`rounded-xl p-4 mb-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <!-- First Row: Label -->
            <div class="flex items-center gap-3 mb-3">
              <User :class="`w-5 h-5 ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'
              }`" />
              <span :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
              }`">
                Items from:
              </span>
            </div>
            
            <!-- Second Row: Dropdown -->
            <div>
              <select
                v-model="itemsSource"
                :class="`w-full px-3 py-2 rounded-lg border text-sm ${
                  theme.value === 'dark'
                    ? 'bg-zinc-800 border-zinc-700 text-white'
                    : 'bg-white border-stone-300 text-black'
                }`"
              >
                <option value="my-cabinet">My Cabinet</option>
                <option value="friends">Friends' Items</option>
                <option value="suggestions">AI Suggestions</option>
              </select>
            </div>
          </div>

          <!-- Your Items Section -->
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <h3 :class="`text-lg font-bold mb-4 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              Your Items
            </h3>
            
            <!-- Category Filters -->
            <div class="flex flex-wrap gap-2 mb-6">
              <button
                v-for="category in categories"
                :key="category"
                @click="activeCategory = category"
                :class="`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category
                    ? theme.value === 'dark'
                      ? 'bg-white text-black'
                      : 'bg-black text-white'
                    : theme.value === 'dark'
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`"
              >
                {{ category === 'all' ? 'all' : category }}
              </button>
            </div>

            <!-- Items List -->
            <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
              <div
                v-for="item in filteredItems"
                :key="item.id"
                @click="addItemToCanvas(item)"
                :class="`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  theme.value === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-stone-100 hover:bg-stone-200'
                }`"
              >
                <div class="flex items-center gap-3">
                  <!-- Item Image -->
                  <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      v-if="item.image_url"
                      :src="item.image_url"
                      :alt="item.name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      v-else
                      :class="`w-full h-full flex items-center justify-center ${
                        theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                      }`"
                    >
                      <Shirt :class="`w-6 h-6 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
                    </div>
                  </div>
                  
                  <!-- Item Info -->
                  <div class="flex-1 min-w-0">
                    <p :class="`text-sm font-medium truncate ${
                      theme.value === 'dark' ? 'text-white' : 'text-black'
                    }`">
                      {{ item.name }}
                    </p>
                    <p :class="`text-xs truncate ${
                      theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
                    }`">
                      {{ item.category }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="filteredItems.length === 0" class="text-center py-8">
              <Shirt :class="`w-12 h-12 mx-auto mb-3 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
              <p :class="`text-sm ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                No items found
              </p>
            </div>
          </div>
        </div>

        <!-- Right Area - Outfit Canvas -->
        <div class="lg:col-span-3">
          <div :class="`rounded-xl p-6 ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`">
            <!-- Canvas Area -->
            <div
              ref="canvasContainer"
              :class="`relative w-full h-96 rounded-lg overflow-hidden ${
                theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-50'
              }`"
              @drop="handleDrop"
              @dragover.prevent
              @dragenter.prevent
            >
              <!-- Grid Background -->
              <div
                v-if="showGrid"
                class="absolute inset-0 opacity-20"
                :style="{
                  backgroundImage: `
                    linear-gradient(${theme.value === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px),
                    linear-gradient(90deg, ${theme.value === 'dark' ? '#ffffff' : '#000000'} 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }"
              />
              
              <!-- Canvas Items -->
              <div
                v-for="item in canvasItems"
                :key="item.id"
                :style="{
                  position: 'absolute',
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  zIndex: item.z_index || 0,
                  transform: `rotate(${item.rotation || 0}deg) scale(${item.scale || 1})`
                }"
                class="cursor-move select-none"
                @mousedown="startDrag(item, $event)"
                @click="selectItem(item.id)"
                :class="{
                  'ring-2 ring-blue-500': selectedItemId === item.id
                }"
              >
                <div class="w-16 h-16 rounded-lg overflow-hidden shadow-lg">
                  <img
                    v-if="item.image_url"
                    :src="item.image_url"
                    :alt="item.name"
                    class="w-full h-full object-cover"
                    draggable="false"
                  />
                  <div
                    v-else
                    :class="`w-full h-full flex items-center justify-center ${
                      theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                    }`"
                  >
                    <Shirt :class="`w-6 h-6 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
                  </div>
                </div>
              </div>
              
              <!-- Empty State -->
              <div
                v-if="canvasItems.length === 0"
                class="absolute inset-0 flex flex-col items-center justify-center"
              >
                <div :class="`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                  theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-200'
                }`">
                  <Sparkles :class="`w-6 h-6 text-orange-500`" />
                </div>
                <p :class="`text-lg ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
                  Start adding items to create your outfit
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import { useAuthStore } from '@/stores/auth-store'
import { api } from '@/api/base44Client'
import { 
  Undo, 
  Redo, 
  Grid3X3, 
  Trash2, 
  Save, 
  User, 
  Shirt, 
  Sparkles,
  Plus,
  Users
} from 'lucide-vue-next'

const { theme } = useTheme()
const authStore = useAuthStore()
const route = useRoute()

// Use computed to get reactive user data from auth store
const currentUser = computed(() => authStore.user || authStore.profile)

// Sub-route detection
const currentSubRoute = computed(() => route.meta.subRoute || 'default')
const subRouteTitle = computed(() => {
  switch (currentSubRoute.value) {
    case 'suggested': return 'Suggested Outfits'
    case 'personal': return 'Personal Outfits'
    case 'friend': return `Friend's Outfits`
    default: return 'Outfits'
  }
})

// State
const itemsSource = ref('my-cabinet')
const activeCategory = ref('all')
const wardrobeItems = ref([])
const canvasItems = ref([])
const selectedItemId = ref(null)
const showGrid = ref(false)
const savingOutfit = ref(false)
const canvasContainer = ref(null)

// History for undo/redo
const history = ref([[]])
const historyIndex = ref(0)

// Categories
const categories = ['all', 'tops', 'bottoms', 'shoes', 'accessories', 'outerwear']

// Computed
const filteredItems = computed(() => {
  let filtered = wardrobeItems.value
  console.log('Dashboard: Filtering items. Total items:', wardrobeItems.value.length, 'Category:', activeCategory.value)
  
  if (activeCategory.value !== 'all') {
    filtered = filtered.filter(item => item.category === activeCategory.value)
  }
  
  console.log('Dashboard: Filtered items:', filtered.length)
  return filtered
})

const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// Methods
const loadWardrobeItems = async () => {
  try {
    console.log('Dashboard: Loading wardrobe items...')
    
    // First, try to load ALL items to see what we have
    const allItems = await api.entities.ClothingItem.list('-created_at')
    console.log('Dashboard: ALL items in storage:', allItems)
    
    // Get user data
    const mockUser = await api.auth.me()
    console.log('Dashboard: Current user:', mockUser)
    
    // For now, just show ALL items to debug
    // This will help us see what's actually stored
    wardrobeItems.value = allItems
    console.log('Dashboard: Set wardrobeItems to all items:', allItems.length, 'items')
    
  } catch (error) {
    console.error('Error loading wardrobe items:', error)
    wardrobeItems.value = []
  }
}

const addItemToCanvas = (item) => {
  const newItem = {
    ...item,
    id: `${item.id}-${Date.now()}`,
    x: 50 + (canvasItems.value.length * 20),
    y: 50 + (canvasItems.value.length * 20),
    z_index: canvasItems.value.length,
    rotation: 0,
    scale: 1
  }
  
  canvasItems.value.push(newItem)
  saveToHistory()
  selectedItemId.value = newItem.id
}

const handleDrop = (event) => {
  event.preventDefault()
  const itemId = event.dataTransfer.getData('text/plain')
  const item = wardrobeItems.value.find(i => i.id === itemId)
  
  if (item) {
    const rect = canvasContainer.value.getBoundingClientRect()
    const x = event.clientX - rect.left - 32 // Center the item
    const y = event.clientY - rect.top - 32
    
    const newItem = {
      ...item,
      id: `${item.id}-${Date.now()}`,
      x: Math.max(0, Math.min(x, rect.width - 64)),
      y: Math.max(0, Math.min(y, rect.height - 64)),
      z_index: canvasItems.value.length,
      rotation: 0,
      scale: 1
    }
    
    canvasItems.value.push(newItem)
    saveToHistory()
    selectedItemId.value = newItem.id
  }
}

const startDrag = (item, event) => {
  selectedItemId.value = item.id
  
  const startX = event.clientX
  const startY = event.clientY
  const startItemX = item.x
  const startItemY = item.y
  
  const handleMouseMove = (e) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY
    
    item.x = Math.max(0, Math.min(startItemX + deltaX, canvasContainer.value.clientWidth - 64))
    item.y = Math.max(0, Math.min(startItemY + deltaY, canvasContainer.value.clientHeight - 64))
  }
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    saveToHistory()
  }
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const selectItem = (itemId) => {
  selectedItemId.value = itemId
}

const clearCanvas = () => {
  canvasItems.value = []
  selectedItemId.value = null
  saveToHistory()
}

const toggleGrid = () => {
  showGrid.value = !showGrid.value
}

const saveOutfit = async () => {
  if (canvasItems.value.length === 0) return
  
  savingOutfit.value = true
  try {
    const outfitData = {
      name: `My Outfit ${new Date().toLocaleDateString()}`,
      description: 'Created in Outfits',
      items: canvasItems.value.map(item => ({
        clothing_item_id: item.id.split('-')[0], // Get original item ID
        x: item.x,
        y: item.y,
        z_index: item.z_index,
        rotation: item.rotation,
        scale: item.scale
      }))
    }
    
    await api.entities.Outfit.create(outfitData)
    alert('Outfit saved successfully!')
  } catch (error) {
    console.error('Error saving outfit:', error)
    alert('Failed to save outfit.')
  } finally {
    savingOutfit.value = false
  }
}

const addOutfit = () => {
  // Function will be implemented later
  console.log('Add Outfit button clicked - function to be implemented')
}

const saveToHistory = () => {
  const currentState = JSON.parse(JSON.stringify(canvasItems.value))
  history.value = history.value.slice(0, historyIndex.value + 1)
  history.value.push(currentState)
  historyIndex.value = history.value.length - 1
  
  // Limit history size
  if (history.value.length > 50) {
    history.value.shift()
    historyIndex.value--
  }
}

const undoAction = () => {
  if (canUndo.value) {
    historyIndex.value--
    canvasItems.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

const redoAction = () => {
  if (canRedo.value) {
    historyIndex.value++
    canvasItems.value = JSON.parse(JSON.stringify(history.value[historyIndex.value]))
  }
}

// Lifecycle
onMounted(async () => {
  // Ensure auth store is initialized
  if (!authStore.isAuthenticated) {
    await authStore.initializeAuth()
  }
  
  // If we have a user but no profile, fetch the profile
  if (authStore.user && !authStore.profile) {
    await authStore.fetchUserProfile()
  }
  
  await loadWardrobeItems()
  saveToHistory() // Initialize history
})
</script>