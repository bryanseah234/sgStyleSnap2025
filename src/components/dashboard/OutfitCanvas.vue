<!--
  StyleSnap - Outfit Canvas Component
  
  Interactive canvas component for creating and editing outfits by dragging
  and dropping clothing items. Provides visual feedback, item manipulation,
  and real-time updates.
  
  Features:
  - Drag and drop clothing items
  - Visual grid overlay
  - Item selection and manipulation
  - Z-index management (bring forward/backward)
  - Resize and rotation controls
  - Real-time position updates
  - Theme-aware styling
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <!-- Main canvas container with drag-and-drop support -->
  <div class="relative w-full h-96 border-2 border-dashed rounded-xl overflow-hidden" :class="theme.value === 'dark' ? 'border-zinc-700' : 'border-stone-300'">
    <!-- Canvas Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-100 dark:from-zinc-800 dark:to-zinc-900">
      <!-- Grid Pattern -->
      <div v-if="showGrid" class="absolute inset-0 opacity-20" :class="theme.value === 'dark' ? 'bg-zinc-700' : 'bg-stone-300'" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 20px 20px;"></div>
    </div>

    <!-- Outfit Items -->
    <div
      v-for="item in items"
      :key="item.id"
      :class="`absolute cursor-move select-none transition-all duration-200 ${
        selectedItemId === item.id ? 'ring-2 ring-blue-500' : ''
      }`"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        zIndex: item.z_index || 0,
        transform: isDragging && dragStart.itemId === item.id ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` : 'none'
      }"
      @mousedown="startDrag(item.id, $event)"
      @click="setSelectedItemId(item.id)"
    >
      <!-- Item Image -->
      <div class="w-24 h-24 rounded-lg overflow-hidden shadow-lg bg-white dark:bg-zinc-800">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-zinc-700"
        >
          <Shirt class="w-8 h-8 text-stone-500 dark:text-zinc-400" />
        </div>
      </div>

      <!-- Item Controls (shown when selected) -->
      <div
        v-if="selectedItemId === item.id"
        class="absolute -top-12 left-1/2 transform -translate-x-1/2 flex gap-1"
      >
        <button
          @click="bringForward(item.id)"
          :class="`p-1 rounded bg-white dark:bg-zinc-800 shadow-lg hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors`"
          title="Bring Forward"
        >
          <ArrowUp class="w-3 h-3" />
        </button>
        <button
          @click="sendBackward(item.id)"
          :class="`p-1 rounded bg-white dark:bg-zinc-800 shadow-lg hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors`"
          title="Send Backward"
        >
          <ArrowDown class="w-3 h-3" />
        </button>
        <button
          @click="removeItem(item.id)"
          :class="`p-1 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-colors`"
          title="Remove Item"
        >
          <Trash2 class="w-3 h-3" />
        </button>
      </div>

      <!-- Item Label -->
      <div class="mt-1 text-center">
        <p class="text-xs font-medium text-stone-700 dark:text-zinc-300 truncate max-w-24">
          {{ item.name }}
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
      <div :class="`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
        theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-100'
      }`">
        <Palette :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
      </div>
      <h3 :class="`text-lg font-semibold mb-2 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Start Building Your Outfit
      </h3>
      <p :class="`text-sm ${
        theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
      }`">
        Drag items from your wardrobe to create the perfect look
      </p>
    </div>

    <!-- Canvas Instructions -->
    <div v-if="items.length > 0" class="absolute bottom-4 left-4 text-xs text-stone-500 dark:text-zinc-500">
      <p>Click and drag to move items • Click to select • Use controls to layer items</p>
    </div>
  </div>
</template>

<script setup>
/**
 * Outfit Canvas Component Script
 * 
 * Manages interactive outfit creation with drag-and-drop functionality,
 * item selection, and manipulation controls. Handles mouse events for
 * dragging, selection, and z-index management.
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Trash2, ArrowUp, ArrowDown, Shirt, Palette } from 'lucide-vue-next'

// Theme composable for styling
const { theme } = useTheme()

/**
 * Component Props
 * 
 * @typedef {Object} Props
 * @property {Array} items - Array of clothing items on the canvas
 * @property {string|null} selectedItemId - ID of currently selected item
 * @property {boolean} showGrid - Whether to show the grid overlay
 */
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  selectedItemId: {
    type: String,
    default: null
  },
  showGrid: {
    type: Boolean,
    default: true
  }
})

/**
 * Component Events
 * 
 * Emits events for parent component communication:
 * - update:selectedItemId - When item selection changes
 * - updateItem - When item properties are updated
 * - removeItem - When an item should be removed
 */
const emit = defineEmits(['update:selectedItemId', 'updateItem', 'removeItem'])

// Drag and drop state management
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, itemId: null })
const dragOffset = ref({ x: 0, y: 0 })

/**
 * Sets the selected item ID and emits update event
 * 
 * @param {string} id - ID of the item to select
 */
const setSelectedItemId = (id) => {
  emit('update:selectedItemId', id)
}

/**
 * Initiates drag operation for an item
 * 
 * Sets up drag state and event listeners for mouse movement and release.
 * Prevents default behavior to avoid text selection during drag.
 * 
 * @param {string} itemId - ID of the item being dragged
 * @param {MouseEvent} event - Mouse down event
 */
const startDrag = (itemId, event) => {
  event.preventDefault()
  isDragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    itemId
  }
  dragOffset.value = { x: 0, y: 0 }
  
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', stopDrag)
}

const handleDrag = (event) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y
  
  dragOffset.value = { x: deltaX, y: deltaY }
}

const stopDrag = () => {
  if (!isDragging.value) return
  
  const item = props.items.find(i => i.id === dragStart.value.itemId)
  if (item) {
    const newX = Math.max(0, item.x + dragOffset.value.x)
    const newY = Math.max(0, item.y + dragOffset.value.y)
    
    emit('updateItem', dragStart.value.itemId, { x: newX, y: newY })
  }
  
  isDragging.value = false
  dragStart.value = { x: 0, y: 0, itemId: null }
  dragOffset.value = { x: 0, y: 0 }
  
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
}

const removeItem = (itemId) => {
  emit('removeItem', itemId)
}

const bringForward = (itemId) => {
  const item = props.items.find(i => i.id === itemId)
  if (!item) return
  
  const maxZIndex = Math.max(...props.items.map(i => i.z_index || 0), 0)
  if ((item.z_index || 0) < maxZIndex) {
    emit('updateItem', itemId, { z_index: (item.z_index || 0) + 1 })
  }
}

const sendBackward = (itemId) => {
  const item = props.items.find(i => i.id === itemId)
  if (!item) return
  
  if ((item.z_index || 0) > 0) {
    emit('updateItem', itemId, { z_index: (item.z_index || 0) - 1 })
  }
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', stopDrag)
})
</script>