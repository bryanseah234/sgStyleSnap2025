<!--
  StyleSnap - Outfit Canvas Miniature Component
  
  A non-interactive miniature version of the outfit canvas for displaying
  outfit previews in cards and thumbnails.
  
  Features:
  - Displays outfit items in their saved positions
  - Scales proportionally to fit container
  - No interaction (view-only)
  - Theme-aware styling
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div 
    :class="`relative w-full h-full rounded-lg overflow-hidden ${
      theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-50'
    }`"
  >
    <!-- Canvas Background with subtle grid -->
    <div class="absolute inset-0 bg-gradient-to-br from-stone-50/50 to-stone-100/50 dark:from-zinc-800/50 dark:to-zinc-900/50">
      <div 
        class="absolute inset-0 opacity-10" 
        :class="theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-300'" 
        style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 15px 15px;"
      />
    </div>

    <!-- Empty State -->
    <div 
      v-if="!items || items.length === 0"
      class="absolute inset-0 flex items-center justify-center"
    >
      <Shirt :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
    </div>

    <!-- Outfit Items (scaled down) -->
    <div
      v-for="item in items"
      :key="item.id"
      class="absolute pointer-events-none select-none"
      :style="{
        left: `${scalePosition(item.x_position || item.x || 0)}px`,
        top: `${scalePosition(item.y_position || item.y || 0)}px`,
        zIndex: item.z_index || 0,
        transform: `rotate(${item.rotation || 0}deg) scale(${(item.scale || 1) * scaleFactor})`
      }"
    >
      <!-- Item Image (miniature) -->
      <div class="w-16 h-16 rounded-md overflow-hidden shadow-md bg-white dark:bg-zinc-700">
        <img
          v-if="item.clothing_item?.image_url || item.image_url"
          :src="item.clothing_item?.image_url || item.image_url"
          :alt="item.clothing_item?.name || item.name || 'Item'"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-zinc-600"
        >
          <Shirt class="w-5 h-5 text-stone-400 dark:text-zinc-400" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Shirt } from 'lucide-vue-next'

const { theme } = useTheme()

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  // Scale factor to make items smaller for miniature view
  scaleFactor: {
    type: Number,
    default: 0.5
  }
})

// Scale positions proportionally for miniature view
const scalePosition = (position) => {
  return position * props.scaleFactor
}
</script>

