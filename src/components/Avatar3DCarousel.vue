<!--
  Avatar3DCarousel - OPTIMIZED VERSION
  
  Performance improvements:
  - Lazy loading: Load only visible + adjacent avatars
  - Enhanced disposal: Proper cleanup of Three.js resources
  - Optimized rendering: Only render when needed
  - Device-based settings: Adjust quality based on device
  - Strategic will-change: Add/remove dynamically
  
  @author StyleSnap Team
  @version 2.0.0 (Optimized)
-->
<template>
  <div class="avatar-carousel-container" ref="containerRef">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-modern"></div>
      <p class="loading-text">Loading avatars...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="error-state">
      <p class="error-text">Failed to load avatar</p>
      <button @click="retryLoad" class="retry-button">
        Retry
      </button>
    </div>

    <!-- 3D Canvas -->
    <canvas 
      ref="canvasRef" 
      class="avatar-canvas"
      :class="{ 'is-dragging': isDragging, 'has-parallax': isParallaxActive }"
      @mousedown="handleMouseDown"
      @touchstart="handleTouchStart"
      @wheel="handleWheel"
      @mousemove="handleParallaxMouseMove"
      @mouseleave="handleParallaxMouseLeave"
      tabindex="0"
      @keydown="handleKeyDown"
      role="region"
      aria-label="3D Avatar Carousel"
    ></canvas>

  </div>
</template>

<script setup>
/**
 * Avatar3DCarousel Component Script - OPTIMIZED
 * 
 * Major optimizations:
 * 1. Lazy loading - Only load visible + adjacent avatars
 * 2. Enhanced disposal - Proper Three.js cleanup
 * 3. Conditional rendering - Only render when scene changes
 * 4. Device optimization - Adjust settings based on device tier
 * 5. Will-change management - Add/remove strategically
 */

import { ref, onMounted, onUnmounted, watch, inject, shallowRef } from 'vue'
import { willChangeManager, detectDeviceTier, getOptimizedSettings } from '@/utils/performance'

// Dynamic Three.js import for code splitting
let THREE = null
let GLTFLoader = null

// Lazy load Three.js only when needed
const loadThreeJS = async () => {
  if (THREE) return { THREE, GLTFLoader }
  
  const [threeModule, gltfModule] = await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader')
  ])
  
  THREE = threeModule
  GLTFLoader = gltfModule.GLTFLoader
  
  return { THREE, GLTFLoader }
}

// ============================================
// PROPS & EMITS
// ============================================

// COMMENTED OUT: Smooth scroll disabled
// const lenisInstance = inject('lenis', null)

