<!--
  FriendsList Component - StyleSnap
  
  Purpose: Displays list of user's friends with ability to view profiles and send outfit suggestions
  
  Features:
  - List of accepted friends with avatars and names
  - Click friend to view their profile
  - Button to suggest outfit to friend
  - Search/filter friends
  - Shows friend count
  - Empty state when no friends
  
  Data Source:
  - Fetches from friends-store.js (Pinia store)
  - friendships table in Supabase (status = 'accepted')
  - Only shows mutual friendships
  
  Friendship States:
  - pending: request sent, awaiting response
  - accepted: active friendship (shown in this component)
  - rejected: request denied (not shown)
  
  Usage:
  <FriendsList /> (used in Friends.vue page)
  
  Reference:
  - requirements/database-schema.md for friendships table
  - requirements/api-endpoints.md for GET /api/friends endpoint
  - tasks/04-social-features-privacy.md for friendship logic
-->

<template>
  <!-- TODO: Implement friends list with search -->
  <!-- TODO: Display friend cards with avatars -->
  <!-- TODO: Add click handlers to view friend profile -->
  <!-- TODO: Add "Suggest Outfit" button for each friend -->
  <!-- TODO: Show empty state if no friends -->
</template>

<script setup>
// TODO: Import friends store
// TODO: Fetch friends on mount (status = 'accepted')
// TODO: Implement search/filter logic
// TODO: Handle navigation to friend profile
// TODO: Handle suggest outfit action
</script>

<style scoped>
/* TODO: Add list styles */
</style>
