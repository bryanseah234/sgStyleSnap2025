<template>
  <div class="style-selector">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>

    <!-- Selected Styles -->
    <div v-if="modelValue.length > 0" class="flex flex-wrap gap-2 mb-3">
      <div
        v-for="style in modelValue"
        :key="style"
        class="flex items-center px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full group hover:bg-blue-200 transition-colors"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="text-sm font-medium">{{ capitalizeFirst(style) }}</span>
        <button
          @click="removeStyle(style)"
          class="ml-2 text-blue-600 hover:text-red-600 transition-colors"
          type="button"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Style Chips Grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      <button
        v-for="style in availableStyles"
        :key="style.value"
        @click="toggleStyle(style.value)"
        type="button"
        class="relative p-4 rounded-lg border-2 transition-all text-left group hover:shadow-md"
        :class="[
          isSelected(style.value)
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300',
          isDisabled(style.value) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
        :disabled="isDisabled(style.value)"
      >
        <!-- Icon -->
        <div class="flex items-center justify-center w-10 h-10 mb-2 rounded-full"
          :class="isSelected(style.value) ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'"
        >
          <span class="text-2xl">{{ style.icon }}</span>
        </div>

        <!-- Label -->
        <div class="font-medium text-sm text-gray-900">{{ style.label }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ style.description }}</div>

        <!-- Checkmark for selected -->
        <div
          v-if="isSelected(style.value)"
          class="absolute top-2 right-2"
        >
          <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </button>
    </div>

    <!-- Helper Text -->
    <p v-if="maxStyles" class="mt-3 text-xs text-gray-500">
      {{ modelValue.length }}/{{ maxStyles }} styles selected
      <span v-if="modelValue.length >= maxStyles" class="text-orange-600 font-medium">
        (Maximum reached)
      </span>
    </p>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  maxStyles: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const availableStyles = [
  {
    value: 'casual',
    label: 'Casual',
    icon: '👕',
    description: 'Relaxed everyday wear'
  },
  {
    value: 'formal',
    label: 'Formal',
    icon: '🤵',
    description: 'Business & dressy'
  },
  {
    value: 'minimalist',
    label: 'Minimalist',
    icon: '⚪',
    description: 'Simple & clean lines'
  },
  {
    value: 'bohemian',
    label: 'Bohemian',
    icon: '🌸',
    description: 'Free-spirited & artistic'
  },
  {
    value: 'streetwear',
    label: 'Streetwear',
    icon: '🛹',
    description: 'Urban & trendy'
  },
  {
    value: 'vintage',
    label: 'Vintage',
    icon: '🕰️',
    description: 'Retro & classic'
  },
  {
    value: 'athletic',
    label: 'Athletic',
    icon: '⚽',
    description: 'Sporty & active'
  },
  {
    value: 'preppy',
    label: 'Preppy',
    icon: '🎓',
    description: 'Polished & classic'
  },
  {
    value: 'edgy',
    label: 'Edgy',
    icon: '🔥',
    description: 'Bold & daring'
  }
]

const isSelected = (styleValue) => {
  return props.modelValue.includes(styleValue)
}

const isDisabled = (styleValue) => {
  return props.maxStyles && !isSelected(styleValue) && props.modelValue.length >= props.maxStyles
}

const toggleStyle = (styleValue) => {
  if (isDisabled(styleValue)) return
  
  const newValue = isSelected(styleValue)
    ? props.modelValue.filter(s => s !== styleValue)
    : [...props.modelValue, styleValue]
  
  emit('update:modelValue', newValue)
}

const removeStyle = (styleValue) => {
  const newValue = props.modelValue.filter(s => s !== styleValue)
  emit('update:modelValue', newValue)
}

const capitalizeFirst = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
