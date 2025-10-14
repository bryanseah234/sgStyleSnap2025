<!--
  Friend Profile View Page - StyleSnap
  
  Purpose: Display a friend's profile and their shared closet items
  
  Features:
  - Shows friend's profile information
  - Displays friend's closet items (respecting privacy settings)
  - Allows outfit suggestions and unfriending
  
  Route: /friend/:friendId
  Auth: Protected (requires authentication)
  
  Navigation:
  - Access via clicking on friends in FriendsList
  - Back button returns to friends page
  
  Reference:
  - components/social/FriendProfile.vue for the main component
  - requirements/api-endpoints.md for friend profile endpoint
-->

<template>
  <MainLayout>
    <div class="friend-profile-page">
      <FriendProfile :friend-id="friendId" />
    </div>
  </MainLayout>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '../components/layouts/MainLayout.vue'
import FriendProfile from '../components/social/FriendProfile.vue'

const route = useRoute()

// Get friend ID from route params
const friendId = computed(() => route.params.friendId)
</script>

<style scoped>
.friend-profile-page {
  min-height: 100vh;
  background-color: var(--theme-background, #faf5ff);
}
</style>
