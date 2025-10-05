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
  <!-- TODO: Implement suggestion card -->
  <!-- TODO: Show preview image or icon -->
  <!-- TODO: Display creator/recipient name -->
  <!-- TODO: Show relative timestamp -->
  <!-- TODO: Add status badge -->
  <!-- TODO: Add delete button if mode='sent' -->
</template>

<script setup>
// TODO: Define props and emits
// TODO: Format timestamp to relative time
// TODO: Handle card click
// TODO: Handle delete action (if applicable)
</script>

<style scoped>
/* TODO: Add card styles */
</style>
