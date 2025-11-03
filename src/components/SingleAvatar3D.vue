<!--
  SingleAvatar3D - Single 3D Avatar Display Component
  
  Displays a single Three.js avatar model with auto-rotation and interaction.
  No controls, just the avatar.
  
  @author StyleSnap Team
  @version 1.0.0
-->
<template>
  <div class="single-avatar-container" ref="containerRef" style="height: 50vh; width: 100%;">
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

// Initialize Three.js scene
const initThreeJS = async () => {
  if (!canvasRef.value) return
  
  await loadThreeJS()

  // Scene
  scene = new THREE.Scene()
  scene.background = null

  // Camera
  const aspect = canvasRef.value.clientWidth / canvasRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
  camera.position.set(0, 0.1, 3)
  camera.lookAt(0, 0, 0)

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

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
  scene.add(ambientLight)

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.0)
  mainLight.position.set(2, 3, 4)
  scene.add(mainLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)
  fillLight.position.set(-3, 1, 2)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.3)
  rimLight.position.set(0, 1, -3)
  scene.add(rimLight)

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
    
    scene.add(avatarGroup)
    avatar = avatarGroup
    
    isLoading.value = false
    startAnimation()
  } catch (error) {
    console.error('Failed to load avatar:', error)
    isLoading.value = false
  }
}

// Animation loop
const startAnimation = () => {
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)
    
    if (avatar) {
      // Auto-rotate
      avatar.rotation.y += autoRotateSpeed
      
      // Faster rotation on hover
      if (isHovering.value) {
        avatar.rotation.y += autoRotateSpeed * 2
      }
    }
    
    renderer.render(scene, camera)
  }
  
  animate()
}

// Handle click - reverse rotation direction
const handleClick = () => {
  if (avatar) {
    autoRotateSpeed = -autoRotateSpeed
  }
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

