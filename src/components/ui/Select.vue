<!--
  Select Component - StyleSnap
  
  Purpose: Reusable dropdown/select component for category selection and filters
  
  Props:
  - modelValue: string | number (v-model support)
  - options: Array<{value: string|number, label: string}>
  - label: string
  - placeholder: string (default: 'Select...')
  - error: string
  - required: boolean
  - disabled: boolean
  
  Emits:
  - update:modelValue: for v-model support
  
  Usage:
  <Select v-model="category" :options="categoryOptions" label="Category" required />
  
  Note: The 5 clothing categories are: tops, bottoms, shoes, outerwear, accessories
  Reference: requirements/database-schema.md for category enum values
-->

<template>
  <!-- TODO: Implement select dropdown with options -->
  <!-- TODO: Add custom styling for better UX (vs native select) -->
</template>

<script setup>
// TODO: Define props and emits
// TODO: Implement select change handling
</script>

<style scoped>
/* TODO: Add select styles */
</style>
