# Performance Features - Quick Start Guide

## 🚀 Get Started in 5 Minutes

Quick guide to using the new performance monitoring and optimization features.

## ⚡ Performance Monitoring

### Enable FPS Counter

**Development** (automatic):
- Press **Shift + F** to toggle FPS counter
- Press **Shift + P** to log performance stats

**Production** (manual):
```javascript
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'

const { currentFps, averageFps, performanceState } = usePerformanceMonitor({
  enabled: true,
  visible: true,
  warningThreshold: 50
})
```

### Monitor Performance Programmatically

```javascript
import { FPSMonitor, MemoryMonitor } from '@/utils/performance'

// FPS monitoring
const fpsMonitor = new FPSMonitor({
  targetFPS: 60,
  warningThreshold: 50,
  onWarning: (stats) => {
    console.warn(`FPS dropped to ${stats.fps}`)
  }
})

fpsMonitor.start()

// Memory monitoring
const memoryMonitor = new MemoryMonitor()
const usage = memoryMonitor.getUsage()
console.log(`Memory: ${usage.used}MB / ${usage.limit}MB`)
```

## 🎨 Will-Change Management

### Basic Usage

```javascript
import { willChangeManager } from '@/utils/performance'

// Add will-change for animation
const element = document.querySelector('.my-element')
willChangeManager.add(element, 'transform, opacity', 300) // Auto-remove after 300ms

// Add until event completes
willChangeManager.addForEvent(element, 'transform', 'transitionend')

// Manual removal
willChangeManager.remove(element)
```

### In Vue Components

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { willChangeManager } from '@/utils/performance'

const elementRef = ref(null)

const startAnimation = () => {
  // Add will-change before animation
  willChangeManager.add(elementRef.value, 'transform', 500)
  
  // Your animation code...
}

onUnmounted(() => {
  // Cleanup
  willChangeManager.remove(elementRef.value)
})
</script>

<template>
  <div ref="elementRef" @click="startAnimation">
    Animated content
  </div>
</template>
```

## 🔧 Device Detection

### Detect Device Capabilities

```javascript
import { detectDeviceTier, getOptimizedSettings } from '@/utils/performance'

// Get device tier
const deviceTier = detectDeviceTier()
console.log(deviceTier)
// {
//   level: 'high', // 'low', 'medium', or 'high'
//   isMobile: false,
//   isTouch: false,
//   cores: 8,
//   memory: 16, // GB
//   connection: 'fast',
//   pixelRatio: 2
// }

// Get optimized settings based on device
const settings = getOptimizedSettings(deviceTier)
console.log(settings)
// {
//   pixelRatio: 2,
//   antialias: true,
//   shadows: false,
//   maxLights: 5,
//   lazyLoadDistance: 1,
//   animationQuality: 'high'
// }
```

### Progressive Enhancement Example

```vue
<script setup>
import { computed } from 'vue'
import { detectDeviceTier, getOptimizedSettings } from '@/utils/performance'

const deviceTier = detectDeviceTier()
const settings = getOptimizedSettings(deviceTier)

const animationClass = computed(() => {
  return settings.animationQuality === 'reduced' 
    ? 'simple-animation' 
    : 'full-animation'
})
</script>

<template>
  <div :class="animationClass">
    Content with device-appropriate animations
  </div>
</template>
```

## 🎯 Lazy Loading

The Avatar3DCarousel automatically lazy loads models. To understand or customize:

```javascript
// Default: Load visible + 1 adjacent on each side
const LAZY_LOAD_DISTANCE = 1

// For more aggressive lazy loading (only visible):
const LAZY_LOAD_DISTANCE = 0

// For more pre-loading (visible + 2 on each side):
const LAZY_LOAD_DISTANCE = 2
```

## 📊 Performance Utilities

### Throttle with RAF

```javascript
import { throttleRAF } from '@/utils/performance'

const handleMouseMove = throttleRAF((event) => {
  // This will be throttled to ~60fps using requestAnimationFrame
  console.log('Mouse moved:', event.clientX, event.clientY)
})

window.addEventListener('mousemove', handleMouseMove)
```

### Debounce

```javascript
import { debounce } from '@/utils/performance'

const handleResize = debounce(() => {
  // This will only run 150ms after the last resize event
  console.log('Window resized')
}, 150)

window.addEventListener('resize', handleResize)
```

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Shift + F** | Toggle FPS counter |
| **Shift + P** | Log performance stats to console |

## 📈 Performance Metrics

### Check Current Performance

```javascript
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'

const { getStats } = usePerformanceMonitor()

const stats = getStats()
console.log(stats)
// {
//   fps: { current: 60, average: 58, min: 55, max: 60 },
//   memory: { used: 30, limit: 500, percentage: 6 },
//   state: 'good', // 'good', 'warning', or 'critical'
//   warnings: []
// }
```

### React to Performance Issues

```javascript
import { usePerformanceMonitor } from '@/composables/usePerformanceMonitor'

