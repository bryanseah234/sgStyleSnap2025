/**
 * Performance Monitor Composable
 * 
 * Provides reactive FPS monitoring and performance tracking
 * 
 * @author Stylesnap Team
 * @version 1.0.0
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { FPSMonitor, MemoryMonitor } from '@/utils/performance'

/**
 * Use Performance Monitor
 * @param {Object} options - Configuration options
 * @returns {Object} - Reactive performance state and controls
 */
export function usePerformanceMonitor(options = {}) {
  const {
    enabled = import.meta.env.DEV,
    visible: initialVisible = false,
    warningThreshold = 50,
    samples = 60
  } = options
  
  // State
  const currentFps = ref(60)
  const averageFps = ref(60)
  const minFps = ref(60)
  const maxFps = ref(60)
  const visible = ref(initialVisible)
  const warnings = ref([])
  const memory = ref(null)
  
  // FPS Monitor instance
  let fpsMonitor = null
  let memoryMonitor = null
  let animationFrameId = null
  
  // Color coding
  const fpsColor = computed(() => {
    if (currentFps.value >= 55) return '#10b981' // Green
    if (currentFps.value >= 40) return '#f59e0b' // Yellow
    return '#ef4444' // Red
  })
  
  // Performance state
  const performanceState = computed(() => {
    if (currentFps.value >= 55) return 'good'
    if (currentFps.value >= 40) return 'warning'
    return 'critical'
  })
  
  /**
   * Initialize monitors
   */
  const init = () => {
    if (!enabled) return
    
    // Create FPS monitor
    fpsMonitor = new FPSMonitor({
      warningThreshold,
      samples,
      onWarning: (stats) => {
        warnings.value.push({
          timestamp: Date.now(),
          fps: stats.fps,
          avgFPS: stats.avgFPS,
          delta: stats.delta
        })
        
        // Keep only last 10 warnings
        if (warnings.value.length > 10) {
          warnings.value.shift()
        }
        
        console.warn(`[Performance] FPS dropped to ${Math.round(stats.fps)} (avg: ${Math.round(stats.avgFPS)})`)
      },
      onUpdate: (stats) => {
        currentFps.value = stats.fps
        averageFps.value = stats.avgFPS
      }
    })
    
    // Create memory monitor
    memoryMonitor = new MemoryMonitor()
    
    // Start monitoring
    fpsMonitor.start()
    
    // Start update loop
    const updateLoop = () => {
      if (!enabled) return
      
      fpsMonitor.tick()
      
      // Update stats
      const stats = fpsMonitor.getStats()
      minFps.value = stats.min
      maxFps.value = stats.max
      
      // Update memory (less frequently)
      if (memoryMonitor.isSupported && Math.random() < 0.1) {
        memory.value = memoryMonitor.getUsage()
      }
      
      animationFrameId = requestAnimationFrame(updateLoop)
    }
    
    updateLoop()
  }
  
  /**
   * Toggle visibility
   */
  const toggleVisibility = () => {
    visible.value = !visible.value
  }
  
  /**
   * Get current stats
   */
  const getStats = () => {
    return {
      fps: {
        current: currentFps.value,
        average: averageFps.value,
        min: minFps.value,
        max: maxFps.value
      },
      memory: memory.value,
      state: performanceState.value,
      warnings: warnings.value
    }
  }
  
  /**
   * Log stats to console
   */
  const logStats = () => {
    const stats = getStats()
    console.log('[Performance Stats]', {
      FPS: `${stats.fps.current} (avg: ${stats.fps.average}, min: ${stats.fps.min}, max: ${stats.fps.max})`,
      Memory: stats.memory ? `${stats.memory.used}MB / ${stats.memory.limit}MB` : 'N/A',
      State: stats.state,
      Warnings: stats.warnings.length
    })
    
    if (memoryMonitor) {
      memoryMonitor.logUsage('[Performance]')
    }
  }
  
  /**
   * Cleanup
   */
  const cleanup = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    
    if (fpsMonitor) {
      fpsMonitor.stop()
      fpsMonitor = null
    }
  }
  
  // Keyboard shortcut (Shift + F)
  const handleKeydown = (event) => {
    if (event.shiftKey && event.key.toLowerCase() === 'f') {
      event.preventDefault()
      toggleVisibility()
    }
    
    // Shift + P to log stats
    if (event.shiftKey && event.key.toLowerCase() === 'p') {
      event.preventDefault()
      logStats()
    }
  }
  
  // Lifecycle
  onMounted(() => {
    init()
    window.addEventListener('keydown', handleKeydown)
  })
  
  onUnmounted(() => {
    cleanup()
    window.removeEventListener('keydown', handleKeydown)
  })
  
  return {
    // State
    currentFps,
    averageFps,
    minFps,
    maxFps,
    fpsColor,
    performanceState,
    visible,
    warnings,
    memory,
    
    // Methods
    toggleVisibility,
    getStats,
    logStats
  }
}

export default usePerformanceMonitor
