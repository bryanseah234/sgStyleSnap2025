<template>
  <div class="catalog-filter bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h2>
      </div>
      <button
        v-if="hasActiveFilters"
        class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105 active:scale-95"
        @click="emit('clear')"
      >
        <svg class="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        Clear
      </button>
    </div>

    <!-- Category Filter -->
    <div class="filter-group mb-5">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Category
      </label>
      <select
        v-model="localFilters.category"
        class="block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
        @change="emitFilters"
      >
        <option :value="null">
          All Categories
        </option>
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
    <div class="filter-group mb-5">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"> Color </label>
      <select
        v-model="localFilters.color"
        class="block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
        @change="emitFilters"
      >
        <option :value="null">
          All Colors
        </option>
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
    <div class="filter-group mb-5">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"> Brand </label>
      <select
        v-model="localFilters.brand"
        class="block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
        @change="emitFilters"
      >
        <option :value="null">
          All Brands
        </option>
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
    <div class="filter-group mb-5">
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Season
      </label>
      <select
        v-model="localFilters.season"
        class="block w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-500"
        @change="emitFilters"
      >
        <option :value="null">
          All Seasons
        </option>
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
    <div
      v-if="hasActiveFilters"
      class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
    >
      <p class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
        Active Filters:
      </p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="(value, key) in activeFilters"
          :key="key"
          class="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-800 dark:text-blue-200 rounded-lg border border-blue-200 dark:border-blue-700"
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
watch(
  () => props.filters,
  newFilters => {
    localFilters.value = { ...newFilters }
  },
  { deep: true }
)

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
/* Filter container animations */
.catalog-filter {
  animation: slide-in 0.5s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Filter group animations */
.filter-group {
  animation: fade-in 0.6s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Select styling enhancements */
select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
}

select:focus {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
}

/* Active filter badge animations */
.filter-badge {
  animation: scale-in 0.3s ease-out;
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Hover effects for filter badges */
.filter-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.15);
}

/* Custom scrollbar for select elements */
select::-webkit-scrollbar {
  width: 6px;
}

select::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

select::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

select::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Dark mode select scrollbar */
.dark select::-webkit-scrollbar-track {
  background: #374151;
}

.dark select::-webkit-scrollbar-thumb {
  background: #6b7280;
}

.dark select::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .catalog-filter {
    position: static !important;
  }
}

/* Focus styles for accessibility */
select:focus,
button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Loading state for filter updates */
.filter-loading {
  opacity: 0.6;
  pointer-events: none;
}

/* Transition delays for staggered animations */
.filter-group:nth-child(1) { animation-delay: 0.1s; }
.filter-group:nth-child(2) { animation-delay: 0.2s; }
.filter-group:nth-child(3) { animation-delay: 0.3s; }
.filter-group:nth-child(4) { animation-delay: 0.4s; }
</style>
