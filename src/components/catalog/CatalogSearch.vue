<template>
  <div class="catalog-search">
    <div class="search-bar">
      <!-- Search Icon -->
      <div class="search-icon">
        <svg class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <!-- Search Input -->
      <input
        v-model="localQuery"
        type="text"
        placeholder="Search catalog items..."
        class="search-input"
        @keyup.enter="handleSearch"
        @input="handleInput"
      >
      
      
      <!-- Clear Button -->
      <button
        v-if="localQuery"
        class="clear-button"
        type="button"
        @click="handleClear"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>

  <!-- Recent Searches (future enhancement) -->
  <!-- 
  <div v-if="recentSearches.length > 0" class="mt-2">
    <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">Recent:</p>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="search in recentSearches"
        :key="search"
        @click="handleRecentSearch(search)"
        class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        {{ search }}
      </button>
    </div>
  </div>
  -->
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  debounce: {
    type: Number,
    default: 300
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'clear'])

const localQuery = ref(props.modelValue)
let debounceTimeout = null

// Watch for external changes
watch(
  () => props.modelValue,
  newVal => {
    localQuery.value = newVal
  }
)

function handleInput() {
  emit('update:modelValue', localQuery.value)

  // Debounce search
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }

  if (localQuery.value.trim()) {
    debounceTimeout = setTimeout(() => {
      emit('search', localQuery.value)
    }, props.debounce)
  }
}

function handleSearch() {
  if (localQuery.value.trim()) {
    emit('search', localQuery.value)
  }
}

function handleClear() {
  localQuery.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

// Recent searches (localStorage - future enhancement)
// const recentSearches = ref([])
// function handleRecentSearch(search) {
//   localQuery.value = search
//   emit('search', search)
// }
</script>

<style scoped>
.catalog-search {
  width: 100%;
  margin-bottom: 1rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  border-color: var(--theme-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Search Icon */
.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--theme-text-secondary);
  flex-shrink: 0;
}

/* Search Input */
.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--theme-text);
  outline: none;
  transition: all 0.2s ease;
}

.search-input::placeholder {
  color: var(--theme-text-muted);
}

.search-input:focus {
  outline: none;
}


/* Clear Button */
.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  background: transparent;
  border: none;
  color: var(--theme-text-muted);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.clear-button:hover {
  background: var(--theme-hover);
  color: var(--theme-text);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .search-bar {
    background: var(--theme-surface);
    border-color: var(--theme-border);
  }
  
  .search-bar:focus-within {
    border-color: var(--theme-primary);
  }
  
  .search-icon {
    color: var(--theme-text-secondary);
  }
  
  .search-input {
    color: var(--theme-text);
  }
  
  .search-input::placeholder {
    color: var(--theme-text-muted);
  }
  
  .clear-button {
    color: var(--theme-text-muted);
  }
  
  .clear-button:hover {
    background: var(--theme-hover);
    color: var(--theme-text);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .search-bar {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .search-bar {
    padding: 0.5rem;
  }
  
  .search-icon svg,
  .clear-button svg {
    width: 1rem;
    height: 1rem;
  }
}

/* Search suggestions (future enhancement) */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
}

.search-suggestion {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-suggestion:hover {
  background-color: #f9fafb;
}

.search-suggestion:first-child {
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
}

.search-suggestion:last-child {
  border-bottom-left-radius: 0.5rem;
  border-bottom-right-radius: 0.5rem;
}

/* Dark mode search suggestions */
.dark .search-suggestions {
  background: #374151;
  border-color: #4b5563;
}

.dark .search-suggestion:hover {
  background-color: #4b5563;
}

/* Loading state for search */
.search-loading {
  position: relative;
}

.search-loading::after {
  content: '';
  position: absolute;
  right: 3rem;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: translateY(-50%) rotate(0deg); }
  100% { transform: translateY(-50%) rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Focus styles for accessibility */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

button:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
