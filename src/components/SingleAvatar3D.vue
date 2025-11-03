<!--
  SingleAvatar3D - Single 3D Avatar Display Component
  
  Displays a single Three.js avatar model with auto-rotation and interaction.
  No controls, just the avatar.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="single-avatar-container" ref="containerRef" style="width: 100%; height: 100%;">
    <!-- Loading State -->
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <div class="spinner-modern"></div>
    </div>

    <!-- 3D Canvas -->
    <canvas 
      ref="canvasRef" 
      class="avatar-canvas w-full h-full"
      @click="handleClick"
      @mouseenter="isHovering = true"
      @mouseleave="isHovering = false"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

// Dynamic Three.js import for code splitting
let THREE = null
let GLTFLoader = null

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

// Props
const props = defineProps({
  avatarUrl: {
    type: String,
    required: true
  }
})

// Refs
const containerRef = ref(null)
const canvasRef = ref(null)
const isLoading = ref(true)
const isHovering = ref(false)

// Three.js variables
let scene, camera, renderer, loader, avatar = null
let animationFrameId = null
let autoRotateSpeed = 0.005

// Animation state
let isAnimating = false
let isRotationPaused = false
let animationStartTime = 0
let animationDuration = 2000 // 2 seconds
let currentAnimationType = null
let originalBoneStates = null
const ANIMATION_TYPES = ['wave', 'jump', 'nod', 'tpose', 'bounce']
let currentAnimationIndex = 0

// Initialize Three.js scene
const initThreeJS = async () => {
  if (!canvasRef.value) return
  
  await loadThreeJS()

  // Scene
  scene = new THREE.Scene()
  scene.background = null

  // Camera - 90 degrees straight on, no tilt
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 0, 3) // y=0 for no vertical tilt
  camera.lookAt(0, 0, 0) // Look straight at center

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  })
  renderer.setSize(canvasRef.value.clientWidth, canvasRef.value.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace

  // Lighting - Brighter setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2) // Increased from 0.7 to 1.2
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.5) // Increased from 1.0 to 1.5
  mainLight.position.set(2, 3, 4)
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.8) // Increased from 0.5 to 0.8
  fillLight.position.set(-3, 1, 2)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6) // Increased from 0.3 to 0.6
  rimLight.position.set(0, 1, -3)
  scene.add(rimLight)

  // Additional front light for more brightness
  const frontLight = new THREE.DirectionalLight(0xffffff, 0.7)
  frontLight.position.set(0, 0, 5)
  scene.add(frontLight)

  // GLTF Loader
  loader = new GLTFLoader()
  
  // Load avatar
  await loadAvatar()
}

// Load avatar model
const loadAvatar = async () => {
  if (!loader || !props.avatarUrl) return
  
  isLoading.value = true
  
  try {
    const gltf = await new Promise((resolve, reject) => {
      loader.load(
        props.avatarUrl,
        resolve,
        undefined,
        reject
      )
    })
    
    const avatarModel = gltf.scene
    
    // Scale and center avatar
    const box = new THREE.Box3().setFromObject(avatarModel)
    const size = box.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 1.8 / maxDim
    avatarModel.scale.setScalar(scale)
    
    const center = box.getCenter(new THREE.Vector3())
    avatarModel.position.sub(center.multiplyScalar(scale))
    
    // Create container group
    const avatarGroup = new THREE.Group()
    avatarGroup.add(avatarModel)
    avatarGroup.position.set(0, 0, 0)
    
    // Store model reference for animations
    avatarGroup.userData = {
      model: avatarModel
    }
    
    scene.add(avatarGroup)
    avatar = avatarGroup
    
    // Save original bone states
    originalBoneStates = saveOriginalBoneStates(avatarModel)
    
    isLoading.value = false
    startAnimationLoop()
  } catch (error) {
    console.error('Failed to load avatar:', error)
    isLoading.value = false
  }
}

