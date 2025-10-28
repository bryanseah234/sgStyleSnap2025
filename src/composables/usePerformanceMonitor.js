/**
 * Performance Monitor Composable
 * 
 * Tracks FPS and performance metrics for the application.
 * Provides real-time monitoring with customizable options.
 * 
 * Features:
 * - FPS tracking over configurable time periods
 * - Warning system for dropped frames
 * - Average FPS calculation
 * - Performance marks for profiling
 * - Keyboard toggle support (Shift + F)
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

let performanceMonitorInstance = null

/**
 * Performance Monitor
 * 
 * Singleton class that tracks FPS and provides performance metrics
 */
class PerformanceMonitor {
  constructor(options = {}) {
    this.enabled = options.enabled ?? true
    this.visible = options.visible ?? false
    this.fpsHistory = []
    this.maxHistorySize = options.maxHistorySize ?? 60
    this.frameCount = 0
    this.lastTime = performance.now()
    this.animationFrameId = null
    this.warningThreshold = options.warningThreshold ?? 55
    
    // Callback for when FPS drops below threshold
    this.onWarning = options.onWarning ?? null
    
    // Performance marks tracking
    this.marks = new Map()
    this.Parameters = new Map()
    
    // Keyboard listener for toggle
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }
  
  /**
   * Starts the FPS monitoring loop
   */
  start() {
    if (!this.enabled || this.animationFrameId !== null) return
    
    this.lastTime = performance.now()
    this.tick()
  }
  
  /**
   * Stops the FPS monitoring loop
   */
  stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }
  
  /**
   * Main monitoring loop
   */
  tick() {
    const currentTime = performance.now()
    const delta = currentTime - this.lastTime
    
    // Calculate FPS
    if (delta > 0) {
      const fps = 1000 / delta
      this.fpsHistory.push(fps)
      
      // Maintain history size
      if (this.fpsHistory.length > this.maxHistorySize) {
        this.fpsHistory.shift()
      }
      
      // Check for warnings
      if (fps < this.warningThreshold && this.onWarning) {
        this.onWarning(fps, this.getAverageFps())
      }
    }
    
    this.frameCount++
    this.lastTime = currentTime
    this.animationFrameId = requestAnimationFrame(() => this.tick())
  }
  
  /**
   * Gets the current FPS
   */
  getCurrentFps() {
    return this.fpsHistory.length > 0 
      ? Math.round(this.fpsHistory[this.fpsHistory.length - 1])
      : 60
  }
  
  /**
   * Gets the average FPS over the history
   */
  getAverageFps() {
    if (this.fpsHistory.length === 0) return 60
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0)
    return Math.round(sum / this.fpsHistory.length)
  }
  
  /**
   * Gets the minimum FPS in history
   */
  getMinFps() {
    return this.fpsHistory.length > 0 
      ? Math.round(Math.min(...this.fpsHistory))
      : 60
  }
  
  /**
   * Gets the maximum FPS in history
   */
  getMaxFps() {
    return this.fpsHistory.length > 0 
      ? Math.round(Math.max(...this.fpsHistory))
      : 60
  }
  
  /**
   * Gets the FPS status color
   */
  getFpsColor() {
    const current = this.getCurrentFps()
    
    if (current >= 60) return 'green'
    if (current >= 45) return 'yellow'
    return 'red'
  }
  
  /**
   * Adds a performance mark
   */
  mark(label) {
    if (!this.enabled) return
    
    this.marks.set(label, performance.now())
    
    // Also use native Performance API
    if (typeof performance.mark === 'function') {
      performance.mark(label)
    }
    
    return this.marks.get(label)
  }
  
  /**
   * Measures performance between two marks
   */
  measure(name, startMark, endMark) {
    if (!this.enabled) return null
    
    const start = this.marks.get(startMark)
    const end = this.marks.get(endMark || name)
    
    if (!start || !end) return null
    
    const duration = end - start
    this.Parameters.set(name, duration)
    
    // Also use native Performance API
    if (typeof performance.measure === 'function') {
      performance.measure(name, startMark, endMark || name)
    }
    
    return duration
  }
  
  /**
   * Gets all performance measurements
   */
  getMeasurements() {
    return Array.from(this.Parameters.entries()).map(([name, duration]) => ({
      name,
      duration: Math.round(duration * 100) / 100
    }))
  }
  
  /**
   * Clears all marks and measurements
   */
  clear() {
    this.marks.clear()
    this.Parameters.clear()
    
    // Clear native performance marks
    if (typeof performance.clearMarks === 'function') {
      performance.clearMarks()
    }
    if (typeof performance.clearMeasures === 'function') {
      performance.clearMeasures()
    }
  }
  
  /**
   * Toggles visibility
   */
  toggleVisibility() {
    this.visible = !this.visible
    return this.visible
  }
  
  /**
   * Keyboard handler for toggling visibility
   */
  handleKeyDown(event) {
    if (event.shiftKey && event.key === 'F' && this.enabled) {
      event.preventDefault()
      this.toggleVisibility()
    }
  }
  
  /**
   * Sets up keyboard listener
   */
  setupKeyboardListener() {
    window.addEventListener('keydown', this.handleKeyDown)
  }
  
  /**
   * Removes keyboard listener
   */
  removeKeyboardListener() {
    window.removeEventListener('keydown', this.handleKeyDown)
  }
}