const props = defineProps({
  avatarUrls: {
    type: Array,
    required: true,
    validator: (value) => value.every(url => typeof url === 'string')
  },
  showInfo: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['avatar-change', 'avatar-loaded', 'loading-error'])

// ============================================
// REFS
// ============================================

const containerRef = ref(null)
const canvasRef = ref(null)
const currentIndex = ref(0)
const isLoading = ref(true)
const hasError = ref(false)
const isDragging = ref(false)
const isParallaxActive = ref(false)

// ============================================
// DEVICE OPTIMIZATION
// ============================================

const deviceTier = detectDeviceTier()
const settings = getOptimizedSettings(deviceTier)

console.log('[Avatar3DCarousel] Device Tier:', deviceTier.level, settings)

// ============================================
// THREE.JS VARIABLES
// ============================================

let scene, camera, renderer, loader
let avatars = [] // Array of avatar objects with metadata
let animationFrameId = null
let resizeTimeout = null
let needsRender = true // Flag to track if rendering is needed

// Avatar positioning
const AVATAR_SPACING = 2.5
const ACTIVE_SCALE = 1.0
const INACTIVE_SCALE = 0.75
const INACTIVE_OPACITY = 0.4

// Lazy loading configuration
const LAZY_LOAD_DISTANCE = settings.lazyLoadDistance // Load avatars within this distance
const loadedAvatars = new Set() // Track which avatars are loaded

// ============================================
// PARALLAX VARIABLES
// ============================================

let mouseX = 0
let mouseY = 0
let targetMouseX = 0
let targetMouseY = 0
let baseCameraPosition = { x: 0, y: 0.3, z: 3 }
let baseCameraRotation = { x: 0, y: 0, z: 0 }

const PARALLAX_CONFIG = {
  enabled: settings.animationQuality !== 'reduced',
  maxRotation: 0.087,
  maxPositionOffset: 0.5,
  lerpFactor: 0.08,
  inactiveBlurAmount: 1.5
}

const isTouchDevice = () => {
  return ('ontouchstart' in window) || 
         (navigator.maxTouchPoints > 0) ||
         (navigator.msMaxTouchPoints > 0)
}

// ============================================
// INTERACTION VARIABLES
// ============================================

let touchStartX = 0
let touchStartY = 0
let lastX = 0
let currentOffset = 0
let targetOffset = 0
let isDraggingActive = false
let hasMovedSignificantly = false

// Auto-rotation
const ROTATION_SPEED = 0.005
const ROTATIONS_BEFORE_REVERSE = 3
let rotationCount = 0
let rotationDirection = 1 // 1 for forward, -1 for reverse

// Momentum physics
let dragStartTime = 0
let lastDragX = 0
let lastDragTime = 0
let velocity = 0
let momentumAnimationId = null

const MOMENTUM_CONFIG = {
  enabled: true,
  velocityThreshold: 0.5,
  maxVelocity: 3.0,
  decelerationRate: 0.95,
  minVelocity: 0.01,
  duration: { min: 300, max: 600 },
  tapTimeThreshold: 200,
  tapDistanceThreshold: 10,
}

const RUBBERBAND_CONFIG = {
  enabled: true,
  maxOverscroll: 80,
  resistance: 0.4,
  bounceBackDuration: 400,
}

const VISUAL_FEEDBACK = {
  dragScaleActive: 1.05,
  dragScaleInactive: 0.95,
  motionBlurEnabled: false,
  motionBlurMax: 2,
}

const HAPTIC_CONFIG = {
  enabled: true,
  snapPattern: [10],
  edgePattern: [20, 10, 20],
}

const supportsVibration = () => {
  return 'vibrate' in navigator
}

// ============================================
// LAZY LOADING FUNCTIONS
// ============================================

/**
 * Determine which avatars should be loaded based on current index
 */
const getAvatarsToLoad = () => {
  const toLoad = new Set()
  const distance = LAZY_LOAD_DISTANCE
  
  for (let i = Math.max(0, currentIndex.value - distance); 
       i <= Math.min(props.avatarUrls.length - 1, currentIndex.value + distance); 
       i++) {
    toLoad.add(i)
  }
  
  return toLoad
}

/**
 * Load a single avatar GLB model
 */
const loadSingleAvatar = async (url, index) => {
  if (loadedAvatars.has(index)) {
    return avatars[index]
  }
  
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const avatar = gltf.scene
        
        // Scale avatar (20% smaller than before)
        const box = new THREE.Box3().setFromObject(avatar)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 1.76 / maxDim // Reduced from 2.2 to 1.76 (80% of original)
        avatar.scale.setScalar(scale)

        // Center avatar
        const center = box.getCenter(new THREE.Vector3())
        avatar.position.sub(center.multiplyScalar(scale))

        // Create container group
        const avatarGroup = new THREE.Group()
        avatarGroup.add(avatar)
        avatarGroup.userData = {
          index,
          model: avatar,
          baseScale: scale,
          loaded: true
        }

        // Position avatar
        avatarGroup.position.x = index * AVATAR_SPACING
        avatarGroup.position.y = 0
        avatarGroup.position.z = 0

        scene.add(avatarGroup)
        avatars[index] = avatarGroup
        loadedAvatars.add(index)
        
        needsRender = true // Request render

        emit('avatar-loaded', index)
        resolve(avatarGroup)
      },
      undefined,
      (error) => {
        console.error(`Failed to load avatar ${index + 1}:`, error)
        emit('loading-error', { index, error: error.message })
        reject(error)
      }
    )
  })
}

/**
 * Unload avatar to free memory
 */
