<!--
  Button Component - StyleSnap
  
  Purpose: Reusable button component with multiple variants (primary, secondary, danger, etc.)
  
  Props:
  - variant: 'primary' | 'secondary' | 'danger' | 'ghost' (default: 'primary')
  - size: 'sm' | 'md' | 'lg' (default: 'md')
  - disabled: boolean
  - loading: boolean (shows loading spinner)
  - fullWidth: boolean (makes button 100% width)
  
  Usage:
  <Button variant="primary" @click="handleClick">Save</Button>
  <Button variant="danger" :loading="isDeleting">Delete</Button>
  
  Reference: requirements/frontend-components.md for design specifications
-->

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span
      v-if="loading"
      class="button-spinner"
    />
    <slot v-else />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const buttonClasses = computed(() => {
  const classes = ['btn']
  
  // Variant classes
  classes.push(`btn-${props.variant}`)
  
  // Size classes
  classes.push(`btn-${props.size}`)
  
  // Full width
  if (props.fullWidth) {
    classes.push('btn-full-width')
  }
  
  // Loading state
  if (props.loading) {
    classes.push('btn-loading')
  }
  
  return classes.join(' ')
})

function handleClick(event) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border-radius: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  outline: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Variants */
.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-ghost {
  background-color: transparent;
  color: #6b7280;
}

.btn-ghost:hover:not(:disabled) {
  background-color: #f3f4f6;
}

/* Sizes */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-md {
  padding: 0.625rem 1.25rem;
  font-size: 1rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Full width */
.btn-full-width {
  width: 100%;
}

/* Loading spinner */
.button-spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
