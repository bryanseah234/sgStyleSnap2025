<template>
  <div class="catalog-search">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        v-model="localQuery"
        type="text"
        placeholder="Search catalog items..."
        class="block w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        @keyup.enter="handleSearch"
        @input="handleInput"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          v-if="localQuery"
          @click="handleClear"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          type="button"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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
  </div>
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
watch(() => props.modelValue, (newVal) => {
  localQuery.value = newVal
})

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
/* Additional custom styles if needed */
</style>