const unloadAvatar = (index) => {
  if (!loadedAvatars.has(index) || !avatars[index]) return
  
  const avatarGroup = avatars[index]
  
  // Dispose of Three.js resources
  avatarGroup.traverse((child) => {
    if (child.isMesh) {
      if (child.geometry) {
        child.geometry.dispose()
      }
      
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => disposeMaterial(mat))
        } else {
          disposeMaterial(child.material)
        }
      }
    }
  })
  
  scene.remove(avatarGroup)
  avatars[index] = null
  loadedAvatars.delete(index)
  
  needsRender = true
  
  console.log(`[Lazy Load] Unloaded avatar ${index}`)
}

/**
 * Dispose material and its textures
 */
const disposeMaterial = (material) => {
  if (material.map) material.map.dispose()
  if (material.normalMap) material.normalMap.dispose()
  if (material.roughnessMap) material.roughnessMap.dispose()
  if (material.metalnessMap) material.metalnessMap.dispose()
  if (material.emissiveMap) material.emissiveMap.dispose()
  if (material.aoMap) material.aoMap.dispose()
  material.dispose()
}

/**
 * Update loaded avatars based on current index
 */
const updateLoadedAvatars = async () => {
  const shouldBeLoaded = getAvatarsToLoad()
  
  // Load new avatars
  const loadPromises = []
  for (const index of shouldBeLoaded) {
    if (!loadedAvatars.has(index)) {
      console.log(`[Lazy Load] Loading avatar ${index}`)
      loadPromises.push(loadSingleAvatar(props.avatarUrls[index], index))
    }
  }
  
  // Wait for loading
  if (loadPromises.length > 0) {
    await Promise.all(loadPromises.map(p => p.catch(e => console.error(e))))
  }
  
  // Unload far avatars
  for (const index of loadedAvatars) {
    if (!shouldBeLoaded.has(index)) {
      console.log(`[Lazy Load] Unloading avatar ${index}`)
      unloadAvatar(index)
    }
  }
  
  updateAvatarStates()
}

// ============================================
// THREE.JS SCENE SETUP
// ============================================

const initThreeJS = async () => {
  if (!canvasRef.value) return
  
  // Load Three.js dynamically
  await loadThreeJS()

  // Scene
  scene = new THREE.Scene()
  scene.background = null

  // Camera
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 0.3, 3)
  camera.lookAt(0, 0.1, 0)

  // Renderer with optimized settings
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: settings.antialias,
    powerPreference: 'high-performance'
  })
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.setPixelRatio(settings.pixelRatio)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  // Lighting
  setupLighting()

  // GLTF Loader
  loader = new GLTFLoader()
  
  // Initialize avatars array
  avatars = new Array(props.avatarUrls.length).fill(null)
}

const setupLighting = () => {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0)
  mainLight.position.set(2, 3, 4)
  mainLight.castShadow = false
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
  fillLight.position.set(-3, 1, 2)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
  rimLight.position.set(0, 1, -3)
  scene.add(rimLight)

  const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2)
  bottomLight.position.set(0, -2, 2)
  scene.add(bottomLight)
}

// ============================================
// AVATAR LOADING
// ============================================

const loadAvatars = async () => {
  isLoading.value = true
  hasError.value = false

  try {
    // Load only the current avatar and adjacent ones
    await updateLoadedAvatars()
    
    // Update states
    updateAvatarStates()
    
    // First render
    renderer.render(scene, camera)
    
    isLoading.value = false
    
    // Start animation loop
    animate()
  } catch (error) {
    console.error('Failed to load avatars:', error)
    hasError.value = true
    isLoading.value = false
    emit('loading-error', { index: -1, error: error.message })
  }
}

const updateAvatarStates = () => {
  avatars.forEach((avatarGroup, index) => {
    if (!avatarGroup) return
    
    const isActive = index === currentIndex.value
    
    const targetScale = isActive ? ACTIVE_SCALE : INACTIVE_SCALE
    avatarGroup.scale.setScalar(targetScale * avatarGroup.userData.baseScale)
    
    if (avatarGroup.userData.model) {
      avatarGroup.userData.model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true
          child.material.opacity = isActive ? 1.0 : INACTIVE_OPACITY
        }
      })
    }
    
    needsRender = true
  })
}

