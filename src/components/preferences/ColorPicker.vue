<template>
  <div class="color-picker">
    <label
      v-if="label"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
    </label>

    <!-- Selected Colors -->
    <div
      v-if="modelValue.length > 0"
      class="flex flex-wrap gap-2 mb-3"
    >
      <div
        v-for="color in modelValue"
        :key="color"
        class="flex items-center px-3 py-1.5 bg-gray-100 rounded-full group hover:bg-gray-200 transition-colors"
      >
        <div
          class="w-4 h-4 rounded-full mr-2 border border-gray-300"
          :style="{ backgroundColor: getColorHex(color) }"
        />
        <span class="text-sm text-gray-700">{{ capitalizeFirst(color) }}</span>
        <button
          class="ml-2 text-gray-400 hover:text-red-600 transition-colors"
          type="button"
          @click="removeColor(color)"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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

    <!-- Color Grid -->
    <div class="grid grid-cols-6 sm:grid-cols-9 gap-2">
      <button
        v-for="color in availableColors"
        :key="color.name"
        type="button"
        class="relative aspect-square rounded-lg border-2 transition-all hover:scale-110"
        :class="[
          isSelected(color.name)
            ? 'border-blue-500 ring-2 ring-blue-200'
            : 'border-gray-300 hover:border-gray-400',
          isDisabled(color.name) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
        :style="{ backgroundColor: color.hex }"
        :disabled="isDisabled(color.name)"
        :title="capitalizeFirst(color.name)"
        @click="toggleColor(color.name)"
      >
        <!-- Checkmark for selected colors -->
        <div
          v-if="isSelected(color.name)"
          class="absolute inset-0 flex items-center justify-center"
        >
          <svg
            class="w-6 h-6 text-white drop-shadow-lg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </button>
    </div>

    <!-- Helper Text -->
    <p
      v-if="maxColors"
      class="mt-2 text-xs text-gray-500"
    >
      {{ modelValue.length }}/{{ maxColors }} colors selected
      <span
        v-if="modelValue.length >= maxColors"
        class="text-orange-600 font-medium"
      >
        (Maximum reached)
      </span>
    </p>
  </div>
</template>

<script setup>
import {} from /* computed */ 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  label: {
    type: String,
    default: ''
  },
  maxColors: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

// 18 standard colors matching color detection system
const availableColors = [
  { name: 'red', hex: '#EF4444' },
  { name: 'orange', hex: '#F97316' },
  { name: 'yellow', hex: '#EAB308' },
  { name: 'green', hex: '#22C55E' },
  { name: 'blue', hex: '#3B82F6' },
  { name: 'purple', hex: '#A855F7' },
  { name: 'pink', hex: '#EC4899' },
  { name: 'brown', hex: '#92400E' },
  { name: 'black', hex: '#000000' },
  { name: 'white', hex: '#FFFFFF' },
  { name: 'gray', hex: '#6B7280' },
  { name: 'beige', hex: '#D4C5B9' },
  { name: 'navy', hex: '#1E3A8A' },
  { name: 'maroon', hex: '#7C2D12' },
  { name: 'olive', hex: '#65A30D' },
  { name: 'teal', hex: '#14B8A6' },
  { name: 'lavender', hex: '#C084FC' },
  { name: 'coral', hex: '#FB7185' }
]

const isSelected = colorName => {
  return props.modelValue.includes(colorName)
}

const isDisabled = colorName => {
  return props.maxColors && !isSelected(colorName) && props.modelValue.length >= props.maxColors
}

const toggleColor = colorName => {
  if (isDisabled(colorName)) return

  const newValue = isSelected(colorName)
    ? props.modelValue.filter(c => c !== colorName)
    : [...props.modelValue, colorName]

  emit('update:modelValue', newValue)
}

const removeColor = colorName => {
  const newValue = props.modelValue.filter(c => c !== colorName)
  emit('update:modelValue', newValue)
}

const getColorHex = colorName => {
  const color = availableColors.find(c => c.name === colorName)
  return color?.hex || '#CCCCCC'
}

const capitalizeFirst = str => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
/* Add any additional custom styles here */
</style>
