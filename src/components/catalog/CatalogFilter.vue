<template>
  <div class="catalog-filter">
    <div class="filter-header">
      <h2 class="filter-title">Filters</h2>
      <button
        v-if="hasActiveFilters"
        class="clear-button"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>

    <!-- Category Filter -->
    <div class="filter-section">
      <label class="filter-label">Category</label>
      <select
        v-model="localFilters.category"
        class="filter-select"
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
    <div class="filter-section">
      <label class="filter-label">Color</label>
      <select
        v-model="localFilters.color"
        class="filter-select"
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
    <div class="filter-section">
      <label class="filter-label">Brand</label>
      <select
        v-model="localFilters.brand"
        class="filter-select"
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
    <div class="filter-section">
      <label class="filter-label">Season</label>
      <select
        v-model="localFilters.season"
        class="filter-select"
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
      class="active-filters"
    >
      <p class="active-filters-title">Active Filters:</p>
      <div class="active-filters-list">
        <span
          v-for="(value, key) in activeFilters"
          :key="key"
          class="active-filter-tag"
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
.catalog-filter {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.filter-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--theme-text);
  margin: 0;
}

.filter-section {
  margin-bottom: 1rem;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--theme-text);
  margin-bottom: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--theme-border);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: var(--theme-surface);
  color: var(--theme-text);
}

.filter-select:focus {
  outline: none;
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.clear-button {
  padding: 0.5rem 1rem;
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: #dc2626;
}

.active-filters {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--theme-border);
}

.active-filters-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--theme-text);
  margin-bottom: 0.5rem;
}

.active-filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.active-filter-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background-color: var(--theme-primary);
  color: white;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .catalog-filter {
    background: var(--theme-surface);
  }

  .filter-label {
    color: var(--theme-text);
  }

  .filter-select {
    background-color: var(--theme-surface);
    color: var(--theme-text);
    border-color: var(--theme-border);
  }
}
</style>