// Bone finding functions
const findBones = (model) => {
  const bones = {
    leftArm: null,
    rightArm: null,
    leftHand: null,
    rightHand: null,
    head: null,
    spine: null,
    hips: null,
    leftLeg: null,
    rightLeg: null,
  }
  
  model.traverse((child) => {
    if (child.isBone || child.type === 'Bone') {
      const name = child.name.toLowerCase()
      
      if (name.includes('left') && (name.includes('arm') || name.includes('shoulder') || name.includes('upper'))) {
        bones.leftArm = child
      }
      if (name.includes('right') && (name.includes('arm') || name.includes('shoulder') || name.includes('upper'))) {
        bones.rightArm = child
      }
      if (name.includes('left') && name.includes('hand')) {
        bones.leftHand = child
      }
      if (name.includes('right') && name.includes('hand')) {
        bones.rightHand = child
      }
      if (name.includes('head') || name.includes('neck')) {
        bones.head = child
      }
      if (name.includes('spine') || name.includes('chest')) {
        bones.spine = child
      }
      if (name.includes('hips') || name.includes('pelvis')) {
        bones.hips = child
      }
      if (name.includes('left') && (name.includes('leg') || name.includes('thigh'))) {
        bones.leftLeg = child
      }
      if (name.includes('right') && (name.includes('leg') || name.includes('thigh'))) {
        bones.rightLeg = child
      }
    }
  })
  
  return bones
}

// Save original bone states
const saveOriginalBoneStates = (model) => {
  const states = new Map()
  model.traverse((child) => {
    if (child.isBone || child.type === 'Bone') {
      states.set(child, {
        position: child.position.clone(),
        rotation: child.rotation.clone(),
        quaternion: child.quaternion.clone(),
      })
    }
  })
  return states
}

// Restore original bone states
const restoreOriginalBoneStates = (model, states) => {
  model.traverse((child) => {
    if (states.has(child)) {
      const original = states.get(child)
      child.position.copy(original.position)
      child.rotation.copy(original.rotation)
      child.quaternion.copy(original.quaternion)
    }
  })
}

// Animation functions
const animateWave = (model, progress) => {
  const bones = findBones(model)
  if (bones.rightArm) {
    const waveAngle = Math.sin(progress * Math.PI * 4) * 0.3
    const liftAngle = Math.sin(progress * Math.PI) * 1.0
    bones.rightArm.rotation.z = -liftAngle - 0.5
    bones.rightArm.rotation.x = waveAngle
  }
  if (bones.rightHand) {
    const handWave = Math.sin(progress * Math.PI * 4) * 0.5
    bones.rightHand.rotation.z = handWave
  }
}

const animateJump = (model, progress) => {
  const jumpHeight = Math.sin(progress * Math.PI) * 0.5
  model.position.y = jumpHeight
  const crouchAmount = Math.cos(progress * Math.PI * 2) * 0.1
  model.scale.y = 1 + crouchAmount
  model.scale.x = 1 - crouchAmount * 0.5
  model.scale.z = 1 - crouchAmount * 0.5
  const bones = findBones(model)
  if (bones.leftLeg) {
    bones.leftLeg.rotation.x = Math.max(0, -crouchAmount * 2)
  }
  if (bones.rightLeg) {
    bones.rightLeg.rotation.x = Math.max(0, -crouchAmount * 2)
  }
}

const animateNod = (model, progress) => {
  const bones = findBones(model)
  if (bones.head) {
    const nodAngle = Math.sin(progress * Math.PI * 6) * 0.3
    bones.head.rotation.x = nodAngle
  }
}

const animateTPose = (model, progress) => {
  const bones = findBones(model)
  const easeProgress = progress < 0.3 ? progress / 0.3 : 
                       progress > 0.7 ? (1 - progress) / 0.3 : 1
  if (bones.leftArm) {
    bones.leftArm.rotation.z = easeProgress * Math.PI / 2
  }
  if (bones.rightArm) {
    bones.rightArm.rotation.z = -easeProgress * Math.PI / 2
  }
}

