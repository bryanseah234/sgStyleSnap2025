<!--
  Suggestions Page - StyleSnap
  
  Purpose: Page for viewing received and sent outfit suggestions
  
  Features:
  - Displays SuggestionList component
  - Shows received suggestions (from friends)
  - Shows sent suggestions (to friends)
  - Mark suggestions as viewed
  - Delete sent suggestions
  - Like/react to received suggestions (optional feature)
  
  Route: /suggestions
  Auth: Protected (requires authentication)
  
  Navigation:
  - Access via bottom nav bar in MainLayout
  - Can click suggestion to view full details
  
  Reference:
  - docs/design/mobile-mockups/06-outfit-suggestion.png for suggestion view
  - docs/design/mobile-mockups/08-social-feed.png for feed view
  - components/social/SuggestionList.vue for main content
  - tasks/05-suggestion-system.md for suggestion features
-->

<template>
  <div class="suggestions-page">
    <div class="suggestions-header">
      <h1>Outfit Suggestions</h1>
      <p class="subtitle">Get inspired by AI-powered outfit recommendations</p>
    </div>
    
    <div class="suggestions-content">
      <p class="placeholder-text">Suggestions feature coming soon!</p>
      <p class="detail-text">You'll receive:</p>
      <ul class="feature-list">
        <li>Weather-based outfit suggestions</li>
        <li>AI-powered recommendations</li>
        <li>Outfit ideas from friends</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSuggestionsStore } from '../stores/suggestions-store'

const suggestionsStore = useSuggestionsStore()

onMounted(() => {
  suggestionsStore.fetchReceivedSuggestions()
})
</script>

<style scoped>
.suggestions-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

.suggestions-header {
  margin-bottom: 1.5rem;
}

.suggestions-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.subtitle {
  font-size: 0.875rem;
  color: #6b7280;
}

.placeholder-text {
  text-align: center;
  padding: 2rem 1rem 1rem;
  color: #374151;
  font-size: 1.125rem;
  font-weight: 500;
}

.detail-text {
  text-align: center;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.feature-list {
  list-style: none;
  padding: 0;
  max-width: 300px;
  margin: 1rem auto;
}

.feature-list li {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  color: #374151;
}
</style>
