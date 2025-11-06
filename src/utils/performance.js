/**
 * Performance Monitoring and Optimization Utilities
 * 
 * Provides tools for monitoring FPS, detecting device capabilities,
 * and implementing performance optimizations.
 * 
 * @author StyleSnap Team
 * @version 1.0.0
 */

// ============================================
// FPS MONITORING
// ============================================

/**
 * FPS Monitor Class
 * Tracks frame rate and provides callbacks for performance issues
 */
export class FPSMonitor {
  constructor(options = {}) {
    this.targetFPS = options.targetFPS || 60
    this.warningThreshold = options.warningThreshold || 50
    this.samples = options.samples || 60
    
    this.frames = []
    this.lastTime = performance.now()
    this.fps = 0
    this.avgFPS = 0
    this.isRunning = false
    
    this.onWarning = options.onWarning || null
    this.onUpdate = options.onUpdate || null
  }
  
  start() {
    this.isRunning = true
    this.lastTime = performance.now()
    this.frames = []
  }
  
  stop() {
    this.isRunning = false
  }
  
  tick() {
    if (!this.isRunning) return
    
    const now = performance.now()
    const delta = now - this.lastTime
    this.lastTime = now
    
    // Calculate FPS
    this.fps = 1000 / delta
    
    // Store in samples array
    this.frames.push(this.fps)
    if (this.frames.length > this.samples) {
      this.frames.shift()
    }
    
    // Calculate average FPS
    this.avgFPS = this.frames.reduce((a, b) => a + b, 0) / this.frames.length
    
    // Check for performance warnings
    if (this.fps < this.warningThreshold && this.onWarning) {
      this.onWarning({
        fps: this.fps,
        avgFPS: this.avgFPS,
        delta: delta
      })
    }
    
    // Callback for updates
    if (this.onUpdate) {
      this.onUpdate({
        fps: Math.round(this.fps),
        avgFPS: Math.round(this.avgFPS)
      })
    }
  }
  
  getStats() {
    return {
      current: Math.round(this.fps),
      average: Math.round(this.avgFPS),
      min: Math.round(Math.min(...this.frames)),
      max: Math.round(Math.max(...this.frames))
    }
  }
}

// ============================================
// DEVICE CAPABILITY DETECTION
// ============================================

/**
 * Device Tier Detection
 * Detects device performance tier for progressive enhancement
 */
export const detectDeviceTier = () => {
  const tier = {
    level: 'high', // 'low', 'medium', 'high'
    isMobile: false,
    isTouch: false,
    memory: null,
    cores: null,
    connection: 'fast',
    pixelRatio: window.devicePixelRatio || 1
  }
  
  // Detect mobile
  tier.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  // Detect touch
  tier.isTouch = ('ontouchstart' in window) || 
                 (navigator.maxTouchPoints > 0) ||
                 (navigator.msMaxTouchPoints > 0)
  
  // Get hardware concurrency (CPU cores)
  tier.cores = navigator.hardwareConcurrency || 4
  
  // Get device memory (if available)
  if (navigator.deviceMemory) {
    tier.memory = navigator.deviceMemory // in GB
  }
  
  // Get network connection
  if (navigator.connection) {
    const effectiveType = navigator.connection.effectiveType
    if (effectiveType === 'slow-2g' || effectiveType === '2g') {
      tier.connection = 'slow'
    } else if (effectiveType === '3g') {
      tier.connection = 'medium'
    } else {
      tier.connection = 'fast'
    }
  }
  
  // Determine overall tier
  if (
    tier.isMobile ||
    (tier.memory && tier.memory <= 2) ||
    tier.cores <= 2 ||
    tier.connection === 'slow'
  ) {
    tier.level = 'low'
  } else if (
    (tier.memory && tier.memory <= 4) ||
    tier.cores <= 4 ||
    tier.connection === 'medium'
  ) {
    tier.level = 'medium'
  } else {
    tier.level = 'high'
  }
  
  return tier
}

/**
 * GPU Tier Detection (basic)
 * Attempts to detect GPU capabilities
 */
export const detectGPUTier = () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
  
  if (!gl) {
    return { tier: 'low', renderer: 'unknown' }
  }
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = debugInfo 
    ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    : 'unknown'
  
  // Basic GPU tier detection based on renderer string
  let tier = 'medium'
  
  const rendererLower = renderer.toLowerCase()
  
  // Low-end GPUs
  if (
    rendererLower.includes('intel') && 
    (rendererLower.includes('hd 4000') || rendererLower.includes('hd 3000'))
  ) {
    tier = 'low'
  }
  
  // High-end GPUs
  if (
    rendererLower.includes('nvidia') ||
    rendererLower.includes('amd') ||
    rendererLower.includes('radeon') ||
    rendererLower.includes('geforce')
  ) {
    tier = 'high'
  }
  
  return { tier, renderer }
}

