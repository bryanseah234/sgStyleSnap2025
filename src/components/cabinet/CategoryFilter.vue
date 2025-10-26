<template>
  <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
    <button
      v-for="category in categories"
      :key="category.id"
      @click="$emit('update:activeCategory', category.id)"
      :class="`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all duration-300 hover:scale-105 ${
        activeCategory === category.id
          ? theme.value === 'dark'
            ? 'bg-white text-black'
            : 'bg-black text-white'
          : theme.value === 'dark'
          ? 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
          : 'bg-white text-stone-600 hover:text-black border border-stone-200'
      }`"
    >
      {{ category.label }}
    </button>
  </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme'

// Props
defineProps({
  activeCategory: {
    type: String,
    default: 'all'
  }
})

// Emits
defineEmits(['update:activeCategory'])

// Theme
const { theme } = useTheme()

// Categories
const categories = [
  { id: 'all', label: 'All Items' },
  { id: 'tops', label: 'Tops' },
  { id: 'bottoms', label: 'Bottoms' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'outerwear', label: 'Outerwear' }
]
</script>