/**
 * usePerformanceMonitor Composable
 * 
 * Provides reactive performance monitoring with FPS tracking
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.enabled - Whether monitoring is enabled
 * @param {boolean} options.visible - Whether to show FPS counter initially
 * @param {number} options.maxHistorySize - Number of frames to track
 * @param {number} options.warningThreshold - FPS threshold for warnings
 * @returns {Object} Performance monitoring API
 */
export function usePerformanceMonitor(options = {}) {
  // Ensure only one instance exists
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new PerformanceMonitor(options)
  }
  
  const monitor = performanceMonitorInstance
  
  // Reactive refs
  const currentFps = ref(60)
  const averageFps = ref(60)
  const minFps = ref(60)
  const maxFps = ref(60)
  const fpsColor = ref('green')
  const visible = ref(options.visible ?? false)
  const measurements = ref([])
  
  // Computed properties
  const fpsStatus = computed(() => ({
    current: currentFps.value,
    average: averageFps.value,
    min: minFps.value,
    max: maxFps.value,
    color: fpsColor.value
  }))
  
  /**
   * Updates reactive refs from monitor
   */
  const updateFpsMetrics = () => {
    currentFps.value = monitor.getCurrentFps()
    averageFps.value = monitor.getAverageFps()
    minFps.value = monitor.getMinFps()
    maxFps.value = monitor.getMaxFps()
    fpsColor.value = monitor.getFpsColor()
  }
  
  /**
   * Updates measurements
   */
  const updateMeasurements = () => {
    measurements.value = monitor.getMeasurements()
  }
  
  /**
   * Toggles visibility
   */
  const toggleVisibility = () => {
    visible.value = monitor.toggleVisibility()
  }
  
  /**
   * Adds a performance mark
   */
  const mark = (label) => {
    return monitor.mark(label)
  }
  
  /**
   * Measures performance between marks
   */
  const measure = (name, startMark, endMark) => {
    const result = monitor.measure(name, startMark, endMark)
    updateMeasurements()
    return result
  }
  
  /**
   * Clears all marks and measurements
   */
  const clear = () => {
    monitor.clear()
    updateMeasurements()
  }
  
  /**
   * Starts monitoring
   */
  const start = () => {
    monitor.enabled = true
    monitor.start()
    
    // Update metrics every frame
    const updateLoop = () => {
      if (monitor.enabled) {
        updateFpsMetrics()
        requestAnimationFrame(updateLoop)
      }
    }
    updateLoop()
  }
  
  /**
   * Stops monitoring
   */
  const stop = () => {
    monitor.enabled = false
    monitor.stop()
  }
  
  // Setup on mount
  onMounted(() => {
    if (options.enabled !== false) {
      start()
    }
    
    if (options.visible !== false) {
      visible.value = true
      monitor.visible = true
    }
    
    monitor.setupKeyboardListener()
    
    // Update measurements periodically
    const measurementsInterval = setInterval(() => {
      updateMeasurements()
    }, 1000)
    
    onUnmounted(() => {
      clearInterval(measurementsInterval)
    })
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    monitor.removeKeyboardListener()
    if (options.autoStop !== false) {
      stop()
    }
  })
  
  return {
    // State
    currentFps: computed(() => currentFps.value),
    averageFps: computed(() => averageFps.value),
    minFps: computed(() => minFps.value),
    maxFps: computed(() => maxFps.value),
    fpsColor: computed(() => fpsColor.value),
    visible: computed(() => visible.value),
    measurements: computed(() => measurements.value),
    fpsStatus,
    
    // Actions
    toggleVisibility,
    mark,
    measure,
    clear,
    start,
    stop,
    
    // Low-level access (for advanced use)
    monitor
  }
}