const animateBounce = (model, progress) => {
  const bones = findBones(model)
  const breathe = Math.sin(progress * Math.PI * 4) * 0.02
  if (bones.spine) {
    bones.spine.scale.y = 1 + breathe
  }
  const sway = Math.sin(progress * Math.PI * 2) * 0.1
  model.rotation.z = sway * 0.05
  const bounce = Math.sin(progress * Math.PI * 4) * 0.05
  model.position.y = bounce
}

// Execute animation
const executeAnimation = (model, animationType, progress) => {
  switch (animationType) {
    case 'wave':
      animateWave(model, progress)
      break
    case 'jump':
      animateJump(model, progress)
      break
    case 'nod':
      animateNod(model, progress)
      break
    case 'tpose':
      animateTPose(model, progress)
      break
    case 'bounce':
      animateBounce(model, progress)
      break
  }
}

// Animation loop
const startAnimationLoop = () => {
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    
    if (avatar && avatar.userData.model) {
      const model = avatar.userData.model
      const currentTime = performance.now()
      
      // Handle avatar animations
      if (isAnimating && currentAnimationType) {
        const elapsed = currentTime - animationStartTime
        const progress = Math.min(elapsed / animationDuration, 1)
        
        executeAnimation(model, currentAnimationType, progress)
        
        // Animation finished
        if (progress >= 1) {
          stopAnimation()
        }
      }
      
      // Auto-rotate (only if not paused)
      if (!isRotationPaused) {
        avatar.rotation.y += autoRotateSpeed
        
        // Faster rotation on hover
        if (isHovering.value) {
          avatar.rotation.y += autoRotateSpeed * 2
        }
      }
    }
    
    renderer.render(scene, camera)
  }
  
  animate()
}

// Stop animation and restore state
const stopAnimation = () => {
  if (!avatar || !avatar.userData.model) return
  
  const model = avatar.userData.model
  
  // Restore original bone states
  if (originalBoneStates) {
    restoreOriginalBoneStates(model, originalBoneStates)
  }
  
  // Reset model transforms
  model.position.y = 0
  model.rotation.z = 0
  model.scale.set(1, 1, 1)
  
  // Reset animation state
  isAnimating = false
  currentAnimationType = null
  
  // Resume rotation after 3 seconds
  setTimeout(() => {
    isRotationPaused = false
  }, 3000)
}

// Handle click - face front and play animation
const handleClick = () => {
  if (!avatar || !avatar.userData.model || isAnimating) return
  
  const model = avatar.userData.model
  
  // Stop rotation and face front
  isRotationPaused = true
  avatar.rotation.y = 0 // Face front (90 degrees - no tilt)
  
  // Select and start animation
  currentAnimationType = ANIMATION_TYPES[currentAnimationIndex]
  currentAnimationIndex = (currentAnimationIndex + 1) % ANIMATION_TYPES.length
  
  isAnimating = true
  animationStartTime = performance.now()
  
  console.log(`🎭 Avatar action: ${currentAnimationType}`)
}

// Handle resize
const handleResize = () => {
  if (!canvasRef.value || !camera || !renderer) return
  
  const width = canvasRef.value.clientWidth
  const height = canvasRef.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// Cleanup
const cleanup = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  
  if (avatar) {
    avatar.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => mat.dispose())
        } else {
          child.material?.dispose()
        }
      }
    })
    scene.remove(avatar)
    avatar = null
  }
  
  if (renderer) {
    renderer.dispose()
  }
}

// Watch for avatar URL changes
watch(() => props.avatarUrl, async (newUrl) => {
  if (newUrl && loader) {
    cleanup()
    await loadAvatar()
  }
})

onMounted(() => {
  initThreeJS()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  cleanup()
})
</script>

<style scoped>
.single-avatar-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.avatar-canvas {
  cursor: pointer;
  outline: none;
  width: 100%;
  height: 100%;
}

.avatar-canvas:hover {
  filter: brightness(1.1);
}

.spinner-modern {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

