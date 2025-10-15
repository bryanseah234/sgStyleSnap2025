<template>
  <div class="closet-filter">
    <!-- Category Filter -->
    <div class="filter-section">
      <label class="filter-label">Category</label>
      <select
        v-model="localFilters.category"
        class="filter-select"
        @change="handleCategoryChange"
      >
        <option value="">
          All Categories
        </option>
        <option
          v-for="category in MAIN_CATEGORIES"
          :key="category.value"
          :value="category.value"
        >
          {{ category.label }}
        </option>
      </select>
    </div>

    <!-- Clothing Type Filter -->
    <div class="filter-section">
      <label class="filter-label">Clothing Type</label>
      <select
        v-model="localFilters.clothing_type"
        class="filter-select"
        @change="handleTypeChange"
      >
        <option value="">
          All Types
        </option>
        <option
          v-for="type in filteredTypes"
          :key="type.value"
          :value="type.value"
        >
          {{ type.label }}
        </option>
      </select>
    </div>

    <!-- Privacy Filter -->
    <div class="filter-section">
      <label class="filter-label">Privacy</label>
      <select
        v-model="localFilters.privacy"
        class="filter-select"
        @change="emitFilters"
      >
        <option value="">
          All Items
        </option>
        <option value="private">
          Private Only
        </option>
        <option value="friends">
          Friends Only
        </option>
      </select>
    </div>

    <!-- Clear Filters Button -->
    <button
      v-if="hasActiveFilters"
      class="clear-button"
      @click="clearFilters"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { MAIN_CATEGORIES, CLOTHING_TYPES, getTypesForCategory, getCategoryFromType } from '@/config/constants'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      category: '',
      clothing_type: '',
      privacy: ''
    })
  }
})

const emit = defineEmits(['update:filters'])

const localFilters = ref({ ...props.filters })

watch(
  () => props.filters,
  newFilters => {
    localFilters.value = { ...newFilters }
  },
  { deep: true }
)

// Computed property for filtered types based on selected category
const filteredTypes = computed(() => {
  if (localFilters.value.category) {
    // If category is selected, only show types for that category
    return getTypesForCategory(localFilters.value.category)
  } else {
    // If no category selected, show all types
    return CLOTHING_TYPES
  }
})

const hasActiveFilters = computed(() => {
  return (
    localFilters.value.category || localFilters.value.clothing_type || localFilters.value.privacy
  )
})

// Handle category change
function handleCategoryChange() {
  // Clear clothing type if it doesn't belong to the selected category
  if (localFilters.value.clothing_type) {
    const typeCategory = getCategoryFromType(localFilters.value.clothing_type)
    if (typeCategory !== localFilters.value.category) {
      localFilters.value.clothing_type = ''
    }
  }
  emitFilters()
}

// Handle type change
function handleTypeChange() {
  // Auto-populate category based on selected type
  if (localFilters.value.clothing_type) {
    const category = getCategoryFromType(localFilters.value.clothing_type)
    if (category) {
      localFilters.value.category = category
    }
  }
  emitFilters()
}

function emitFilters() {
  emit('update:filters', { ...localFilters.value })
}

function clearFilters() {
  localFilters.value = {
    category: '',
    clothing_type: '',
    privacy: ''
  }
  emitFilters()
}
</script>

<style scoped>
.closet-filter {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
}

.filter-section {
  flex: 1;
  min-width: 150px;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  color: #111827;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  ring: 2px;
  ring-color: #3b82f6;
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

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .closet-filter {
    background: #1f2937;
  }

  .filter-label {
    color: #d1d5db;
  }

  .filter-select {
    background-color: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
}
</style>
