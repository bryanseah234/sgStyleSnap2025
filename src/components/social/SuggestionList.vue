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
  <!-- TODO: Implement tabs for received vs sent suggestions -->
  <!-- TODO: Display suggestion cards with preview images -->
  <!-- TODO: Show creator name, timestamp, and status -->
  <!-- TODO: Add click handler to view full suggestion -->
  <!-- TODO: Add delete button for sent suggestions -->
  <!-- TODO: Show empty state if no suggestions -->
</template>

<script setup>
// TODO: Import suggestions store
// TODO: Fetch received and sent suggestions
// TODO: Handle tab switching
// TODO: Handle suggestion click (view details)
// TODO: Handle delete suggestion
</script>

<style scoped>
/* TODO: Add list and card styles */
</style>
