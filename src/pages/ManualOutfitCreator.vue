<template>
  <div class="manual-outfit-creator">
    <!-- Header -->
    <div class="creator-header">
      <div class="header-content">
        <button
          class="back-btn"
          @click="handleBack"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>
        <div class="header-title">
          <h1>Create Your Outfit</h1>
          <p>Drag items from your closet and position them on the canvas</p>
        </div>
        <div class="header-actions">
          <button
            v-if="hasUnsavedChanges"
            class="btn-secondary"
            @click="handleSaveDraft"
          >
            Save Draft
          </button>
          <button
            class="btn-primary"
            :disabled="canvasItems.length === 0"
            @click="showSaveDialog = true"
          >
            Save Outfit
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="creator-content">
      <!-- Sidebar -->
      <div class="sidebar-container">
        <ClosetItemsSidebar :exclude-item-ids="canvasItems.map(i => i.id)" />
      </div>

      <!-- Canvas -->
      <div class="canvas-container">
        <OutfitCanvas
          :items="canvasItems"
          :canvas-width="800"
          :canvas-height="600"
          @item-added="handleItemAdded"
          @item-removed="handleItemRemoved"
          @item-moved="handleItemMoved"
          @item-z-index-changed="handleZIndexChanged"
          @clear-all="handleClearAll"
        />
      </div>
    </div>

    <!-- Save Dialog -->
    <Modal
      v-if="showSaveDialog"
      @close="showSaveDialog = false"
    >
      <div class="save-dialog">
        <h2 class="dialog-title">
          Save Your Outfit
        </h2>

        <form @submit.prevent="handleSaveOutfit">
          <!-- Outfit Name -->
          <div class="form-group">
            <label for="outfit-name">Outfit Name *</label>
            <input
              id="outfit-name"
              v-model="outfitForm.name"
              type="text"
              placeholder="e.g., Summer Casual Look"
              required
              maxlength="100"
            >
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label for="outfit-notes">Notes (Optional)</label>
            <textarea
              id="outfit-notes"
              v-model="outfitForm.notes"
              placeholder="Add any notes about this outfit..."
              rows="3"
              maxlength="500"
            />
          </div>

          <!-- Tags -->
          <div class="form-group">
            <label for="outfit-tags">Tags (Optional)</label>
            <input
              id="outfit-tags"
              v-model="outfitForm.tags"
              type="text"
              placeholder="e.g., casual, summer, date night (comma separated)"
            >
            <span class="form-hint">Separate tags with commas</span>
          </div>

          <!-- Occasion -->
          <div class="form-group">
            <label for="outfit-occasion">Occasion</label>
            <select
              id="outfit-occasion"
              v-model="outfitForm.occasion"
            >
              <option value="">Select occasion...</option>
              <option value="casual">Casual</option>
              <option value="work">Work</option>
              <option value="formal">Formal</option>
              <option value="party">Party</option>
              <option value="date">Date</option>
              <option value="workout">Workout</option>
              <option value="travel">Travel</option>
            </select>
          </div>

          <!-- Weather -->
          <div class="form-group">
            <label for="outfit-weather">Weather</label>
            <select
              id="outfit-weather"
              v-model="outfitForm.weather"
            >
              <option value="">Select weather...</option>
              <option value="hot">Hot (>25°C)</option>
              <option value="warm">Warm (15-25°C)</option>
              <option value="cool">Cool (5-15°C)</option>
              <option value="cold">Cold (<5°C)</option>
            </select>
          </div>

          <!-- Actions -->
          <div class="dialog-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="showSaveDialog = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="saving"
            >
              <span v-if="saving">Saving...</span>
              <span v-else>Save Outfit</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import OutfitCanvas from '@/components/outfits/OutfitCanvas.vue'
import ClosetItemsSidebar from '@/components/outfits/ClosetItemsSidebar.vue'
import Modal from '@/components/ui/Modal.vue'
import manualOutfitService from '@/services/manual-outfit-service'

const router = useRouter()

// Canvas items state
const canvasItems = ref([])
const showSaveDialog = ref(false)
const saving = ref(false)

// Outfit form
const outfitForm = ref({
  name: '',
  notes: '',
  tags: '',
  occasion: '',
  weather: ''
})

// Track changes
const hasUnsavedChanges = computed(() => canvasItems.value.length > 0)

/**
 * Handle item added to canvas
 */
function handleItemAdded(item) {
  canvasItems.value.push(item)
}

/**
 * Handle item removed from canvas
 */
