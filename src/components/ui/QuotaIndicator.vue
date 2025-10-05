<!--
  QuotaIndicator Component - StyleSnap
  
  Purpose: Displays user's closet item quota (200 item limit per user)
  
  Props:
  - currentCount: number (items currently in closet)
  - maxCount: number (default: 200, the quota limit)
  - showDetails: boolean (default: true - shows "X / 200 items" text)
  
  Usage:
  <QuotaIndicator :currentCount="userItemCount" />
  
  Business Logic:
  - Each user has a 200-item quota
  - Show warning when approaching limit (>180 items = 90%)
  - Block uploads when at limit
  - Use ProgressBar component internally
  - Color changes: green (0-80%), yellow (80-90%), red (90-100%)
  
  Reference: 
  - requirements/database-schema.md (closet_items table has user quota enforcement)
  - tasks/06-quotas-maintenance.md for quota business logic
  - utils/quota-calculator.js for quota calculation utilities
-->

<template>
  <!-- TODO: Implement quota display with ProgressBar -->
  <!-- TODO: Calculate percentage and color based on usage -->
  <!-- TODO: Show warning message when near limit -->
</template>

<script setup>
// TODO: Define props
// TODO: Import ProgressBar component
// TODO: Calculate quota percentage and determine color
// TODO: Show warning text if > 90% full
</script>

<style scoped>
/* TODO: Add quota indicator styles */
</style>
