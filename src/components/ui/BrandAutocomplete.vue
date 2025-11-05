<template>
  <div class="relative">
    <input
      :id="id"
      :value="modelValue"
      @input="handleInput"
      @focus="showSuggestions = true"
      @blur="handleBlur"
      @keydown="handleKeydown"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :class="`w-full h-12 px-4 rounded-xl transition-colors bg-stone-50 border text-black
        dark:bg-zinc-800 dark:text-white 
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          error
            ? 'border-red-500 focus:ring-red-500 dark:border-red-500 dark:focus:ring-red-500'
            : 'border-stone-200 focus:ring-black dark:border-zinc-700 dark:focus:ring-white'
        }`"
    />
    
    <!-- Suggestions Dropdown -->
    <div
      v-if="showSuggestions && filteredSuggestions.length > 0"
      class="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg max-h-60 overflow-auto"
    >
      <ul class="py-1">
        <li
          v-for="(suggestion, index) in filteredSuggestions"
          :key="suggestion"
          @mousedown.prevent="selectSuggestion(suggestion)"
          :class="`px-4 py-2 cursor-pointer transition-colors ${
            index === highlightedIndex
              ? 'bg-stone-100 dark:bg-zinc-700 text-black dark:text-white'
              : 'text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-700'
          }`"
        >
          {{ suggestion }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { catalogService } from '@/services/catalogService'
import { toProperCase } from '@/utils/textFormatting'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'e.g., Nike'
  },
  maxlength: {
    type: Number,
    default: 50
  },
  error: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const showSuggestions = ref(false)
const highlightedIndex = ref(-1)
const catalogueBrands = ref([])
const isLoading = ref(false)

// Filter suggestions based on input
const filteredSuggestions = computed(() => {
  if (!props.modelValue || props.modelValue.trim().length === 0) {
    return catalogueBrands.value.slice(0, 10) // Show top 10 when empty
  }
  
  const searchTerm = props.modelValue.toLowerCase().trim()
  return catalogueBrands.value
    .filter(brand => brand.toLowerCase().includes(searchTerm))
    .slice(0, 10) // Limit to 10 suggestions
})

// Handle input
const handleInput = (event) => {
  const value = event.target.value
  emit('update:modelValue', value)
  highlightedIndex.value = -1
  showSuggestions.value = true
}

// Handle blur - delay to allow click on suggestion
const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false
    highlightedIndex.value = -1
    
    // Apply proper case when user finishes typing
    if (props.modelValue && props.modelValue.trim()) {
      const properCase = toProperCase(props.modelValue)
      if (properCase !== props.modelValue) {
        emit('update:modelValue', properCase)
      }
    }
  }, 200)
}

// Handle keyboard navigation
const handleKeydown = (event) => {
  if (!showSuggestions.value || filteredSuggestions.value.length === 0) {
    if (event.key === 'Enter') {
      // Apply proper case on Enter
      if (props.modelValue && props.modelValue.trim()) {
        const properCase = toProperCase(props.modelValue)
        emit('update:modelValue', properCase)
      }
    }
    return
  }
  
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    highlightedIndex.value = Math.min(
      highlightedIndex.value + 1,
      filteredSuggestions.value.length - 1
    )
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
  } else if (event.key === 'Enter' && highlightedIndex.value >= 0) {
    event.preventDefault()
    selectSuggestion(filteredSuggestions.value[highlightedIndex.value])
  } else if (event.key === 'Escape') {
    showSuggestions.value = false
    highlightedIndex.value = -1
  }
}

// Select a suggestion
const selectSuggestion = (brand) => {
  emit('update:modelValue', brand)
  showSuggestions.value = false
  highlightedIndex.value = -1
}

// Load brands from catalogue
const loadBrands = async () => {
  isLoading.value = true
  try {
    const brands = await catalogService.getBrands()
    // Convert all brands to proper case and remove duplicates
    const properCaseBrands = [...new Set(brands.map(brand => toProperCase(brand)))]
    catalogueBrands.value = properCaseBrands.sort()
  } catch (error) {
    console.error('Error loading brands from catalogue:', error)
    // Fallback to empty array if loading fails
    catalogueBrands.value = []
  } finally {
    isLoading.value = false
  }
}

// Load brands on mount
onMounted(() => {
  loadBrands()
})
</script>

