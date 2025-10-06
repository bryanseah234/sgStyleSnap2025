<template>
  <div class="closet-filter">
    <!-- Category Filter -->
    <div class="filter-section">
      <label class="filter-label">Category</label>
      <select
        v-model="localFilters.category"
        @change="emitFilters"
        class="filter-select"
      >
        <option value="">All Categories</option>
        <optgroup
          v-for="(items, group) in CATEGORY_GROUPS"
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

    <!-- Privacy Filter -->
    <div class="filter-section">
      <label class="filter-label">Privacy</label>
      <select
        v-model="localFilters.privacy"
        @change="emitFilters"
        class="filter-select"
      >
        <option value="">All Items</option>
        <option value="private">Private Only</option>
        <option value="friends">Friends Only</option>
      </select>
    </div>

    <!-- Clear Filters Button -->
    <button
      v-if="hasActiveFilters"
      @click="clearFilters"
      class="clear-button"
    >
      Clear Filters
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { CATEGORY_GROUPS } from '@/config/constants'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({
      category: '',
      privacy: ''
    })
  }
})

const emit = defineEmits(['update:filters'])

const localFilters = ref({ ...props.filters })

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const hasActiveFilters = computed(() => {
  return localFilters.value.category || localFilters.value.privacy
})

function emitFilters() {
  emit('update:filters', { ...localFilters.value })
}

function clearFilters() {
  localFilters.value = {
    category: '',
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
