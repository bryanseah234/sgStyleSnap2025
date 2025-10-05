<!--
  ClosetGrid Component - StyleSnap
  
  Purpose: Displays user's closet items in a responsive grid layout with filtering and sorting
  
  Features:
  - Grid display of closet items (cards with images)
  - Category filter (tops, bottoms, shoes, outerwear, accessories)
  - Sorting options (recent, name, category)
  - Click item to view details/edit/delete
  - Add new item button
  - Shows QuotaIndicator
  - Empty state when no items
  - Loading skeletons while fetching
  
  Data Source:
  - Fetches from closet-store.js (Pinia store)
  - Items stored in Supabase closet_items table
  - Images served from Cloudinary CDN
  
  Usage:
  <ClosetGrid /> (used in Closet.vue page)
  
  Business Rules:
  - Show only current user's items (enforced by RLS in Supabase)
  - Max 200 items per user
  - Each item belongs to 1 of 5 categories
  
  Reference:
  - docs/design/mobile-mockups/03-closet-grid.png for grid layout design
  - requirements/database-schema.md for closet_items table structure
  - requirements/api-endpoints.md for GET /api/closet endpoints
-->

<template>
  <!-- TODO: Implement grid layout with filter and sort controls -->
  <!-- TODO: Display item cards with images from Cloudinary -->
  <!-- TODO: Add click handlers to view/edit items -->
  <!-- TODO: Show loading skeletons while fetching -->
  <!-- TODO: Show empty state if no items -->
  <!-- TODO: Add floating action button (FAB) to add new item -->
</template>

<script setup>
// TODO: Import closet store
// TODO: Fetch items on mount
// TODO: Implement filtering and sorting logic
// TODO: Handle item click (navigate to detail/edit)
</script>

<style scoped>
/* TODO: Add grid layout styles (responsive columns) */
/* TODO: Add card hover effects */
</style>