// ============================================
// ANIMATION LOOP - OPTIMIZED
// ============================================

const animate = (time) => {
  if (isLoading.value) return
  
  animationFrameId = requestAnimationFrame(animate)

  // COMMENTED OUT: Smooth scroll disabled
  // Update Lenis
  // if (lenisInstance && time !== undefined) {
  //   lenisInstance.raf(time)
  // }

  // Parallax
  if (PARALLAX_CONFIG.enabled && !isTouchDevice() && !isDraggingActive) {
    mouseX += (targetMouseX - mouseX) * PARALLAX_CONFIG.lerpFactor
    mouseY += (targetMouseY - mouseY) * PARALLAX_CONFIG.lerpFactor
    applyParallaxToCamera()
    needsRender = true
  } else if (!PARALLAX_CONFIG.enabled || isTouchDevice() || isDraggingActive) {
    resetCameraParallax()
  }

  // Smooth camera movement
  const lerpFactor = 0.1
  const previousOffset = currentOffset
  currentOffset += (targetOffset - currentOffset) * lerpFactor

  // Update camera
  const targetX = currentIndex.value * AVATAR_SPACING
  const previousCameraX = camera.position.x
  camera.position.x += (targetX - currentOffset - camera.position.x) * lerpFactor
  
  // Check if camera moved
  if (Math.abs(previousCameraX - camera.position.x) > 0.001 || Math.abs(previousOffset - currentOffset) > 0.001) {
    needsRender = true
  }

  // Visual feedback during drag
  if (isDraggingActive) {
    applyDragVisualFeedback(true)
    needsRender = true
  }

  // Auto-rotate with direction reversal every 3 rounds
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && !isDraggingActive && !momentumAnimationId) {
    const activeAvatar = avatars[currentIndex.value]
    if (activeAvatar && activeAvatar.userData.model) {
      const previousRotation = activeAvatar.userData.model.rotation.y
      activeAvatar.userData.model.rotation.y += ROTATION_SPEED * rotationDirection
      needsRender = true
      
      // Count full rotations (in either direction)
      const currentFullRotations = Math.floor(Math.abs(activeAvatar.userData.model.rotation.y) / (Math.PI * 2))
      const previousFullRotations = Math.floor(Math.abs(previousRotation) / (Math.PI * 2))
      
      if (currentFullRotations > previousFullRotations) {
        rotationCount++
        console.log(`🔄 Rotation count: ${rotationCount} / ${ROTATIONS_BEFORE_REVERSE}`)
        
        if (rotationCount >= ROTATIONS_BEFORE_REVERSE) {
          rotationCount = 0
          rotationDirection *= -1 // Reverse direction
          console.log(`↔️ Reversing rotation direction: ${rotationDirection === 1 ? 'forward' : 'reverse'}`)
        }
      }
    }
  }

  // Only render if something changed
  if (needsRender) {
    renderer.render(scene, camera)
    needsRender = false
  }
}

// ============================================
// PARALLAX FUNCTIONS
// ============================================

const handleParallaxMouseMove = (event) => {
  if (!PARALLAX_CONFIG.enabled || isTouchDevice()) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  targetMouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1
  targetMouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  isParallaxActive.value = true
}

const handleParallaxMouseLeave = () => {
  targetMouseX = 0
  targetMouseY = 0
  isParallaxActive.value = false
}

const applyParallaxToCamera = () => {
  if (!camera) return
  
  const rotationX = mouseY * PARALLAX_CONFIG.maxRotation
  const rotationY = mouseX * PARALLAX_CONFIG.maxRotation
  
  camera.rotation.x = baseCameraRotation.x + Math.max(-PARALLAX_CONFIG.maxRotation, Math.min(PARALLAX_CONFIG.maxRotation, rotationX))
  camera.rotation.y = baseCameraRotation.y + Math.max(-PARALLAX_CONFIG.maxRotation, Math.min(PARALLAX_CONFIG.maxRotation, rotationY))
  
  const offsetX = mouseX * PARALLAX_CONFIG.maxPositionOffset
  const offsetY = mouseY * PARALLAX_CONFIG.maxPositionOffset
  
  camera.position.y = baseCameraPosition.y + Math.max(-PARALLAX_CONFIG.maxPositionOffset, Math.min(PARALLAX_CONFIG.maxPositionOffset, offsetY))
  camera.position.z = baseCameraPosition.z + Math.max(-PARALLAX_CONFIG.maxPositionOffset * 0.5, Math.min(PARALLAX_CONFIG.maxPositionOffset * 0.5, -offsetX))
}

