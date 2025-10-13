<!--
  Spinner Component - StyleSnap
  
  Purpose: Reusable loading spinner with different sizes and colors
  
  Props:
  - size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
  - color: 'primary' | 'white' | 'gray' (default: 'primary')
  
  Usage:
  <Spinner size="lg" color="primary" />
  
  Reference:
  - requirements/frontend-components.md Section 1.3
-->

<template>
  <div
    class="spinner-container"
    :class="`spinner-${size}`"
  >
    <div
      class="spinner"
      :class="`spinner-${color}`"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  size: {
    type: String,
    default: 'md',
    validator: value => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary',
    validator: value => ['primary', 'white', 'gray'].includes(value)
  }
})
</script>

<style scoped>
.spinner-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

/* Sizes */
.spinner-xs .spinner {
  width: 16px;
  height: 16px;
  border-width: 2px;
}

.spinner-sm .spinner {
  width: 24px;
  height: 24px;
  border-width: 2px;
}

.spinner-md .spinner {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

.spinner-lg .spinner {
  width: 48px;
  height: 48px;
  border-width: 4px;
}

.spinner-xl .spinner {
  width: 64px;
  height: 64px;
  border-width: 4px;
}

/* Colors */
.spinner-primary {
  border-color: #3b82f6 #3b82f6 #3b82f6 transparent;
}

.spinner-white {
  border-color: #ffffff #ffffff #ffffff transparent;
}

.spinner-gray {
  border-color: #9ca3af #9ca3af #9ca3af transparent;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: spin 2s linear infinite;
  }
}
</style>
