<template>
  <div>
    <!-- Filters Section -->
    <div :class="`rounded-2xl border p-6 mb-6 bg-white border-stone-200 dark:bg-zinc-900 dark:border-zinc-800`">
      <!-- Search Bar and Clear Filters Row -->
      <div class="flex items-center gap-3 mb-4">
        <!-- Search Bar (longer than button) -->
        <div class="flex-1 relative search-input-group">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400 dark:text-zinc-400" />
          <input
            ref="searchInputRef"
            v-model="searchTerm"
            type="text"
            placeholder="Search catalog (name, brand, category, color)..."
            class="w-full pl-10 pr-32 py-3 rounded-lg border bg-stone-100 dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-black dark:text-white placeholder-stone-500 dark:placeholder-zinc-400 search-input"
            @input="handleSearch"
            @focus="handleSearchFocus"
            @blur="handleSearchBlur"
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
            @click="clearFilters"
            :disabled="!hasActiveFilters"
            :class="`px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center gap-2 ${
              hasActiveFilters
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 cursor-pointer'
                : 'bg-stone-50 text-stone-400 dark:bg-zinc-900 dark:text-zinc-600 cursor-not-allowed opacity-50'
            }`"
          >
            <X class="w-4 h-4" />
            <span class="hidden sm:inline">Clear Filters</span>
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Category Filter -->
        <div>
          <label :class="`text-sm mb-2 block text-stone-600 dark:text-zinc-400`">
            Category
          </label>
          <select
            v-model="filters.category"
            :class="`w-full h-10 px-3 rounded-lg transition-colors bg-stone-50 border-stone-200 text-black border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white border`"
          >
            <option :value="null">All Categories</option>
            <option v-for="category in categories" :key="category.value" :value="category.value">
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
            v-model="filters.color"
            :class="`w-full h-10 px-3 rounded-lg transition-colors bg-stone-50 border-stone-200 text-black border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white border`"
          >
            <option :value="null">All Colors</option>
            <option v-for="color in colors" :key="color" :value="color">
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
            v-model="filters.brand"
            :class="`w-full h-10 px-3 rounded-lg transition-colors bg-stone-50 border-stone-200 text-black border dark:bg-zinc-800 dark:border-zinc-700 dark:text-white border`"
          >
            <option :value="null">All Brands</option>
            <option v-for="brand in brands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
        </div>

      </div>
    </div>

    <!-- Catalog Items Grid -->
    <div v-if="loading" class="flex flex-col items-center justify-center h-64">
      <div class="spinner-modern mb-4"></div>
      <p :class="`text-sm text-stone-600 dark:text-zinc-400`">
        Loading catalog items...
      </p>
    </div>

    <div v-else-if="filteredCatalogItems.length === 0" :class="`text-center py-16 rounded-2xl border bg-white border-stone-200 text-stone-600
    dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400`">
      <Shirt :class="`w-16 h-16 mx-auto mb-4 text-stone-400 dark:text-zinc-600`" />
      <p class="text-lg">
        {{ searchTerm || hasActiveFilters
          ? 'No items match your search or filters. Try adjusting or clearing them.'
          : 'No catalogue items available yet.' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="(item, index) in filteredCatalogItems"
        :key="item.id"
        :class="`stagger-item rounded-xl border overflow-hidden transition-all bg-white border-stone-200 hover:border-stone-300
        dark:bg-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-700`"
      >
        <!-- Item Image -->
        <div :class="`aspect-square bg-stone-100 dark:bg-zinc-800`">
          <img
            :src="item.image_url"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Item Info -->
        <div class="p-3">
          <h3 class="font-semibold text-sm mb-1 truncate text-foreground">
            {{ item.name }}
          </h3>
          
          <div class="mb-3">
            <span :class="`text-xs text-stone-500 dark:text-zinc-400`">
              {{ item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '' }}
              <span v-if="item.category && item.brand">,</span>
              <span v-if="item.brand" :class="`text-xs font-medium text-stone-600 dark:text-zinc-500`">
                {{ item.brand }}
              </span>
            </span>
          </div>

          <!-- Add Button -->
          <button
            @click="handleAddToCloset(item)"
            :disabled="addedItems.has(item.id) || addingItemId === item.id"
            :class="[
              'w-full', 'h-9', 'text-sm', 'rounded-lg', 'font-medium', 'transition-all', 'flex', 'items-center', 'justify-center', 'gap-1',
              'disabled:opacity-50', 'disabled:cursor-not-allowed',
              addedItems.has(item.id)
                ? ('bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300')
                : ('bg-black text-white hover:bg-stone-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100')
            ]"
          >
            <template v-if="addingItemId === item.id">
              <Plus class="w-4 h-4" />
              <span class="ellipsis-animated">Adding</span>
            </template>
            <template v-else-if="addedItems.has(item.id)">
              <Check class="w-4 h-4" />
              Added
            </template>
            <template v-else>
              <Plus class="w-4 h-4" />
              Add
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- Results Count -->
    <div v-if="!loading && filteredCatalogItems.length > 0" :class="`mt-8 text-center text-sm text-stone-500 dark:text-zinc-500`">
      Showing {{ filteredCatalogItems.length }} {{ filteredCatalogItems.length !== catalogItems.length ? `of ${catalogItems.length} ` : '' }}item{{ filteredCatalogItems.length !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { useSanitize } from '@/composables/useSanitize'
import { useKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'
import { catalogService } from '@/services/catalogService'
import { Plus, Check, X, Shirt, Search } from 'lucide-vue-next'

const { theme } = useTheme()
const { showError, showSuccess } = usePopup()
const { sanitizeSearch } = useSanitize()
const { registerSearchInput } = useKeyboardShortcuts()

const emit = defineEmits(['item-added'])

const catalogItems = ref([])
const categories = ref([])
const colors = ref([])
const brands = ref([])
const loading = ref(true)
const addedItems = ref(new Set())
const addingItemId = ref(null)
const searchTerm = ref('')
const searchInputRef = ref(null)

// Detect Mac for keyboard shortcut display
const isMac = ref(false)

const filters = ref({
  category: null,
  color: null,
  brand: null,
})

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(v => v !== null) || (searchTerm.value && searchTerm.value.trim().length > 0)
})

// Client-side filtering based on search term
const filteredCatalogItems = computed(() => {
  if (!searchTerm.value || !searchTerm.value.trim()) {
    return catalogItems.value
  }

  const query = searchTerm.value.toLowerCase().trim()
  
  return catalogItems.value.filter(item => {
    // Search in name
    const matchName = item.name?.toLowerCase().includes(query)
    
    // Search in brand
    const matchBrand = item.brand?.toLowerCase().includes(query)
    
    // Search in category
    const matchCategory = item.category?.toLowerCase().includes(query)
    
    // Search in color
    const matchColor = item.primary_color?.toLowerCase().includes(query) || 
                       item.color?.toLowerCase().includes(query)
    
    return matchName || matchBrand || matchCategory || matchColor
  })
})

const loadCatalogItems = async () => {
  loading.value = true
  try {
    const items = await catalogService.getCatalogItems({
      category: filters.value.category,
      color: filters.value.color,
      brand: filters.value.brand,
      limit: 50,
      offset: 0,
    })
    catalogItems.value = items
  } catch (error) {
    console.error('CatalogueBrowser: Error loading catalog items:', error)
    catalogItems.value = []
  } finally {
    loading.value = false
  }
}

const loadFilterOptions = async () => {
  try {
    const [categoriesData, colorsData, brandsData] = await Promise.all([
      catalogService.getCategories(),
      catalogService.getColors(),
      catalogService.getBrands(),
    ])
    categories.value = categoriesData
    colors.value = colorsData
    brands.value = brandsData
  } catch (error) {
    console.error('CatalogueBrowser: Error loading filter options:', error)
  }
}

const handleAddToCloset = async (item) => {
  if (addedItems.value.has(item.id) || addingItemId.value) return

  addingItemId.value = item.id
  try {
    // First check if item is already owned (additional safety check)
    const isOwned = await catalogService.isItemOwned(item.id)
    if (isOwned) {
      showError('This item is already in your closet. Please refresh the catalog to see updated items.')
      // Refresh catalog to remove the owned item
      await loadCatalogItems()
      return
    }

    const newItemId = await catalogService.addToCloset(item.id, 'friends')
    
    // Mark item as added
    addedItems.value.add(item.id)
    
    // Emit event to refresh parent's item list
    emit('item-added')
    
    // Refresh catalog to remove the added item
    await loadCatalogItems()
    
    console.log('CatalogueBrowser: Successfully added item to closet. New item ID:', newItemId)
  } catch (error) {
    console.error('CatalogueBrowser: Error adding to closet:', error)
    
    // Handle specific error cases
    if (error.message?.includes('already in closet')) {
      showError('This item is already in your closet. Please refresh the catalog to see updated items.')
      // Refresh catalog to remove the owned item
      await loadCatalogItems()
    } else {
      showError(error.message || 'Failed to add item to closet')
    }
  } finally {
    addingItemId.value = null
  }
}

const clearFilters = () => {
  filters.value = {
    category: null,
    color: null,
    brand: null,
  }
  searchTerm.value = ''
}

const handleSearch = () => {
  // Sanitize search input in real-time
  searchTerm.value = sanitizeSearch(searchTerm.value)
}

const handleSearchFocus = (event) => {
  event.target.classList.add('search-input-focus')
}

const handleSearchBlur = (event) => {
  event.target.classList.remove('search-input-focus')
}

// Watch for filter changes and reload items
watch(filters, () => {
  loadCatalogItems()
}, { deep: true })

onMounted(async () => {
  // Detect Mac OS
  isMac.value = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)
  
  await Promise.all([
    loadCatalogItems(),
    loadFilterOptions(),
  ])
  
  // Register search input for keyboard shortcuts after DOM is ready
  await nextTick()
  if (searchInputRef.value) {
    registerSearchInput(searchInputRef.value)
  }
})
</script>

