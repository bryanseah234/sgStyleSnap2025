<!--
  Badge Component - StyleSnap
  
  Purpose: Small badge/tag component for displaying categories, counts, or status
  
  Props:
  - variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' (default: 'default')
  - size: 'sm' | 'md' (default: 'md')
  - rounded: boolean (default: true - makes fully rounded pill shape)
  
  Slots:
  - default: badge content
  
  Usage:
  <Badge variant="primary">Tops</Badge>
  <Badge variant="warning">3</Badge> (for notification counts)
  
  Reference: Used in NotificationBell.vue for unread count display
-->

<template>
  <span
    class="badge"
    :class="[`badge-${variant}`, `badge-${size}`, { 'badge-rounded': rounded }]"
  >
    <slot />
  </span>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md'].includes(value)
  },
  rounded: {
    type: Boolean,
    default: true
  }
})
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.2s;
}

/* Sizes */
.badge-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.badge-md {
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

/* Variants */
.badge-default {
  background: #e2e8f0;
  color: #4a5568;
}

.badge-primary {
  background: #667eea;
  color: white;
}

.badge-success {
  background: #48bb78;
  color: white;
}

.badge-warning {
  background: #f6ad55;
  color: white;
}

.badge-danger {
  background: #ef4444;
  color: white;
}

/* Rounded */
.badge-rounded {
  border-radius: 9999px;
}

.badge:not(.badge-rounded) {
  border-radius: 0.25rem;
}
</style>
