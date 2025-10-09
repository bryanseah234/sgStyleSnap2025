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
  <MainLayout>
    <div class="suggestions-page">
      <div class="suggestions-header">
        <h1>Outfit Suggestions</h1>
        <p class="subtitle">
          Share outfit ideas with friends
        </p>
      </div>
      
      <div class="suggestions-content">
        <SuggestionList />
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '../components/layouts/MainLayout.vue'
import SuggestionList from '../components/social/SuggestionList.vue'
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

.suggestions-content {
  background: white;
  border-radius: 0.75rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