const resetCameraParallax = () => {
  if (!camera) return
  
  camera.rotation.x += (baseCameraRotation.x - camera.rotation.x) * 0.05
  camera.rotation.y += (baseCameraRotation.y - camera.rotation.y) * 0.05
  camera.position.y += (baseCameraPosition.y - camera.position.y) * 0.05
  camera.position.z += (baseCameraPosition.z - camera.position.z) * 0.05
}

// ============================================
// EASING FUNCTIONS
// ============================================

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)
const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4)
const easeOutElastic = (t) => {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// ============================================
// MOMENTUM PHYSICS (Abbreviated - same as original)
// ============================================

const calculateVelocity = (distance, time) => {
  if (time === 0) return 0
  const vel = distance / time
  return Math.max(-MOMENTUM_CONFIG.maxVelocity, Math.min(MOMENTUM_CONFIG.maxVelocity, vel))
}

const applyRubberBandResistance = (offset, min, max) => {
  if (!RUBBERBAND_CONFIG.enabled) {
    return Math.max(min, Math.min(max, offset))
  }
  
  if (offset < min) {
    const overscroll = min - offset
    const resistance = Math.min(overscroll, RUBBERBAND_CONFIG.maxOverscroll)
    return min - (resistance * RUBBERBAND_CONFIG.resistance)
  } else if (offset > max) {
    const overscroll = offset - max
    const resistance = Math.min(overscroll, RUBBERBAND_CONFIG.maxOverscroll)
    return max + (resistance * RUBBERBAND_CONFIG.resistance)
  }
  
  return offset
}

const isOutsideBounds = (offset, min, max) => {
  return offset < min || offset > max
}

const findNearestAvatarIndex = (offset) => {
  let nearest = 0
  let minDistance = Infinity
  
  avatars.forEach((_, index) => {
    const avatarX = index * AVATAR_SPACING
    const distance = Math.abs(avatarX + offset)
    if (distance < minDistance) {
      minDistance = distance
      nearest = index
    }
  })
  
  return nearest
}

const snapToNearestAvatar = () => {
  const nearestIndex = findNearestAvatarIndex(currentOffset)
  const targetX = nearestIndex * AVATAR_SPACING
  const distance = Math.abs(targetX + currentOffset)
  const duration = Math.max(100, Math.min(300, distance * 50))
  
  animateToOffset(-targetX, duration, easeOutQuart, () => {
    currentIndex.value = nearestIndex
    emit('avatar-change', nearestIndex)
    triggerHapticFeedback('snap')
    removeWillChange()
    
    // Update loaded avatars after snap
    updateLoadedAvatars()
  })
}

const snapBackToBounds = () => {
  const min = -((avatars.length - 1) * AVATAR_SPACING)
  const max = 0
  
  let target = currentOffset
  if (currentOffset < min) {
    target = min
  } else if (currentOffset > max) {
    target = max
  }
  
  animateToOffset(target, RUBBERBAND_CONFIG.bounceBackDuration, easeOutElastic, () => {
    snapToNearestAvatar()
  })
}

const animateToOffset = (target, duration, easingFn, onComplete) => {
  const start = currentOffset
  const distance = target - start
  const startTime = performance.now()
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const easedProgress = easingFn(progress)
    
    targetOffset = start + (distance * easedProgress)
    needsRender = true
    
    if (progress < 1) {
      momentumAnimationId = requestAnimationFrame(animate)
    } else {
      momentumAnimationId = null
      if (onComplete) onComplete()
    }
  }
  
  momentumAnimationId = requestAnimationFrame(animate)
}