const { performanceState, currentFps } = usePerformanceMonitor({
  warningThreshold: 50
})

// Watch for performance issues
watch(performanceState, (state) => {
  if (state === 'critical') {
    console.warn('Performance critical! Taking action...')
    // Reduce quality, disable effects, etc.
  }
})
```

## 🛠️ Common Patterns

### Animate with Will-Change

```javascript
// ✅ GOOD: Add will-change before animation, remove after
const animateElement = (element) => {
  willChangeManager.add(element, 'transform', 500)
  element.style.transform = 'translateX(100px)'
}

// ❌ BAD: Permanent will-change
const animateElementBad = (element) => {
  element.style.willChange = 'transform' // Never removed!
  element.style.transform = 'translateX(100px)'
}
```

### Device-Aware Rendering

```javascript
import { detectDeviceTier, getOptimizedSettings } from '@/utils/performance'

const setupThreeJS = () => {
  const deviceTier = detectDeviceTier()
  const settings = getOptimizedSettings(deviceTier)
  
  const renderer = new THREE.WebGLRenderer({
    antialias: settings.antialias,
    powerPreference: 'high-performance'
  })
  
  renderer.setPixelRatio(settings.pixelRatio)
  
  // Use settings for other optimizations
  if (settings.animationQuality === 'reduced') {
    // Disable complex animations
  }
}
```

### Conditional Rendering Loop

```javascript
let needsRender = true

const animate = () => {
  requestAnimationFrame(animate)
  
  // Only render if something changed
  if (needsRender) {
    renderer.render(scene, camera)
    needsRender = false
  }
}

// Mark as needing render when something changes
const updateScene = () => {
  // Change something in the scene
  object.position.x += 0.1
  
  // Request render
  needsRender = true
}
```

## 📚 Full API Reference

### FPSMonitor

```javascript
const fpsMonitor = new FPSMonitor({
  targetFPS: 60,         // Target frame rate
  warningThreshold: 50,  // Warn when FPS drops below
  samples: 60,           // Number of samples for averaging
  onWarning: (stats) => {}, // Callback for warnings
  onUpdate: (stats) => {}   // Callback for updates
})

fpsMonitor.start()
fpsMonitor.stop()
fpsMonitor.tick() // Call in animation loop
const stats = fpsMonitor.getStats()
```

### MemoryMonitor

```javascript
const memoryMonitor = new MemoryMonitor()

const usage = memoryMonitor.getUsage()
// { used: 30, total: 120, limit: 500, percentage: 6 }

memoryMonitor.logUsage('Label')
// Console: "Label: 30MB / 500MB (6%)"
```

### WillChangeManager

```javascript
willChangeManager.add(element, properties, duration)
willChangeManager.remove(element)
willChangeManager.addForEvent(element, properties, eventName)
willChangeManager.clear() // Clear all
```

### Device Detection

```javascript
const tier = detectDeviceTier()
// { level, isMobile, isTouch, cores, memory, connection, pixelRatio }

const gpuTier = detectGPUTier()
// { tier: 'low'|'medium'|'high', renderer: string }

const settings = getOptimizedSettings(tier)
// Device-appropriate settings object
```

## 🎯 Tips & Best Practices

1. **Always remove will-change**: Use `willChangeManager` to ensure cleanup
2. **Monitor in development**: Keep FPS counter visible during development
3. **Test on low-end devices**: Use CPU throttling in DevTools
4. **Progressive enhancement**: Detect device capabilities and adjust
5. **Conditional rendering**: Only render Three.js when scene changes
6. **Lazy loading**: Load resources only when needed
7. **Proper cleanup**: Always dispose of Three.js resources

## 🐛 Troubleshooting

### Low FPS?

1. Check FPS counter: **Shift + F**
2. Log stats: **Shift + P**
3. Look for warnings in console
4. Check if will-change is being removed
5. Verify conditional rendering is working
6. Test on different devices

### High Memory Usage?

1. Check Memory Monitor
2. Verify proper disposal of Three.js resources
3. Check for memory leaks (Chrome DevTools)
4. Ensure lazy loading is working
5. Verify cleanup in unmount hooks

### Animations Janky?

1. Verify only transform/opacity are animated
2. Check if will-change is applied during animation
3. Use GPU acceleration (translateZ(0))
4. Reduce quality on low-end devices
5. Test with CPU throttling

## 📖 More Information

- **Full Documentation**: `PERFORMANCE_OPTIMIZATION_SUMMARY.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Source Code**: `src/utils/performance.js`

---

**Remember**: Performance optimization is an ongoing process. Monitor, measure, and iterate!

🚀 Happy optimizing!

