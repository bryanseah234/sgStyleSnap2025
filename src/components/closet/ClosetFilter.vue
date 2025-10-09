<template>
  <div class="closet-filter">
    <!-- Category Filter -->
    <div class="filter-section">
      <label class="filter-label">Category</label>
      <select
        v-model="localFilters.category"
        class="filter-select"
        @change="emitFilters"
      >
        <option value="">
          All Categories
        </option>
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

    <!-- Clothing Type Filter -->
    <div class="filter-section">
      <label class="filter-label">Clothing Type</label>
      <select
        v-model="localFilters.clothing_type"
        class="filter-select"
        @change="emitFilters"
      >
        <option value="">
          All Types
        </option>
        <option
          v-for="type in CLOTHING_TYPES"
          :key="type"
          :value="type"
        >
          {{ CLOTHING_TYPE_LABELS[type] || type }}
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
import { CATEGORY_GROUPS } from '@/config/constants'
import { CLOTHING_TYPES, CLOTHING_TYPE_LABELS } from '@/utils/clothing-constants'

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

watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters }
}, { deep: true })

const hasActiveFilters = computed(() => {
  return localFilters.value.category || localFilters.value.clothing_type || localFilters.value.privacy
})

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
  background: var(--bg-secondary);
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px var(--shadow-primary);
  margin-bottom: 1rem;
}

.dark .closet-filter {
  background: var(--bg-secondary);
}

.filter-section {
  flex: 1;
  min-width: 150px;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.dark .filter-label {
  color: var(--text-primary);
}

.filter-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--border-primary);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-primary);
  ring: 2px;
  ring-color: var(--accent-primary);
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
/* Dark mode styles moved above to be properly scoped */
</style>
