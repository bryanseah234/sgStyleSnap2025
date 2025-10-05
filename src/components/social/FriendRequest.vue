<!--
  FriendRequest Component - StyleSnap
  
  Purpose: Displays incoming and outgoing friend requests with accept/reject actions
  
  Features:
  - List of pending incoming requests (can accept/reject)
  - List of outgoing requests (can cancel)
  - Accept/reject buttons for incoming requests
  - Cancel button for outgoing requests
  
  Data Source:
  - friendships table where status = 'pending'
  - Incoming: where target_user_id = current_user_id
  - Outgoing: where requester_id = current_user_id
  
  Actions:
  - Accept: updates status to 'accepted'
  - Reject: updates status to 'rejected' (or deletes row)
  - Cancel: deletes the pending request
  
  Usage:
  <FriendRequest /> (shown in Friends.vue or as a modal)
  
  Reference:
  - requirements/database-schema.md for friendships table
  - requirements/api-endpoints.md for PUT /api/friends/:id endpoint
  - tasks/04-social-features-privacy.md for request flow
-->

<template>
  <!-- TODO: Implement tabs or sections for incoming vs outgoing -->
  <!-- TODO: Display incoming requests with accept/reject buttons -->
  <!-- TODO: Display outgoing requests with cancel button -->
  <!-- TODO: Show empty state if no pending requests -->
  <!-- TODO: Show success notification after action -->
</template>

<script setup>
// TODO: Import friends store
// TODO: Fetch pending requests (both incoming and outgoing)
// TODO: Handle accept request
// TODO: Handle reject request
// TODO: Handle cancel request
// TODO: Update friends list after actions
</script>

<style scoped>
/* TODO: Add request list styles */
</style>
