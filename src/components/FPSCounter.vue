<!--
  FPS Counter Component
  Development-only FPS monitoring overlay
  
  Features:
  - Shows current FPS with color coding (green/yellow/red)
  - Displays average FPS
  - Toggle with Shift + F keyboard shortcut
  - Development mode only (auto-hides in production)
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div
    v-if="visible"
    class="fps-counter"
    :style="{
      '--fps-color': fpsColor
    }"
  >
    <div class="fps-display">
      <span class="fps-label">FPS</span>
      <span class="fps-value">{{ currentFps }}</span>
      <span class="fps-dot" :class="`fps-dot--${fpsColor}`"></span>
    </div>
    <div class="fps-stats" v-if="showDetails">
      <div class="fps-stat">
        <span class="fps-stat-label">Avg:</span>
        <span class="fps-stat-value">{{ averageFps }}</span>
      </div>
      <div class="fps-stat">
        <span class="fps-stat-label">Min:</span>
        <span class="fps-stat-value">{{ minFps }}</span>
      </div>
      <div class="fps-stat">
        <span class="fps-stat-label">Max:</span>
        <span class="fps-stat-value">{{ maxFps }}</span>
      </div>
    </div>
    <div class="fps-hint">
      <span class="fps-keyboard-hint">Shift + F to toggle</span>
    </div>
  </div>
</template>

<script setup>
/**
 * FPS Counter Component Script
 * 
 * Provides real-time FPS monitoring with color-coded display
 */

import { ref, computed, watch } from 'vue'
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'

// Performance monitor composable
const {
  currentFps,
  averageFps,
  minFps,
  maxFps,
  fpsColor,
  visible: monitorVisible,
  toggleVisibility
} = usePerformanceMonitor({
  enabled: import.meta.env.DEV,
  visible: false,
  warningThreshold: 55
})

// Component state
const showDetails = ref(false)
const visible = computed(() => monitorVisible.value)

// Toggle details on click
const toggleDetails = () => {
  showDetails.value = !showDetails.value
}

// Expose for external control
defineExpose({
  toggleVisibility
})
</script>

<style scoped>
.fps-counter {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  min-width: 120px;
  user-select: none;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.fps-counter:hover {
  transform: translateY(-2px);
}

.fps-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.fps-label {
  font-weight: 600;
  font-size: 11px;
  opacity: 0.7;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.fps-value {
  font-weight: 700;
  font-size: 24px;
  color: var(--fps-color);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.5px;
}

.fps-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fps-color);
  box-shadow: 0 0 8px var(--fps-color);
  animation: pulse 2s ease-in-out infinite;
}

.fps-dot--green {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.fps-dot--yellow {
  background: #f59e0b;
  box-shadow: 0 0 8px #f59e0b;
}

.fps-dot--red {
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.fps-stats {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.fps-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.fps-stat-label {
  font-size: 9px;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fps-stat-value {
  font-size: 14px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.fps-hint {
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.fps-keyboard-hint {
  font-size: 9px;
  opacity: 0.5;
  font-style: italic;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .fps-counter {
    top: 10px;
    right: 10px;
    padding: 8px 12px;
    font-size: 11px;
    min-width: 100px;
  }
  
  .fps-value {
    font-size: 20px;
  }
  
  .fps-stats {
    flex-direction: column;
    gap: 4px;
  }
  
  .fps-hint {
    display: none; /* Hide keyboard hint on mobile */
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .fps-counter {
    background: rgb(0, 0, 0);
    border: 2px solid white;
  }
}
</style>