const triggerHapticFeedback = (type) => {
  if (!HAPTIC_CONFIG.enabled || !supportsVibration()) return
  
  try {
    if (type === 'snap') {
      navigator.vibrate(HAPTIC_CONFIG.snapPattern)
    } else if (type === 'edge') {
      navigator.vibrate(HAPTIC_CONFIG.edgePattern)
    }
  } catch (error) {
    console.warn('[Haptic] Failed:', error)
  }
}

const addWillChange = () => {
  if (canvasRef.value) {
    willChangeManager.add(canvasRef.value, 'transform')
  }
}

const removeWillChange = () => {
  if (canvasRef.value) {
    willChangeManager.remove(canvasRef.value)
  }
}

const applyDragVisualFeedback = (isDragging) => {
  avatars.forEach((avatarGroup, index) => {
    if (!avatarGroup) return
    
    const isActive = index === currentIndex.value
    let targetScale
    
    if (isDragging) {
      targetScale = isActive ? VISUAL_FEEDBACK.dragScaleActive : VISUAL_FEEDBACK.dragScaleInactive
    } else {
      targetScale = isActive ? ACTIVE_SCALE : INACTIVE_SCALE
    }
    
    avatarGroup.scale.setScalar(targetScale * avatarGroup.userData.baseScale)
    needsRender = true
  })
}

// ============================================
// INTERACTION HANDLERS
// ============================================

const handleMouseDown = (event) => {
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  isDragging.value = true
  isDraggingActive = true
  hasMovedSignificantly = false
  lastX = event.clientX
  dragStartTime = performance.now()
  lastDragX = event.clientX
  lastDragTime = dragStartTime
  velocity = 0
  
  addWillChange()
  applyDragVisualFeedback(true)
  needsRender = true
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (event) => {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - lastX
  if (Math.abs(deltaX) > MOMENTUM_CONFIG.tapDistanceThreshold) {
    hasMovedSignificantly = true
  }
  
  const now = performance.now()
  const timeDelta = now - lastDragTime
  if (timeDelta > 0) {
    velocity = calculateVelocity(event.clientX - lastDragX, timeDelta)
    lastDragX = event.clientX
    lastDragTime = now
  }
  
  const scaleFactor = 0.005
  targetOffset += deltaX * scaleFactor
  
  const min = -((avatars.length - 1) * AVATAR_SPACING)
  const max = 0
  targetOffset = applyRubberBandResistance(targetOffset, min, max)
  
  if (isOutsideBounds(targetOffset, min, max)) {
    triggerHapticFeedback('edge')
  }
  
  lastX = event.clientX
  needsRender = true
}

const handleMouseUp = (event) => {
  isDragging.value = false
  isDraggingActive = false
  
  applyDragVisualFeedback(false)
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  
  const totalTime = performance.now() - dragStartTime
  const totalDistance = event.clientX - (lastX + (event.clientX - lastX))
  
  if (!hasMovedSignificantly && totalTime < MOMENTUM_CONFIG.tapTimeThreshold) {
    removeWillChange()
    return
  }
  
  const min = -((avatars.length - 1) * AVATAR_SPACING)
  const max = 0
  
  if (isOutsideBounds(currentOffset, min, max)) {
    snapBackToBounds()
    return
  }
  
  if (MOMENTUM_CONFIG.enabled && Math.abs(velocity) > MOMENTUM_CONFIG.velocityThreshold) {
    applyMomentumScroll(velocity)
  } else {
    snapToNearestAvatar()
  }
}

const applyMomentumScroll = (initialVelocity) => {
  const startOffset = targetOffset
  const startTime = performance.now()
  const duration = MOMENTUM_CONFIG.duration.max
  
  const animate = (currentTime) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    
    const currentVelocity = initialVelocity * Math.pow(MOMENTUM_CONFIG.decelerationRate, elapsed / 16)
    
    if (Math.abs(currentVelocity) < MOMENTUM_CONFIG.minVelocity || progress >= 1) {
      momentumAnimationId = null
      snapToNearestAvatar()
      return
    }
    
    targetOffset += currentVelocity * 0.01
    
    const min = -((avatars.length - 1) * AVATAR_SPACING)
    const max = 0
    
    if (isOutsideBounds(targetOffset, min, max)) {
      momentumAnimationId = null
      snapBackToBounds()
      return
    }
    
    needsRender = true
    momentumAnimationId = requestAnimationFrame(animate)
  }
  
  momentumAnimationId = requestAnimationFrame(animate)
}

