<template>
  <div class="outfit-canvas-container">
    <!-- Canvas Area -->
    <div
      ref="canvasRef"
      class="outfit-canvas"
      :style="canvasStyle"
      @drop="handleDrop"
      @dragover.prevent
      @dragenter.prevent
    >
      <!-- Canvas Background -->
      <div class="canvas-background">
        <div class="canvas-grid" />
        <div
          v-if="items.length === 0"
          class="empty-state"
        >
          <svg
            class="empty-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="empty-text">
            Drag items here to create your outfit
          </p>
          <p class="empty-hint">
            You can position and layer items freely
          </p>
        </div>
      </div>

      <!-- Placed Items -->
      <div
        v-for="item in sortedItems"
        :key="item.id"
        class="canvas-item"
        :class="{ selected: selectedItemId === item.id }"
        :style="getItemStyle(item)"
        @mousedown="startDrag(item, $event)"
        @click="selectItem(item.id)"
      >
        <img
          :src="item.thumbnail_url || item.image_url"
          :alt="item.name"
          draggable="false"
        >
        
        <!-- Item Controls -->
        <div
          v-if="selectedItemId === item.id"
          class="item-controls"
        >
          <button
            class="control-btn"
            title="Bring Forward"
            @click.stop="changeZIndex(item.id, 1)"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            class="control-btn"
            title="Send Backward"
            @click.stop="changeZIndex(item.id, -1)"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            class="control-btn remove"
            title="Remove"
            @click.stop="removeItem(item.id)"
          >
            <svg
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

        <!-- Item Label -->
        <div class="item-label">
          <span>{{ item.name }}</span>
          <span class="item-category">{{ item.category }}</span>
        </div>
      </div>
    </div>

    <!-- Canvas Toolbar -->
    <div class="canvas-toolbar">
      <div class="toolbar-left">
        <span class="item-count">{{ items.length }} / 10 items</span>
      </div>
      <div class="toolbar-right">
        <button
          class="toolbar-btn"
          :disabled="items.length === 0"
          @click="clearCanvas"
        >
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear All
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  canvasWidth: {
    type: Number,
    default: 800
  },
  canvasHeight: {
    type: Number,
    default: 600
  }
})

const emit = defineEmits([
  'item-added',
  'item-removed',
  'item-moved',
  'item-z-index-changed',
  'clear-all'
])

const canvasRef = ref(null)
const selectedItemId = ref(null)
const draggingItem = ref(null)
const dragOffset = ref({ x: 0, y: 0 })

// Canvas style
const canvasStyle = computed(() => ({
  width: `${props.canvasWidth}px`,
  height: `${props.canvasHeight}px`
}))

// Sort items by z-index
const sortedItems = computed(() => {
  return [...props.items].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
})

/**
 * Handle drop event from sidebar
 */
function handleDrop(event) {
  event.preventDefault()
  
  // Check if we already have 10 items
  if (props.items.length >= 10) {
    alert('Maximum 10 items allowed per outfit')
    return
  }

  const itemData = event.dataTransfer.getData('application/json')
  if (!itemData) return

  try {
    const item = JSON.parse(itemData)
    
    // Check if item already exists
    if (props.items.some(i => i.id === item.id)) {
      alert('This item is already in the outfit')
      return
    }

    // Calculate position relative to canvas
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left - 75 // Center item (150px width / 2)
    const y = event.clientY - rect.top - 75 // Center item (150px height / 2)

    // Add item with position and z-index
    const newItem = {
      ...item,
      position: {
        x: Math.max(0, Math.min(x, props.canvasWidth - 150)),
        y: Math.max(0, Math.min(y, props.canvasHeight - 150))
      },
      zIndex: props.items.length
    }

    emit('item-added', newItem)
  } catch (error) {
    console.error('Error dropping item:', error)
  }
}

/**
 * Start dragging an item on the canvas
 */
function startDrag(item, event) {
  event.preventDefault()
  draggingItem.value = item
  
  const rect = canvasRef.value.getBoundingClientRect()
  dragOffset.value = {
    x: event.clientX - rect.left - item.position.x,
    y: event.clientY - rect.top - item.position.y
  }

  // Add mouse move and up listeners
  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

/**
 * Handle mouse move during drag
 */
function onMouseMove(event) {
  if (!draggingItem.value) return

  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left - dragOffset.value.x
  const y = event.clientY - rect.top - dragOffset.value.y

  // Constrain to canvas bounds
  const newX = Math.max(0, Math.min(x, props.canvasWidth - 150))
  const newY = Math.max(0, Math.min(y, props.canvasHeight - 150))

  emit('item-moved', {
    id: draggingItem.value.id,
    position: { x: newX, y: newY }
  })
}

/**
 * Handle mouse up to end drag
 */
function onMouseUp() {
  draggingItem.value = null
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
}

/**
 * Select an item
 */
function selectItem(itemId) {
  selectedItemId.value = itemId
}

/**
 * Get style for positioned item
 */
function getItemStyle(item) {
  return {
    left: `${item.position.x}px`,
    top: `${item.position.y}px`,
    zIndex: item.zIndex || 0
  }
}

/**
 * Change z-index of an item
 */
function changeZIndex(itemId, delta) {
  emit('item-z-index-changed', { id: itemId, delta })
}

/**
 * Remove item from canvas
 */
function removeItem(itemId) {
  emit('item-removed', itemId)
}

/**
 * Clear all items from canvas
 */
function clearCanvas() {
  if (confirm('Remove all items from the canvas?')) {
    emit('clear-all')
    selectedItemId.value = null
  }
}
</script>

<style scoped>
.outfit-canvas-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.outfit-canvas {
  position: relative;
  border: 2px dashed #e5e7eb;
  border-radius: 0.5rem;
  background: #f9fafb;
  overflow: hidden;
  user-select: none;
}

.canvas-background {
  width: 100%;
  height: 100%;
  position: relative;
}

.canvas-grid {
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

.empty-state {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 1.125rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.875rem;
  color: #d1d5db;
}

.canvas-item {
  position: absolute;
  width: 150px;
  height: 150px;
  cursor: move;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.canvas-item:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.canvas-item.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.canvas-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.375rem;
  pointer-events: none;
}

.item-controls {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.25rem;
  background: white;
  padding: 0.25rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.control-btn {
  width: 32px;
  height: 32px;
  padding: 0.25rem;
  border: none;
  background: #f3f4f6;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background: #e5e7eb;
}

.control-btn.remove {
  background: #fee2e2;
  color: #dc2626;
}

.control-btn.remove:hover {
  background: #fecaca;
}

.control-btn svg {
  width: 100%;
  height: 100%;
}

.item-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: 0.75rem;
  border-radius: 0 0 0.375rem 0.375rem;
}

.item-category {
  display: block;
  font-size: 0.625rem;
  opacity: 0.8;
  text-transform: capitalize;
}

.canvas-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.item-count {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
}
</style>
