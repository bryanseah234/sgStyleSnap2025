<!--
  Debug Overlay Component
  
  Advanced performance monitoring overlay that shows:
  - FPS counter with history graph
  - Memory usage (if available)
  - Active animations count
  - Render calls
  - Network requests
  - Device information
  
  Toggle with "debug" keyword or Shift+D
  
  @author Stylesnap Team
  @version 1.0.0
-->
<template>
  <Teleport to="body">
    <!-- Only show on desktop (md and above) -->
    <div
      v-if="visible && isDesktop"
      :class="['debug-overlay', isDark ? 'debug-overlay--dark' : 'debug-overlay--light']"
    >
      <!-- Header -->
      <div class="debug-header">
        <div class="debug-title">
          <span class="debug-icon">🐛</span>
          <span>Debug Mode</span>
        </div>
        <!-- Close Buttons -->
        <div v-if="isDesktop" class="flex items-center gap-2">
          <!-- ESC Key Hint -->
          <div class="keyboard-hint-modal">
            <span class="keyboard-hint-key">ESC</span>
          </div>
          <!-- Close Button -->
          <button
            @click="$emit('close')"
            class="p-2 rounded-lg transition-all bg-white/90 shadow-lg
                  hover:bg-stone-100 text-stone-500 hover:text-black 
                  dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white"
            title="Close debug panel"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="debug-content">
        <!-- Performance Stats -->
        <div class="debug-section">
          <div class="debug-section-title">⚡ Performance</div>
          <div class="debug-stats">
            <div class="debug-stat">
              <span class="debug-stat-label">FPS</span>
              <span class="debug-stat-value" :class="fpsColorClass">
                {{ stats.fps }}
              </span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">Avg FPS</span>
              <span class="debug-stat-value">{{ stats.avgFps }}</span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">Frame Time</span>
              <span class="debug-stat-value">{{ stats.frameTime }}ms</span>
            </div>
          </div>
          
          <!-- FPS Mini Graph -->
          <div class="debug-graph">
            <canvas ref="graphCanvas" width="200" height="50"></canvas>
          </div>
        </div>
        
        <!-- Memory Stats -->
        <div class="debug-section" v-if="stats.memory">
          <div class="debug-section-title">💾 Memory</div>
          <div class="debug-stats">
            <div class="debug-stat">
              <span class="debug-stat-label">Used</span>
              <span class="debug-stat-value">{{ formatBytes(stats.memory.usedJSHeapSize) }}</span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">Total</span>
              <span class="debug-stat-value">{{ formatBytes(stats.memory.totalJSHeapSize) }}</span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">Limit</span>
              <span class="debug-stat-value">{{ formatBytes(stats.memory.jsHeapSizeLimit) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Render Stats -->
        <div class="debug-section">
          <div class="debug-section-title">🎨 Rendering</div>
          <div class="debug-stats">
            <div class="debug-stat">
              <span class="debug-stat-label">Animations</span>
              <span class="debug-stat-value">{{ stats.activeAnimations }}</span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">DOM Nodes</span>
              <span class="debug-stat-value">{{ stats.domNodes }}</span>
            </div>
          </div>
        </div>
        
        <!-- Device Info -->
        <div class="debug-section">
          <div class="debug-section-title">📱 Device</div>
          <div class="debug-stats">
            <div class="debug-stat debug-stat--full">
              <span class="debug-stat-label">User Agent</span>
              <span class="debug-stat-value debug-stat-value--small">{{ stats.userAgent }}</span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">Viewport</span>
              <span class="debug-stat-value">{{ stats.viewport }}</span>
            </div>
            <div class="debug-stat">
              <span class="debug-stat-label">Device Pixel Ratio</span>
              <span class="debug-stat-value">{{ stats.pixelRatio }}</span>
            </div>
          </div>
        </div>
        
        <!-- Hints -->
        <div class="debug-hints">
          <div class="debug-hint">💡 Type "debug" to toggle</div>
          <div class="debug-hint">⌨️ Shift+D also works</div>
          <div class="debug-hint" v-if="isDesktop">⌨️ Press ESC to close</div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { X } from 'lucide-vue-next'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

// State
const graphCanvas = ref(null)
const isDesktop = ref(window.innerWidth >= 768) // Only show on desktop (md breakpoint)
const stats = ref({
  fps: 0,
  avgFps: 0,
  frameTime: 0,
  memory: null,
  activeAnimations: 0,
  domNodes: 0,
  userAgent: '',
  viewport: '',
  pixelRatio: 1
})

// FPS tracking
let frameCount = 0
let lastTime = performance.now()
let fpsHistory = []
const MAX_FPS_HISTORY = 60

// FPS color coding
const fpsColorClass = computed(() => {
  const fps = stats.value.fps
  if (fps >= 55) return 'debug-stat-value--good'
  if (fps >= 30) return 'debug-stat-value--warning'
  return 'debug-stat-value--bad'
})

/**
 * Handle window resize to update isDesktop state
 */
const handleResize = () => {
  isDesktop.value = window.innerWidth >= 768
}

/**
 * Format bytes to human readable
 */
const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Update stats
 */
const updateStats = () => {
  const now = performance.now()
  const delta = now - lastTime
  
  frameCount++
  
  // Update FPS every second
  if (delta >= 1000) {
    const fps = Math.round((frameCount * 1000) / delta)
    stats.value.fps = fps
    stats.value.frameTime = Math.round(delta / frameCount)
    
    // Add to history
    fpsHistory.push(fps)
    if (fpsHistory.length > MAX_FPS_HISTORY) {
      fpsHistory.shift()
    }
    
    // Calculate average
    const sum = fpsHistory.reduce((a, b) => a + b, 0)
    stats.value.avgFps = Math.round(sum / fpsHistory.length)
    
    // Update graph
    updateGraph()
    
    frameCount = 0
    lastTime = now
  }
  
  // Memory (if available)
  if (performance.memory) {
    stats.value.memory = {
      usedJSHeapSize: performance.memory.usedJSHeapSize,
      totalJSHeapSize: performance.memory.totalJSHeapSize,
      jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
    }
  }
  
  // Active animations (approximate)
  stats.value.activeAnimations = document.querySelectorAll('[style*="animation"], [style*="transition"]').length
  
  // DOM nodes
  stats.value.domNodes = document.querySelectorAll('*').length
  
  // Device info (update once)
  if (!stats.value.userAgent) {
    stats.value.userAgent = navigator.userAgent.substring(0, 50) + '...'
    stats.value.viewport = `${window.innerWidth}×${window.innerHeight}`
    stats.value.pixelRatio = window.devicePixelRatio
  }
}

/**
 * Update FPS graph
 */
const updateGraph = () => {
  if (!graphCanvas.value) return
  
  const canvas = graphCanvas.value
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height
  
  // Clear canvas
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  ctx.fillRect(0, 0, width, height)
  
  // Draw FPS history
  const barWidth = width / MAX_FPS_HISTORY
  fpsHistory.forEach((fps, i) => {
    const barHeight = (fps / 60) * height // Normalize to 60 FPS
    const x = i * barWidth
    const y = height - barHeight
    
    // Color code bars
    if (fps >= 55) {
      ctx.fillStyle = '#10b981' // Green
    } else if (fps >= 30) {
      ctx.fillStyle = '#f59e0b' // Yellow
    } else {
      ctx.fillStyle = '#ef4444' // Red
    }
    
    ctx.fillRect(x, y, barWidth - 1, barHeight)
  })
  
  // Draw 60 FPS reference line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 2])
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.stroke()
  ctx.setLineDash([])
}

// Animation loop
let animationFrameId = null

const startMonitoring = () => {
  const animate = () => {
    updateStats()
    animationFrameId = requestAnimationFrame(animate)
  }
  animate()
}

const stopMonitoring = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

// ESC key handler
const handleEsc = (e) => {
  if (e.key === 'Escape' && props.visible) {
    emit('close')
  }
}

// Watch visibility
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    startMonitoring()
  } else {
    stopMonitoring()
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleEsc)
  if (props.visible && isDesktop.value) {
    startMonitoring()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEsc)
  stopMonitoring()
})

