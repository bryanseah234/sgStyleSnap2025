<!--
  SuggestionItem Component - StyleSnap
  
  Purpose: Displays a single outfit suggestion card (used within SuggestionList)
  
  Props:
  - suggestion: Object (suggestion data from database)
    - id: UUID
    - creator_id: UUID (who created the suggestion)
    - target_user_id: UUID (who it's for)
    - created_at: timestamp
    - status: 'new' | 'viewed' | 'liked'
    - items_data: JSON (item positions and arrangement)
  - mode: 'received' | 'sent' (changes display and actions)
  
  Features:
  - Preview thumbnail of outfit arrangement
  - Creator/recipient name
  - Timestamp (relative: "2 hours ago")
  - Status badge (for sent suggestions)
  - "New" indicator (for received suggestions)
  - Click to view full details
  
  Emits:
  - click: emitted when card is clicked
  - delete: emitted when delete button clicked (sent mode only)
  
  Usage:
  <SuggestionItem 
    :suggestion="suggestionData" 
    mode="received" 
    @click="viewDetails" 
  />
  
  Reference:
  - requirements/database-schema.md for outfit_suggestions schema
-->

<template>
  <div class="suggestion-card" @click="handleClick">
    <!-- New indicator for unread received suggestions -->
    <div v-if="mode === 'received' && !suggestion.is_read" class="new-badge">
      New
    </div>
    
    <!-- Preview Area -->
    <div class="preview-area">
      <div v-if="suggestion.items && suggestion.items.length > 0" class="items-preview">
        <div 
          v-for="(item, index) in previewItems" 
          :key="item.id"
          class="preview-item"
          :style="{ zIndex: index }"
        >
          <img 
            v-if="item.image_url" 
            :src="item.image_url" 
            :alt="item.name"
            class="item-image"
          />
          <div v-else class="item-placeholder">
            <span class="placeholder-icon">👕</span>
          </div>
        </div>
      </div>
      <div v-else class="no-items">
        <span class="no-items-icon">✨</span>
        <span class="no-items-text">No items</span>
      </div>
    </div>
    
    <!-- Suggestion Info -->
    <div class="suggestion-info">
      <div class="user-info">
        <div class="user-avatar">
          <img 
            v-if="userAvatar" 
            :src="userAvatar" 
            :alt="userName"
            class="avatar-image"
          />
          <span v-else class="avatar-placeholder">{{ userInitial }}</span>
        </div>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="timestamp">{{ relativeTime }}</div>
        </div>
      </div>
      
      <!-- Message preview if exists -->
      <div v-if="suggestion.message" class="message-preview">
        "{{ suggestion.message }}"
      </div>
      
      <!-- Status badge for sent suggestions -->
      <div v-if="mode === 'sent'" class="status-badge" :class="statusClass">
        {{ statusText }}
      </div>
      
      <!-- Item count -->
      <div class="item-count">
        {{ itemCountText }}
      </div>
    </div>
    
    <!-- Delete button for sent suggestions -->
    <button 
      v-if="mode === 'sent'" 
      class="delete-btn"
      @click.stop="handleDelete"
      title="Delete suggestion"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="delete-icon">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  suggestion: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    required: true,
    validator: (value) => ['received', 'sent'].includes(value)
  }
})

const emit = defineEmits(['click', 'delete'])

// Compute user info based on mode
const userName = computed(() => {
  if (props.mode === 'received' && props.suggestion.from_user) {
    return props.suggestion.from_user.name || props.suggestion.from_user.email
  }
  if (props.mode === 'sent' && props.suggestion.to_user) {
    return props.suggestion.to_user.name || props.suggestion.to_user.email
  }
  return 'Unknown User'
})

const userAvatar = computed(() => {
  if (props.mode === 'received' && props.suggestion.from_user) {
    return props.suggestion.from_user.avatar_url
  }
  if (props.mode === 'sent' && props.suggestion.to_user) {
    return props.suggestion.to_user.avatar_url
  }
  return null
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

// Format timestamp to relative time
const relativeTime = computed(() => {
  if (!props.suggestion.created_at) return ''
  
  const now = new Date()
  const created = new Date(props.suggestion.created_at)
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return created.toLocaleDateString()
})

// Preview items (show max 3)
const previewItems = computed(() => {
  return (props.suggestion.items || []).slice(0, 3)
})

// Item count text
const itemCountText = computed(() => {
  const count = props.suggestion.items?.length || props.suggestion.suggested_item_ids?.length || 0
  return `${count} ${count === 1 ? 'item' : 'items'}`
})

// Status text and class for sent suggestions
const statusText = computed(() => {
  if (props.suggestion.is_read) return 'Read'
  return 'Unread'
})

const statusClass = computed(() => {
  return props.suggestion.is_read ? 'status-read' : 'status-unread'
})

// Event handlers
function handleClick() {
  emit('click', props.suggestion)
}

function handleDelete() {
  emit('delete', props.suggestion.id)
}
</script>

<style scoped>
.suggestion-card {
  position: relative;
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.new-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: #ef4444;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 10;
}

.preview-area {
  width: 100%;
  height: 150px;
  background: #f3f4f6;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.items-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 100%;
  height: 100%;
}

.preview-item {
  flex: 1;
  height: 100%;
  max-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0.25rem;
}

.item-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 0.25rem;
}

.placeholder-icon {
  font-size: 2rem;
}

.no-items {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
}

.no-items-icon {
  font-size: 2rem;
}

.no-items-text {
  font-size: 0.875rem;
}

.suggestion-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
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
  font-size: 1.125rem;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #111827;
  font-size: 0.9375rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timestamp {
  font-size: 0.75rem;
  color: #6b7280;
}

.message-preview {
  font-size: 0.875rem;
  color: #4b5563;
  font-style: italic;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0.25rem 0;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.status-read {
  background: #d1fae5;
  color: #065f46;
}

.status-unread {
  background: #fef3c7;
  color: #92400e;
}

.item-count {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.delete-btn {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  padding: 0.5rem;
  background: #fee2e2;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #fecaca;
}

.delete-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #dc2626;
}
</style>