// Touch handlers (similar to mouse)
const handleTouchStart = (event) => {
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  const touch = event.touches[0]
  touchStartX = touch.clientX
  touchStartY = touch.clientY
  
  isDragging.value = true
  isDraggingActive = true
  hasMovedSignificantly = false
  lastX = touch.clientX
  dragStartTime = performance.now()
  lastDragX = touch.clientX
  lastDragTime = dragStartTime
  velocity = 0
  
  addWillChange()
  applyDragVisualFeedback(true)
  needsRender = true
  
  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (event) => {
  if (!isDragging.value) return
  
  const touch = event.touches[0]
  const deltaX = touch.clientX - lastX
  const deltaY = touch.clientY - touchStartY
  
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    event.preventDefault()
  } else {
    return
  }
  
  if (Math.abs(deltaX) > MOMENTUM_CONFIG.tapDistanceThreshold) {
    hasMovedSignificantly = true
  }
  
  const now = performance.now()
  const timeDelta = now - lastDragTime
  if (timeDelta > 0) {
    velocity = calculateVelocity(touch.clientX - lastDragX, timeDelta)
    lastDragX = touch.clientX
    lastDragTime = now
  }
  
  const scaleFactor = 0.005
  targetOffset += deltaX * scaleFactor
  
  const min = -((avatars.length - 1) * AVATAR_SPACING)
  const max = 0
  targetOffset = applyRubberBandResistance(targetOffset, min, max)
  
  if (isOutsideBounds(targetOffset, min, max)) {
    triggerHapticFeedback('edge')
  }
  
  lastX = touch.clientX
  needsRender = true
}

const handleTouchEnd = (event) => {
  isDragging.value = false
  isDraggingActive = false
  
  applyDragVisualFeedback(false)
  
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  
  const totalTime = performance.now() - dragStartTime
  
  if (!hasMovedSignificantly && totalTime < MOMENTUM_CONFIG.tapTimeThreshold) {
    removeWillChange()
    return
  }
  
  const min = -((avatars.length - 1) * AVATAR_SPACING)
  const max = 0
  
  if (isOutsideBounds(currentOffset, min, max)) {
    snapBackToBounds()
    return
  }
  
  if (MOMENTUM_CONFIG.enabled && Math.abs(velocity) > MOMENTUM_CONFIG.velocityThreshold) {
    applyMomentumScroll(velocity)
  } else {
    snapToNearestAvatar()
  }
}

const handleWheel = (event) => {
  event.preventDefault()
  
  if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
    return
  }
  
  const delta = event.deltaX * 0.001
  targetOffset -= delta
  
  const min = -((avatars.length - 1) * AVATAR_SPACING)
  const max = 0
  targetOffset = Math.max(min, Math.min(max, targetOffset))
  
  needsRender = true
}

const handleKeyDown = (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    navigatePrevious()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    navigateNext()
  }
}

// ============================================
// NAVIGATION FUNCTIONS
// ============================================

const navigateNext = () => {
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  if (currentIndex.value < props.avatarUrls.length - 1) {
    currentIndex.value++
    const targetX = currentIndex.value * AVATAR_SPACING
    animateToOffset(-targetX, 300, easeOutQuart, () => {
      emit('avatar-change', currentIndex.value)
      triggerHapticFeedback('snap')
      updateLoadedAvatars()
    })
  }
}

const navigatePrevious = () => {
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  if (currentIndex.value > 0) {
    currentIndex.value--
    const targetX = currentIndex.value * AVATAR_SPACING
    animateToOffset(-targetX, 300, easeOutQuart, () => {
      emit('avatar-change', currentIndex.value)
      triggerHapticFeedback('snap')
      updateLoadedAvatars()
    })
  }
}

