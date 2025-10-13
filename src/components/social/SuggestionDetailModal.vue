<!--
  SuggestionDetailModal Component - StyleSnap
  
  Purpose: Display full details of a suggestion in a modal
  
  Props:
  - suggestion: Object (full suggestion data)
  
  Emits:
  - close: emitted when modal is closed
  - delete: emitted when delete button clicked
  
  Features:
  - Shows all items in the suggestion
  - Displays message if present
  - Shows creator/recipient info
  - Delete button for sent suggestions
  
  Usage:
  <SuggestionDetailModal 
    :suggestion="suggestion"
    @close="handleClose"
    @delete="handleDelete"
  />
-->

<template>
  <div
    class="modal-overlay"
    @click.self="$emit('close')"
  >
    <div class="modal-content">
      <!-- Header -->
      <div class="modal-header">
        <h2>Outfit Suggestion</h2>
        <button
          class="close-btn"
          @click="$emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="close-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <!-- User Info -->
        <div class="user-section">
          <div class="user-avatar">
            <img
              v-if="userAvatar"
              :src="userAvatar"
              :alt="userName"
              class="avatar-image"
            >
            <span
              v-else
              class="avatar-placeholder"
            >
              {{ userInitial }}
            </span>
          </div>
          <div class="user-details">
            <div class="user-name">
              {{ userName }}
            </div>
            <div class="suggestion-date">
              {{ formattedDate }}
            </div>
          </div>
        </div>

        <!-- Message -->
        <div
          v-if="suggestion.message"
          class="message-section"
        >
          <p class="message-text">
            "{{ suggestion.message }}"
          </p>
        </div>

        <!-- Items Grid -->
        <div class="items-section">
          <h3 class="section-title">
            Suggested Items ({{ itemCount }})
          </h3>
          <div
            v-if="suggestion.items && suggestion.items.length > 0"
            class="items-grid"
          >
            <div
              v-for="item in suggestion.items"
              :key="item.id"
              class="item-card"
            >
              <div class="item-image-wrapper">
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
              </div>
              <div class="item-info">
                <div class="item-name">
                  {{ item.name || 'Untitled Item' }}
                </div>
                <div
                  v-if="item.category"
                  class="item-category"
                >
                  {{ item.category }}
                </div>
              </div>
            </div>
          </div>
          <div
            v-else
            class="no-items"
          >
            <p>No items to display</p>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button
          class="btn btn-secondary"
          @click="$emit('close')"
        >
          Close
        </button>
        <button
          v-if="showDeleteButton"
          class="btn btn-danger"
          @click="$emit('delete', suggestion.id)"
        >
          Delete Suggestion
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  suggestion: {
    type: Object,
    required: true
  }
})

defineEmits(['close', 'delete'])

// Compute user info
const userName = computed(() => {
  if (props.suggestion.from_user) {
    return props.suggestion.from_user.name || props.suggestion.from_user.email
  }
  if (props.suggestion.to_user) {
    return props.suggestion.to_user.name || props.suggestion.to_user.email
  }
  return 'Unknown User'
})

const userAvatar = computed(() => {
  return props.suggestion.from_user?.avatar_url || props.suggestion.to_user?.avatar_url
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// Format date
const formattedDate = computed(() => {
  if (!props.suggestion.created_at) return ''
  const date = new Date(props.suggestion.created_at)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

// Item count
const itemCount = computed(() => {
  return props.suggestion.items?.length || props.suggestion.suggested_item_ids?.length || 0
})

// Show delete button only for sent suggestions
const showDeleteButton = computed(() => {
  // This would need to check if current user is the creator
  // For now, we'll show it if to_user exists (meaning from_user is current user)
  return !!props.suggestion.to_user
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.close-btn {
  padding: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #111827;
}

.close-icon {
  width: 1.5rem;
  height: 1.5rem;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e7eb;
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 1.5rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.suggestion-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.message-section {
  padding: 1rem;
  background: #f9fafb;
  border-radius: 0.5rem;
  border-left: 4px solid #3b82f6;
}

.message-text {
  font-size: 1rem;
  color: #374151;
  font-style: italic;
  margin: 0;
}

.items-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.item-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item-image-wrapper {
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
  background: #f3f4f6;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
}

.placeholder-icon {
  font-size: 2rem;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
}

.no-items {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 640px) {
  .items-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-content {
    max-height: 95vh;
  }
}
</style>
