<!--
  ProgressBar Component - StyleSnap
  
  Purpose: Visual progress indicator (linear bar)
  
  Props:
  - value: number (0-100, current progress percentage)
  - max: number (default: 100)
  - color: 'primary' | 'success' | 'warning' | 'danger' (default: 'primary')
  - showLabel: boolean (default: false - shows percentage text)
  - size: 'sm' | 'md' | 'lg' (default: 'md', affects height)
  
  Usage:
  <ProgressBar :value="uploadProgress" showLabel /> (for image upload)
  <ProgressBar :value="50" :max="200" color="warning" /> (for quota, 50/200 items)
  
  Reference: Used in QuotaIndicator.vue to show item usage (200 item limit per user)
-->

<template>
  <!-- TODO: Implement progress bar with percentage fill -->
  <!-- TODO: Add smooth transitions for value changes -->
</template>

<script setup>
// TODO: Define props
// TODO: Calculate percentage from value/max
</script>

<style scoped>
/* TODO: Add progress bar styles with color variants */
</style>
