<template>
  <div
    ref="canvasRef"
    :class="`relative w-full h-96 rounded-xl overflow-hidden ${
      theme.value === 'dark' ? 'bg-zinc-900' : 'bg-stone-100'
    }`"
  >
    <!-- Grid Background -->
    <div
      v-if="showGrid"
      class="absolute inset-0 opacity-20"
      :style="{
        backgroundImage: `
          linear-gradient(to right, ${theme.value === 'dark' ? '#3f3f46' : '#d6d3d1'} 1px, transparent 1px),
          linear-gradient(to bottom, ${theme.value === 'dark' ? '#3f3f46' : '#d6d3d1'} 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }"
    />
    
    <!-- Items -->
    <div
      v-for="item in items"
      :key="item.id"
      :class="`absolute cursor-move transition-all duration-200 ${
        selectedItemId === item.id ? 'ring-2 ring-blue-500' : ''
      }`"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        zIndex: item.z_index || 0,
        transform: `scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`
      }"
      @click="setSelectedItemId(item.id)"
      @mousedown="startDrag(item.id, $event)"
    >
      <div class="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-lg">
        <img
          v-if="item.image_url"
          :src="item.image_url"
          :alt="item.name"
          class="w-full h-full object-cover"
        />
        <div
          v-else
          :class="`w-full h-full flex items-center justify-center ${
            theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-200'
          }`"
        >
          <Shirt :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
      </div>
      
      <!-- Item Controls -->
      <div
        v-if="selectedItemId === item.id"
        :class="`absolute -top-10 left-0 flex gap-1 p-1 rounded-lg ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-white'
        } shadow-lg`"
      >
        <button
          @click="removeItem(item.id)"
          :class="`p-1 rounded transition-colors ${
            theme.value === 'dark'
              ? 'hover:bg-red-600 text-zinc-300'
              : 'hover:bg-red-500 text-stone-600'
          }`"
        >
          <Trash2 class="w-3 h-3" />
        </button>
        <button
          @click="bringForward(item.id)"
          :class="`p-1 rounded transition-colors ${
            theme.value === 'dark'
              ? 'hover:bg-zinc-700 text-zinc-300'
              : 'hover:bg-stone-200 text-stone-600'
          }`"
        >
          <ArrowUp class="w-3 h-3" />
        </button>
        <button
          @click="sendBackward(item.id)"
          :class="`p-1 rounded transition-colors ${
            theme.value === 'dark'
              ? 'hover:bg-zinc-700 text-zinc-300'
              : 'hover:bg-stone-200 text-stone-600'
          }`"
        >
          <ArrowDown class="w-3 h-3" />
        </button>
      </div>
    </div>
    
    <!-- Empty State -->
    <div
      v-if="items.length === 0"
      class="absolute inset-0 flex items-center justify-center"
    >
      <div class="text-center">
        <div :class="`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          theme.value === 'dark' ? 'bg-zinc-800' : 'bg-stone-200'
        }`">
          <Palette :class="`w-8 h-8 ${theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-500'}`" />
        </div>
        <p :class="`text-lg ${
          theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
        }`">
          Drag items here to create your outfit
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { Trash2, ArrowUp, ArrowDown, Shirt, Palette } from 'lucide-vue-next'

const { theme } = useTheme()

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

const emit = defineEmits(['update:selectedItemId', 'updateItem', 'removeItem'])

const canvasRef = ref(null)
const isDragging = ref(false)
const dragStart = ref({ x: 0, y: 0, itemX: 0, itemY: 0 })

const setSelectedItemId = (id) => {
  emit('update:selectedItemId', id)
}

const startDrag = (itemId, event) => {
  const item = props.items.find(i => i.id === itemId)
  if (!item) return
  
  isDragging.value = true
  dragStart.value = {
    x: event.clientX,
    y: event.clientY,
    itemX: item.x,
    itemY: item.y
  }
  
  const handleMouseMove = (e) => handleDrag(e, itemId)
  const handleMouseUp = () => stopDrag()
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  // Store references for cleanup
  dragStart.value.handleMouseMove = handleMouseMove
  dragStart.value.handleMouseUp = handleMouseUp
}

const handleDrag = (event, itemId) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - dragStart.value.x
  const deltaY = event.clientY - dragStart.value.y
  
  const newX = Math.max(0, dragStart.value.itemX + deltaX)
  const newY = Math.max(0, dragStart.value.itemY + deltaY)
  
  emit('updateItem', itemId, { x: newX, y: newY })
}

const stopDrag = () => {
  isDragging.value = false
  
  // Clean up event listeners
  if (dragStart.value.handleMouseMove) {
    document.removeEventListener('mousemove', dragStart.value.handleMouseMove)
  }
  if (dragStart.value.handleMouseUp) {
    document.removeEventListener('mouseup', dragStart.value.handleMouseUp)
  }
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
</script>
