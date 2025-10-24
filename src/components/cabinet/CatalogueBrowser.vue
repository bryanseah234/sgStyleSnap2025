<template>
  <div>
    <!-- Filters Section -->
    <div :class="`rounded-2xl border p-6 mb-6 ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border-zinc-800'
        : 'bg-white border-stone-200'
    }`">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-foreground">
          Filter Items
        </h3>
        <button
          v-if="hasActiveFilters"
          @click="clearFilters"
          :class="`text-sm font-medium transition-colors ${
            theme.value === 'dark'
              ? 'text-zinc-400 hover:text-white'
              : 'text-stone-600 hover:text-black'
          }`"
        >
          <X class="w-4 h-4 inline mr-1" />
          Clear Filters
        </button>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Category Filter -->
        <div>
          <label :class="`text-sm mb-2 block ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Category
          </label>
          <select
            v-model="filters.category"
            :class="`w-full h-10 px-3 rounded-lg transition-colors ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white border'
                : 'bg-stone-50 border-stone-200 text-black border'
            }`"
          >
            <option :value="null">All Categories</option>
            <option v-for="category in categories" :key="category.value" :value="category.value">
              {{ category.label }} ({{ category.count }})
            </option>
          </select>
        </div>

        <!-- Color Filter -->
        <div>
          <label :class="`text-sm mb-2 block ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Color
          </label>
          <select
            v-model="filters.color"
            :class="`w-full h-10 px-3 rounded-lg transition-colors ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white border'
                : 'bg-stone-50 border-stone-200 text-black border'
            }`"
          >
            <option :value="null">All Colors</option>
            <option v-for="color in colors" :key="color" :value="color">
              {{ color.charAt(0).toUpperCase() + color.slice(1) }}
            </option>
          </select>
        </div>

        <!-- Brand Filter -->
        <div>
          <label :class="`text-sm mb-2 block ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Brand
          </label>
          <select
            v-model="filters.brand"
            :class="`w-full h-10 px-3 rounded-lg transition-colors ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white border'
                : 'bg-stone-50 border-stone-200 text-black border'
            }`"
          >
            <option :value="null">All Brands</option>
            <option v-for="brand in brands" :key="brand" :value="brand">
              {{ brand }}
            </option>
          </select>
        </div>

        <!-- Season Filter -->
        <div>
          <label :class="`text-sm mb-2 block ${
            theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
          }`">
            Season
          </label>
          <select
            v-model="filters.season"
            :class="`w-full h-10 px-3 rounded-lg transition-colors ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white border'
                : 'bg-stone-50 border-stone-200 text-black border'
            }`"
          >
            <option :value="null">All Seasons</option>
            <option v-for="season in seasons" :key="season" :value="season">
              {{ season.charAt(0).toUpperCase() + season.slice(1).replace('-', ' ') }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Catalog Items Grid -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="spinner-modern" />
    </div>

    <div v-else-if="catalogItems.length === 0" :class="`text-center py-16 rounded-2xl border ${
      theme.value === 'dark'
        ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
        : 'bg-white border-stone-200 text-stone-600'
    }`">
      <Shirt :class="`w-16 h-16 mx-auto mb-4 ${
        theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'
      }`" />
      <p class="text-lg">
        {{ hasActiveFilters
          ? 'No items match your filters. Try adjusting or clearing them.'
          : 'No catalogue items available yet.' }}
      </p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <div
        v-for="(item, index) in catalogItems"
        :key="item.id"
        :class="`stagger-item rounded-xl border overflow-hidden transition-all ${
          theme.value === 'dark'
            ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            : 'bg-white border-stone-200 hover:border-stone-300'
        }`"
      >
        <!-- Item Image -->
        <div :class="`aspect-square ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
        }`">
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
          
          <div class="flex items-center justify-between mb-3">
            <span :class="['text-xs', theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500']">
              {{ item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : '' }}
            </span>
            <span v-if="item.brand" :class="`text-xs font-medium ${
              theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-600'
            }`">
              {{ item.brand }}
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
                ? (theme.value === 'dark' ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700')
                : (theme.value === 'dark' ? 'bg-white text-black hover:bg-zinc-100' : 'bg-black text-white hover:bg-stone-900')
            ]"
          >
            <template v-if="addingItemId === item.id">
              <div class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Adding...
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
    <div v-if="!loading && catalogItems.length > 0" :class="`mt-8 text-center text-sm ${
      theme.value === 'dark' ? 'text-zinc-500' : 'text-stone-500'
    }`">
      Showing {{ catalogItems.length }} item{{ catalogItems.length !== 1 ? 's' : '' }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { catalogService } from '@/services/catalogService'
import { Plus, Check, X, Shirt } from 'lucide-vue-next'

const { theme } = useTheme()
const { showError, showSuccess } = usePopup()

const emit = defineEmits(['item-added'])

const catalogItems = ref([])
const categories = ref([])
const colors = ref([])
const brands = ref([])
const seasons = ref([])
const loading = ref(true)
const addedItems = ref(new Set())
const addingItemId = ref(null)

const filters = ref({
  category: null,
  color: null,
  brand: null,
  season: null,
})

const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some(v => v !== null)
})

const loadCatalogItems = async () => {
  loading.value = true
  try {
    const items = await catalogService.getCatalogItems({
      category: filters.value.category,
      color: filters.value.color,
      brand: filters.value.brand,
      season: filters.value.season,
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
    const [categoriesData, colorsData, brandsData, seasonsData] = await Promise.all([
      catalogService.getCategories(),
      catalogService.getColors(),
      catalogService.getBrands(),
      catalogService.getSeasons(),
    ])
    categories.value = categoriesData
    colors.value = colorsData
    brands.value = brandsData
    seasons.value = seasonsData
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
    season: null,
  }
}

// Watch for filter changes and reload items
watch(filters, () => {
  loadCatalogItems()
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    loadCatalogItems(),
    loadFilterOptions(),
  ])
})
</script>

