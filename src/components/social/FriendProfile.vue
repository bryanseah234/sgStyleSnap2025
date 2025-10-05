<!--
  FriendProfile Component - StyleSnap
  
  Purpose: Displays a friend's public profile and their visible closet items
  
  Features:
  - Friend's name and profile info
  - Friend's closet items (respecting privacy settings)
  - Button to create outfit suggestion for this friend
  - Unfriend button
  
  Privacy Rules (CRITICAL):
  - Only show items where friend's privacy_level allows
  - privacy_level = 'public': visible to all friends
  - privacy_level = 'private': NOT visible to anyone
  - Enforced by Supabase RLS policies
  
  Props:
  - friendId: string (UUID of friend to display)
  
  Usage:
  <FriendProfile :friendId="selectedFriendId" />
  
  Reference:
  - docs/design/mobile-mockups/10-friend-profile.png for profile design
  - requirements/database-schema.md for privacy_level column
  - requirements/security.md for privacy enforcement
  - sql/002_rls_policies.sql for RLS implementation
-->

<template>
  <!-- TODO: Implement friend profile header -->
  <!-- TODO: Display friend's public closet items in grid -->
  <!-- TODO: Add "Suggest Outfit" button -->
  <!-- TODO: Add unfriend button with confirmation -->
  <!-- TODO: Show message if friend has no public items -->
</template>

<script setup>
// TODO: Define props (friendId)
// TODO: Fetch friend data and public items
// TODO: Handle suggest outfit navigation
// TODO: Handle unfriend action with confirmation
</script>

<style scoped>
/* TODO: Add profile styles */
</style>