const { theme } = useTheme() // now reactive for theme

const isDark = computed(() => theme.value === 'dark')
</script>

<style scoped>
/* Two theme classes for overlay: .debug-overlay--dark, .debug-overlay--light. Default to dark, add --light if not dark */
.debug-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
  border-radius: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  min-width: 600px;
  max-width: 800px;
  user-select: none;
  animation: fadeIn 0.3s ease-out;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}
.debug-overlay--dark {
  background: rgba(0, 0, 0, 0.95);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.debug-overlay--light {
  background: rgba(255,255,255,0.97);
  color: #18181A;
  border: 1px solid rgba(0,0,0,0.06);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.debug-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--debug-header-border);
}
:global(.debug-overlay--dark) .debug-header {
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
:global(.debug-overlay--light) .debug-header {
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.debug-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
}

.debug-icon {
  font-size: 18px;
}

.debug-content {
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 500px;
  overflow-y: auto;
}

.debug-section {
  flex: 1;
  min-width: 200px;
}

.debug-section:last-child {
  margin-bottom: 0;
}

.debug-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.debug-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
  gap: 10px;
}

.debug-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px 10px;
  border-radius: 6px;
}

.debug-stat--full {
  grid-column: 1 / -1;
}

.debug-stat-label {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.debug-stat-value {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

.debug-stat-value--small {
  font-size: 12px;
  font-weight: 500;
  word-break: break-all;
  line-height: 1.3;
}

.debug-stat-value--good {
  color: #10b981;
}

.debug-stat-value--warning {
  color: #f59e0b;
}

.debug-stat-value--bad {
  color: #ef4444;
}

.debug-graph {
  margin-top: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  height: 50px;
}

.debug-graph canvas {
  display: block;
  width: 100%;
  height: 50px;
}

.debug-hints {
  flex-basis: 100%;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: row;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.debug-hint {
  font-size: 11px;
  opacity: 0.6;
  font-style: italic;
}

/* Scrollbar styling */
.debug-content::-webkit-scrollbar {
  width: 6px;
}

.debug-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.debug-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.debug-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>