function handleItemRemoved(itemId) {
  const index = canvasItems.value.findIndex(item => item.id === itemId)
  if (index !== -1) {
    canvasItems.value.splice(index, 1)
  }
}

/**
 * Handle item moved on canvas
 */
function handleItemMoved({ id, position }) {
  const item = canvasItems.value.find(item => item.id === id)
  if (item) {
    item.position = position
  }
}

/**
 * Handle z-index change
 */
function handleZIndexChanged({ id, delta }) {
  const item = canvasItems.value.find(item => item.id === id)
  if (!item) return

  const currentIndex = item.zIndex || 0
  const newIndex = currentIndex + delta

  // Ensure new index is within bounds
  const minIndex = 0
  const maxIndex = canvasItems.value.length - 1

  if (newIndex < minIndex || newIndex > maxIndex) return

  // Find item at target index
  const targetItem = canvasItems.value.find(i => i.zIndex === newIndex)
  if (targetItem) {
    targetItem.zIndex = currentIndex
  }

  item.zIndex = newIndex
}

/**
 * Clear all items
 */
function handleClearAll() {
  canvasItems.value = []
}

/**
 * Save outfit
 */
async function handleSaveOutfit() {
  if (canvasItems.value.length === 0) {
    alert('Please add at least one item to your outfit')
    return
  }

  saving.value = true

  try {
    // Prepare outfit data
    const outfitData = {
      name: outfitForm.value.name,
      notes: outfitForm.value.notes,
      tags: outfitForm.value.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0),
      occasion: outfitForm.value.occasion || null,
      weather: outfitForm.value.weather || null,
      items: canvasItems.value.map(item => ({
        id: item.id,
        position: item.position,
        zIndex: item.zIndex
      })),
      canvas_dimensions: {
        width: 800,
        height: 600
      }
    }

    // Save outfit via API
    await manualOutfitService.createOutfit(outfitData)

    // Clear draft
    manualOutfitService.clearDraft()

    // Show success message
    alert('Outfit saved successfully!')

    // Reset form and canvas
    canvasItems.value = []
    outfitForm.value = {
      name: '',
      notes: '',
      tags: '',
      occasion: '',
      weather: ''
    }
    showSaveDialog.value = false

    // Navigate back
    router.push('/closet')
  } catch (error) {
    console.error('Error saving outfit:', error)
    alert('Failed to save outfit. Please try again.')
  } finally {
    saving.value = false
  }
}

/**
 * Save draft
 */
function handleSaveDraft() {
  const draft = {
    items: canvasItems.value,
    form: outfitForm.value
  }

  if (manualOutfitService.saveDraft(draft)) {
    alert('Draft saved!')
  } else {
    alert('Failed to save draft')
  }
}

/**
 * Load draft if exists
 */
function loadDraft() {
  const draft = manualOutfitService.loadDraft()
  if (!draft) return

  try {
    // Ask user if they want to restore
    if (confirm('You have an unsaved outfit draft. Would you like to restore it?')) {
      canvasItems.value = draft.items || []
      outfitForm.value = draft.form || outfitForm.value
      manualOutfitService.clearDraft()
    }
  } catch (error) {
    console.error('Error loading draft:', error)
  }
}

/**
 * Handle back navigation
 */
function handleBack() {
  if (hasUnsavedChanges.value) {
    if (confirm('You have unsaved changes. Do you want to leave?')) {
      router.push('/closet')
    }
  } else {
    router.push('/closet')
  }
}

/**
 * Warn before leaving with unsaved changes
 */
function handleBeforeUnload(event) {
  if (hasUnsavedChanges.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

// Load draft on mount
loadDraft()

// Add beforeunload listener
window.addEventListener('beforeunload', handleBeforeUnload)

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.manual-outfit-creator {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

.creator-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 1.5rem 2rem;
}

.header-content {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-btn {
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

.back-btn:hover {
  background: #f9fafb;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.header-title {
  flex: 1;
}

.header-title h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.header-title p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-secondary,
.btn-primary {
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  border: 1px solid #e5e7eb;
  background: white;
  color: #374151;
}

.btn-secondary:hover {
  background: #f9fafb;
}

.btn-primary {
  border: none;
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.creator-content {
  flex: 1;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
}

.sidebar-container {
  height: calc(100vh - 180px);
  position: sticky;
  top: 2rem;
}

.canvas-container {
  min-height: 600px;
}

.save-dialog {
  padding: 1.5rem;
  max-width: 500px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #3b82f6;
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 1024px) {
  .creator-content {
    grid-template-columns: 1fr;
  }

  .sidebar-container {
    height: 400px;
    position: static;
  }
}
</style>