const jumpToAvatar = (index) => {
  if (index < 0 || index >= props.avatarUrls.length) return
  
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }
  
  currentIndex.value = index
  const targetX = index * AVATAR_SPACING
  const distance = Math.abs(targetX + currentOffset)
  const duration = Math.max(100, Math.min(300, distance * 50))
  
  animateToOffset(-targetX, duration, easeOutQuart, () => {
    emit('avatar-change', index)
    triggerHapticFeedback('snap')
    updateLoadedAvatars()
  })
}

const snapToAvatar = jumpToAvatar

// ============================================
// RESPONSIVE HANDLING
// ============================================

const handleResize = () => {
  clearTimeout(resizeTimeout)
  
  resizeTimeout = setTimeout(() => {
    if (!canvasRef.value || !camera || !renderer) return
    
    const width = canvasRef.value.clientWidth
    const height = canvasRef.value.clientHeight
    
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    
    renderer.setSize(width, height)
    renderer.setPixelRatio(settings.pixelRatio)
    needsRender = true
  }, 150)
}

// ============================================
// CLEANUP
// ============================================

const retryLoad = () => {
  hasError.value = false
  cleanupThreeJS()
  initThreeJS()
  loadAvatars()
}

const cleanupThreeJS = () => {
  // Cancel animation
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  if (momentumAnimationId) {
    cancelAnimationFrame(momentumAnimationId)
    momentumAnimationId = null
  }

  // Dispose all avatars
  avatars.forEach((avatarGroup, index) => {
    if (avatarGroup) {
      avatarGroup.traverse((child) => {
        if (child.isMesh) {
          if (child.geometry) child.geometry.dispose()
          
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => disposeMaterial(mat))
            } else {
              disposeMaterial(child.material)
            }
          }
        }
      })
      scene.remove(avatarGroup)
    }
  })
  avatars = []
  loadedAvatars.clear()

  // Dispose renderer
  if (renderer) {
    renderer.dispose()
    renderer = null
  }

  // Clear scene
  if (scene) {
    scene.clear()
    scene = null
  }

  camera = null
  
  // Remove will-change
  removeWillChange()
}

// ============================================
// LIFECYCLE
// ============================================

onMounted(async () => {
  if (isTouchDevice()) {
    PARALLAX_CONFIG.enabled = false
  }
  
  await initThreeJS()
  await loadAvatars()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
  cleanupThreeJS()
})

watch(currentIndex, () => {
  updateAvatarStates()
  // Load/unload avatars based on new index
  updateLoadedAvatars()
})
</script>

<style scoped>
/* Same styles as original */
.avatar-carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  min-height: 400px;
  overflow: hidden;
  border-radius: 1rem;
}

@media (min-width: 768px) {
  .avatar-carousel-container {
    height: 500px;
    min-height: 500px;
  }
}

.avatar-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
  outline: none;
  touch-action: pan-y;
}

.avatar-canvas:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

.avatar-canvas.is-dragging {
  cursor: grabbing;
}

.avatar-canvas:not(.is-dragging) {
  will-change: auto;
}

.avatar-canvas.has-parallax {
  /* Managed by willChangeManager */
}

.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: hsl(var(--background));
  backdrop-filter: blur(4px);
  z-index: 10;
}

.loading-text {
  font-size: 1rem;
  color: hsl(var(--muted-foreground));
  font-weight: 500;
}

.error-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  background: hsl(var(--background) / 0.95);
  backdrop-filter: blur(4px);
  z-index: 10;
}

.error-text {
  font-size: 1.125rem;
  color: hsl(var(--destructive));
  font-weight: 600;
}

.retry-button {
  padding: 0.75rem 1.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: hsl(var(--primary) / 0.9);
  transform: translateY(-2px);
}

.retry-button:active {
  transform: scale(0.98);
}

@media (prefers-reduced-motion: reduce) {
  .avatar-canvas,
  .retry-button {
    transition: none !important;
    animation: none !important;
  }
}

@media (prefers-contrast: high) {
  .avatar-canvas:focus {
    outline: 3px solid currentColor;
  }
}
</style>

