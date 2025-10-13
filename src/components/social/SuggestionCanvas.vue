<!--
  SuggestionCanvas Component - StyleSnap
  
  Purpose: Interactive canvas for creating outfit suggestions by dragging friend's clothing items
  
  Features:
  - Drag-and-drop interface for placing clothing items
  - Displays friend's public closet items as draggable elements
  - Canvas area where items can be positioned
  - Ability to layer items (z-index control)
  - Save suggestion button
  - Optional message input (100 char limit)
  
  Technical Details:
  - Uses HTML5 drag-and-drop API
  - Canvas is HTML/CSS based with positioned divs
  - Saves item IDs and arrangement as JSON
  - Stores suggestion in suggestions table
  
  Props:
  - friendId: string (friend for whom suggestion is being created)
  - friendItems: Array (friend's public clothing items)
  
  Emits:
  - save: emitted when suggestion is saved
  - cancel: emitted when user cancels
  
  Usage:
  <SuggestionCanvas 
    :friendId="friendId" 
    :friendItems="friendItems" 
    @save="handleSave" 
    @cancel="handleCancel" 
  />
  
  Reference:
  - docs/design/mobile-mockups/06-outfit-suggestion.png for canvas design
  - requirements/database-schema.md for suggestions table
  - tasks/05-suggestion-system.md for suggestion creation logic
-->

<template>
  <div class="suggestion-canvas">
    <!-- Header -->
    <div class="canvas-header">
      <h2>Create Outfit Suggestion</h2>
      <button
        class="close-btn"
        @click="$emit('cancel')"
      >
        ✕
      </button>
    </div>

    <!-- Main Content -->
    <div class="canvas-content">
      <!-- Friend's Items Panel (Left) -->
      <div class="items-panel">
        <h3 class="panel-title">
          Friend's Items
        </h3>
        <div class="items-list">
          <div
            v-for="item in friendItems"
            :key="item.id"
            class="item-thumbnail"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @dragend="handleDragEnd"
          >
            <img
              v-if="item.image_url"
              :src="item.image_url"
              :alt="item.name"
              class="item-image"
            >
            <div
              v-else
              class="item-placeholder"
            >
              <span class="placeholder-icon">👕</span>
            </div>
            <div class="item-name">
              {{ item.name || 'Untitled' }}
            </div>
          </div>
          <div
            v-if="friendItems.length === 0"
            class="no-items"
          >
            <p>No items available</p>
          </div>
        </div>
      </div>

      <!-- Canvas Area (Right) -->
      <div
        class="canvas-area"
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
      >
        <div
          v-if="selectedItems.length === 0"
          class="canvas-placeholder"
        >
          <span class="placeholder-icon">✨</span>
          <p>Drag items here to create a suggestion</p>
        </div>
        <div
          v-for="(selectedItem, index) in selectedItems"
          :key="selectedItem.uniqueId"
          class="canvas-item"
          :style="{ zIndex: index }"
        >
          <img
            v-if="selectedItem.item.image_url"
            :src="selectedItem.item.image_url"
            :alt="selectedItem.item.name"
            class="canvas-item-image"
          >
          <div
            v-else
            class="canvas-item-placeholder"
          >
            <span>👕</span>
          </div>
          <button
            class="remove-item-btn"
            @click="removeItem(index)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Message Input -->
    <div class="message-section">
      <label
        for="suggestion-message"
        class="message-label"
      >
        Optional Message ({{ messageCharCount }}/100)
      </label>
      <textarea
        id="suggestion-message"
        v-model="message"
        class="message-input"
        placeholder="Add a note to your suggestion..."
        maxlength="100"
        rows="2"
      />
    </div>

    <!-- Actions -->
    <div class="canvas-actions">
      <button
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        class="btn btn-primary"
        :disabled="selectedItems.length === 0 || isSaving"
        @click="handleSave"
      >
        {{ isSaving ? 'Saving...' : 'Send Suggestion' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  friendId: {
    type: String,
    required: true
  },
  friendItems: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

// State
const selectedItems = ref([])
const message = ref('')
const isSaving = ref(false)
const draggedItem = ref(null)
let uniqueIdCounter = 0

// Computed
const messageCharCount = computed(() => message.value.length)

// Drag and Drop Handlers
function handleDragStart(event, item) {
  draggedItem.value = item
  event.dataTransfer.effectAllowed = 'copy'
  event.target.classList.add('dragging')
}

function handleDragEnd(event) {
  event.target.classList.remove('dragging')
  draggedItem.value = null
}

function handleDrop(event) {
  event.preventDefault()

  if (draggedItem.value) {
    // Add item to canvas
    selectedItems.value.push({
      uniqueId: `item-${uniqueIdCounter++}`,
      item: draggedItem.value
    })

    draggedItem.value = null
  }
}

// Item Management
function removeItem(index) {
  selectedItems.value.splice(index, 1)
}

// Save Handler
async function handleSave() {
  if (selectedItems.value.length === 0) {
    return
  }

  isSaving.value = true

  try {
    // Extract item IDs
    const itemIds = selectedItems.value.map(si => si.item.id)

    // Emit save event with data
    emit('save', {
      toUserId: props.friendId,
      itemIds: itemIds,
      message: message.value.trim() || null
    })
  } catch (error) {
    console.error('Failed to save suggestion:', error)
    alert('Failed to create suggestion. Please try again.')
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.suggestion-canvas {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.canvas-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #111827;
}

.canvas-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.items-panel {
  width: 280px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  background: #f9fafb;
}

.panel-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid #e5e7eb;
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-thumbnail {
  background: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  cursor: move;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.item-thumbnail:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-thumbnail.dragging {
  opacity: 0.5;
}

.item-image,
.item-placeholder {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 0.375rem;
  object-fit: cover;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.placeholder-icon {
  font-size: 2rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.no-items {
  text-align: center;
  padding: 2rem 1rem;
  color: #9ca3af;
}

.canvas-area {
  flex: 1;
  position: relative;
  background:
    linear-gradient(to right, #e5e7eb 1px, transparent 1px),
    linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
  overflow: auto;
  min-height: 400px;
}

.canvas-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: #9ca3af;
}

.canvas-placeholder .placeholder-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.canvas-item {
  position: relative;
  width: 150px;
  margin: 1rem;
  display: inline-block;
  background: white;
  border-radius: 0.5rem;
  padding: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.canvas-item-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 0.375rem;
}

.canvas-item-placeholder {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.375rem;
  font-size: 2rem;
}

.remove-item-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 24px;
  height: 24px;
  padding: 0;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.remove-item-btn:hover {
  background: #dc2626;
}

.message-section {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.message-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.message-input {
  width: 100%;
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
}

.message-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.canvas-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .canvas-content {
    flex-direction: column;
  }

  .items-panel {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .items-list {
    flex-direction: row;
    overflow-x: auto;
  }

  .item-thumbnail {
    min-width: 120px;
  }
}
</style>