// ============================================
// WILL-CHANGE MANAGEMENT
// ============================================

/**
 * Will-Change Manager
 * Strategically adds and removes will-change properties
 */
export class WillChangeManager {
  constructor() {
    this.elements = new Map()
  }
  
  /**
   * Add will-change to element
   * @param {HTMLElement} element 
   * @param {string} properties - e.g., 'transform, opacity'
   * @param {number} duration - Duration in ms, auto-removes after
   */
  add(element, properties = 'transform', duration = null) {
    if (!element) return
    
    // Clear existing timeout if any
    if (this.elements.has(element)) {
      clearTimeout(this.elements.get(element))
    }
    
    element.style.willChange = properties
    
    // Auto-remove after duration
    if (duration) {
      const timeout = setTimeout(() => {
        this.remove(element)
      }, duration)
      
      this.elements.set(element, timeout)
    }
  }
  
  /**
   * Remove will-change from element
   * @param {HTMLElement} element 
   */
  remove(element) {
    if (!element) return
    
    // Clear timeout if any
    if (this.elements.has(element)) {
      clearTimeout(this.elements.get(element))
      this.elements.delete(element)
    }
    
    element.style.willChange = 'auto'
  }
  
  /**
   * Add will-change for duration of event
   * @param {HTMLElement} element 
   * @param {string} properties 
   * @param {string} eventName - 'transitionend' or 'animationend'
   */
  addForEvent(element, properties = 'transform', eventName = 'transitionend') {
    if (!element) return
    
    this.add(element, properties)
    
    const handler = () => {
      this.remove(element)
      element.removeEventListener(eventName, handler)
    }
    
    element.addEventListener(eventName, handler)
  }
  
  /**
   * Clear all managed elements
   */
  clear() {
    for (const [element, timeout] of this.elements) {
      clearTimeout(timeout)
      this.remove(element)
    }
    this.elements.clear()
  }
}

// Global instance
export const willChangeManager = new WillChangeManager()

// ============================================
// THROTTLE & DEBOUNCE
// ============================================

/**
 * Throttle function using requestAnimationFrame
 * @param {Function} callback 
 * @returns {Function}
 */
export const throttleRAF = (callback) => {
  let ticking = false
  let lastArgs = null
  
  return function(...args) {
    lastArgs = args
    
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        callback.apply(this, lastArgs)
        ticking = false
      })
    }
  }
}

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export const debounce = (func, wait = 150) => {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ============================================
// MEMORY MONITORING
// ============================================

/**
 * Memory Monitor
 * Tracks memory usage if available
 */
export class MemoryMonitor {
  constructor() {
    this.isSupported = performance.memory !== undefined
  }
  
  getUsage() {
    if (!this.isSupported) {
      return null
    }
    
    return {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
      percentage: Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100)
    }
  }
  
  logUsage(label = 'Memory') {
    if (!this.isSupported) {
      console.log(`${label}: Memory API not supported`)
      return
    }
    
    const usage = this.getUsage()
    console.log(`${label}: ${usage.used}MB / ${usage.limit}MB (${usage.percentage}%)`)
  }
}

// ============================================
// PERFORMANCE HINTS
// ============================================

/**
 * Get optimized settings based on device tier
 * @param {Object} deviceTier 
 * @returns {Object}
 */
export const getOptimizedSettings = (deviceTier) => {
  const settings = {
    pixelRatio: 2,
    antialias: true,
    shadows: false,
    maxLights: 5,
    particleCount: 100,
    effectQuality: 'high',
    lazyLoadDistance: 1, // Load avatars within this distance
    animationQuality: 'high'
  }
  
  if (deviceTier.level === 'low') {
    settings.pixelRatio = 1
    settings.antialias = false
    settings.shadows = false
    settings.maxLights = 3
    settings.particleCount = 30
    settings.effectQuality = 'low'
    settings.lazyLoadDistance = 1
    settings.animationQuality = 'reduced'
  } else if (deviceTier.level === 'medium') {
    settings.pixelRatio = Math.min(deviceTier.pixelRatio, 1.5)
    settings.antialias = true
    settings.shadows = false
    settings.maxLights = 4
    settings.particleCount = 60
    settings.effectQuality = 'medium'
    settings.lazyLoadDistance = 1
    settings.animationQuality = 'standard'
  } else {
    settings.pixelRatio = Math.min(deviceTier.pixelRatio, 2)
  }
  
  return settings
}

// ============================================
// EXPORTS
// ============================================

export default {
  FPSMonitor,
  MemoryMonitor,
  WillChangeManager,
  willChangeManager,
  detectDeviceTier,
  detectGPUTier,
  getOptimizedSettings,
  throttleRAF,
  debounce
}

