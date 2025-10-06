<template>
  <div class="catalog-filter bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
      <button
        v-if="hasActiveFilters"
        @click="emit('clear')"
        class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        Clear
      </button>
    </div>

    <!-- Category Filter -->
    <div class="filter-group mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Category
      </label>
      <select
        v-model="localFilters.category"
        @change="emitFilters"
        class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option :value="null">All Categories</option>
        <optgroup
          v-for="(items, group) in groupedCategories"
          :key="group"
          :label="group.charAt(0).toUpperCase() + group.slice(1)"
        >
          <option
            v-for="cat in items"
            :key="cat.value"
            :value="cat.value"
          >
            {{ cat.label }}
          </option>
        </optgroup>
      </select>
    </div>

    <!-- Color Filter -->
    <div class="filter-group mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Color
      </label>
      <select
        v-model="localFilters.color"
        @change="emitFilters"
        class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option :value="null">All Colors</option>
        <option
          v-for="color in COLORS"
          :key="color.value"
          :value="color.value"
        >
          {{ color.label }}
        </option>
      </select>
    </div>

    <!-- Brand Filter -->
    <div class="filter-group mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Brand
      </label>
      <select
        v-model="localFilters.brand"
        @change="emitFilters"
        class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option :value="null">All Brands</option>
        <option
          v-for="brand in filterOptions.brands"
          :key="brand"
          :value="brand"
        >
          {{ brand }}
        </option>
      </select>
    </div>

    <!-- Season Filter -->
    <div class="filter-group mb-4">
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Season
      </label>
      <select
        v-model="localFilters.season"
        @change="emitFilters"
        class="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option :value="null">All Seasons</option>
        <option
          v-for="season in SEASONS"
          :key="season.value"
          :value="season.value"
        >
          {{ season.label }}
        </option>
      </select>
    </div>

    <!-- Active Filters Display -->
    <div v-if="hasActiveFilters" class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Active Filters:</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(value, key) in activeFilters"
          :key="key"
          class="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
        >
          {{ key }}: {{ getFilterLabel(key, value) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CLOTHING_CATEGORIES, CATEGORY_GROUPS, COLORS, SEASONS } from '@/config/constants'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  filterOptions: {
    type: Object,
    default: () => ({
      brands: [],
      colors: [],
      seasons: []
    })
  }
})

const emit = defineEmits(['update:filters', 'clear'])

const localFilters = ref({ ...props.filters })

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const groupedCategories = computed(() => CATEGORY_GROUPS)

const hasActiveFilters = computed(() => {
  return Object.values(localFilters.value).some(v => v !== null)
})

const activeFilters = computed(() => {
  const active = {}
  for (const [key, value] of Object.entries(localFilters.value)) {
    if (value !== null) {
      active[key] = value
    }
  }
  return active
})

function emitFilters() {
  emit('update:filters', { ...localFilters.value })
}

function getFilterLabel(key, value) {
  if (key === 'category') {
    const cat = CLOTHING_CATEGORIES.find(c => c.value === value)
    return cat ? cat.label : value
  }
  if (key === 'color') {
    const color = COLORS.find(c => c.value === value)
    return color ? color.label : value
  }
  if (key === 'season') {
    const season = SEASONS.find(s => s.value === value)
    return season ? season.label : value
  }
  return value
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
