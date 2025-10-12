<!--
  SuggestionList Component - StyleSnap
  
  Purpose: Displays list of outfit suggestions (received and sent)
  
  Features:
  - Tab/section for "Received" suggestions (from friends to you)
  - Tab/section for "Sent" suggestions (from you to friends)
  - Each suggestion shows preview, creator/recipient, timestamp
  - Click to view full suggestion details
  - Status indicators (new, viewed, liked)
  - Delete sent suggestions
  
  Suggestion Status:
  - new: just created, not viewed by recipient
  - viewed: recipient has opened the suggestion
  - liked: recipient liked the suggestion (optional feature)
  
  Data Source:
  - outfit_suggestions table
  - Received: where target_user_id = current_user_id
  - Sent: where creator_id = current_user_id
  
  Usage:
  <SuggestionList /> (used in Suggestions.vue page)
  
  Reference:
  - requirements/database-schema.md for outfit_suggestions table
  - requirements/api-endpoints.md for GET /api/suggestions endpoint
  - tasks/05-suggestion-system.md for suggestion features
-->

<template>
  <div class="suggestion-list">
    <!-- Tab Navigation -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'received' }"
        @click="activeTab = 'received'"
      >
        Received
        <span
          v-if="suggestionsStore.newSuggestionsCount > 0"
          class="tab-badge"
        >
          {{ suggestionsStore.newSuggestionsCount }}
        </span>
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'sent' }"
        @click="activeTab = 'sent'"
      >
        Sent
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="suggestionsStore.isLoading"
      class="loading-state"
    >
      <div class="loading-spinner" />
      <p>Loading suggestions...</p>
    </div>

    <!-- Received Suggestions -->
    <div
      v-else-if="activeTab === 'received'"
      class="suggestions-content"
    >
      <div
        v-if="suggestionsStore.receivedSuggestions.length === 0"
        class="empty-state"
      >
        <span class="empty-icon">✨</span>
        <h3>No suggestions yet</h3>
        <p>When friends send you outfit suggestions, they'll appear here</p>
      </div>
      <div
        v-else
        class="suggestions-grid"
      >
        <SuggestionItem
          v-for="suggestion in suggestionsStore.receivedSuggestions"
          :key="suggestion.id"
          :suggestion="suggestion"
          mode="received"
          @click="handleSuggestionClick"
        />
      </div>
    </div>

    <!-- Sent Suggestions -->
    <div
      v-else
      class="suggestions-content"
    >
      <div
        v-if="suggestionsStore.sentSuggestions.length === 0"
        class="empty-state"
      >
        <span class="empty-icon">💡</span>
        <h3>No sent suggestions</h3>
        <p>Create outfit suggestions for your friends to inspire them!</p>
      </div>
      <div
        v-else
        class="suggestions-grid"
      >
        <SuggestionItem
          v-for="suggestion in suggestionsStore.sentSuggestions"
          :key="suggestion.id"
          :suggestion="suggestion"
          mode="sent"
          @click="handleSuggestionClick"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Suggestion Detail Modal -->
    <SuggestionDetailModal
      v-if="showDetailModal"
      :suggestion="selectedSuggestion"
      @close="closeDetailModal"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSuggestionsStore } from '../../stores/suggestions-store'
import SuggestionItem from './SuggestionItem.vue'
import SuggestionDetailModal from './SuggestionDetailModal.vue'

const suggestionsStore = useSuggestionsStore()
const activeTab = ref('received')
const showDetailModal = ref(false)
const selectedSuggestion = ref(null)

onMounted(async () => {
  await loadSuggestions()
})

async function loadSuggestions() {
  try {
    await Promise.all([
      suggestionsStore.fetchReceivedSuggestions(),
      suggestionsStore.fetchSentSuggestions(),
      suggestionsStore.fetchUnreadCount()
    ])
  } catch (error) {
    console.error('Failed to load suggestions:', error)
  }
}

async function handleSuggestionClick(suggestion) {
  selectedSuggestion.value = suggestion
  showDetailModal.value = true
  
  // Mark as read if it's a received suggestion and not already read
  if (activeTab.value === 'received' && !suggestion.is_read) {
    try {
      await suggestionsStore.markAsRead(suggestion.id)
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }
}

function closeDetailModal() {
  showDetailModal.value = false
  selectedSuggestion.value = null
}

async function handleDelete(suggestionId) {
  if (!confirm('Are you sure you want to delete this suggestion?')) {
    return
  }
  
  try {
    await suggestionsStore.deleteSuggestion(suggestionId)
    
    // Close modal if it's open
    if (showDetailModal.value && selectedSuggestion.value?.id === suggestionId) {
      closeDetailModal()
    }
    
    // Reload suggestions
    await loadSuggestions()
  } catch (error) {
    console.error('Failed to delete suggestion:', error)
    alert('Failed to delete suggestion. Please try again.')
  }
}
</script>

<style scoped>
.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 60vh;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.tab {
  flex: 1;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 0.5rem 0.5rem 0 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab:hover {
  background: #f3f4f6;
  color: #374151;
}

.tab.active {
  color: #3b82f6;
  background: #eff6ff;
  font-weight: 600;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.suggestions-content {
  flex: 1;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  font-size: 0.9375rem;
  max-width: 300px;
}

.suggestions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem 0;
}

@media (max-width: 640px) {
  .suggestions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
