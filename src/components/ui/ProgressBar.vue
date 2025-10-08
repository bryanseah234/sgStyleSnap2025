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
  <div class="progress-bar-container" :class="`progress-bar-${size}`">
    <div 
      class="progress-bar-track" 
      role="progressbar" 
      :aria-valuenow="value" 
      :aria-valuemin="0" 
      :aria-valuemax="max"
    >
      <div 
        class="progress-bar-fill" 
        :class="`progress-bar-${color}`"
        :style="{ width: `${percentage}%` }"
      >
      </div>
    </div>
    <span v-if="showLabel" class="progress-bar-label">
      {{ Math.round(percentage) }}%
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: Number,
    required: true,
    validator: (value) => value >= 0
  },
  max: {
    type: Number,
    default: 100
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
  },
  showLabel: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const percentage = computed(() => {
  const pct = (props.value / props.max) * 100
  return Math.min(100, Math.max(0, pct))
})
</script>

<style scoped>
.progress-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.progress-bar-track {
  flex: 1;
  background-color: #e5e7eb;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.progress-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 9999px;
}

/* Size variants */
.progress-bar-sm .progress-bar-track {
  height: 0.375rem;
}

.progress-bar-md .progress-bar-track {
  height: 0.5rem;
}

.progress-bar-lg .progress-bar-track {
  height: 0.75rem;
}

/* Color variants */
.progress-bar-primary {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.progress-bar-success {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-bar-warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-bar-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.progress-bar-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  min-width: 3rem;
  text-align: right;
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .progress-bar-track {
    background-color: #374151;
  }
  
  .progress-bar-label {
    color: #d1d5db;
  }
}
</style>
