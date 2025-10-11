<!--
  Analytics Page - StyleSnap
  
  Purpose: Wardrobe analytics and insights dashboard
  
  Features:
  - Comprehensive wardrobe statistics
  - Most worn items ranking
  - Category, occasion, and rating breakdowns
  - Date range filtering (7/30/90/365 days, all-time, custom)
  - Weather preference insights
  - Unworn outfit combinations suggestions
  
  Route: /analytics
  Auth: Protected (requires authentication)
  
  Reference:
  - tasks/13-advanced-outfit-features.md for analytics specifications
  - stores/analytics-store.js for state management
  - components/analytics/ for UI components
-->

<template>
  <MainLayout>
    <div class="analytics-page">
      <WardrobeAnalytics />
    </div>
  </MainLayout>
</template>

<script setup>
import MainLayout from '../components/layouts/MainLayout.vue'
import WardrobeAnalytics from '../components/analytics/WardrobeAnalytics.vue'
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  padding: 1rem;
  background-color: #f9fafb;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .analytics-page {
    padding: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .analytics-page {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .analytics-page {
    background-color: #111827;
  }
}
</style>
