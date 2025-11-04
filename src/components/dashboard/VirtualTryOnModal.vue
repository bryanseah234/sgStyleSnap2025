<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    @click="$emit('close')"
  >
    <div
      class="w-full max-w-4xl rounded-2xl p-6 relative bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      @click.stop
    >
      <!-- Close Button -->
      <div class="absolute top-4 right-4 z-50 flex items-center gap-2">
        <!-- ESC Key Hint (Desktop only) -->
        <div v-if="isDesktop" class="keyboard-hint-modal">
          <span class="keyboard-hint-key">ESC</span>
        </div>
        <button
          @click="$emit('close')"
          class="p-2 rounded-lg transition-all bg-white/90 shadow-lg
                hover:bg-stone-100 text-stone-500 hover:text-black 
                dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-300 dark:hover:text-white"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Header -->
      <div class="mb-4 flex-shrink-0">
        <h3 class="text-2xl font-bold text-black dark:text-white flex items-center gap-3">
          <Sparkles class="w-7 h-7 text-purple-500" />
          Virtual Try On
        </h3>
        <p class="text-sm text-stone-600 dark:text-zinc-400 mt-2">
          using Gemini
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="generating" class="flex flex-col items-center justify-center py-16">
        <div class="spinner-modern mb-6" style="color: rgb(168, 85, 247);"></div>
        <p class="text-lg font-medium text-black dark:text-white mb-2">
          Generating virtual try-on...
        </p>
        <p class="text-sm text-stone-600 dark:text-zinc-400 text-center max-w-md">
          {{ loadingMessage }}
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-16">
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertCircle class="w-8 h-8 text-red-500" />
        </div>
        <p class="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
          Generation Failed
        </p>
        <p class="text-sm text-stone-600 dark:text-zinc-400 text-center max-w-md mb-6">
          {{ error }}
        </p>
        <div class="flex gap-3">
          <button
            @click="$emit('retry')"
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-purple-500 text-white hover:bg-purple-600"
          >
            Try Again
          </button>
          <button
            @click="$emit('close')"
            class="px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>

      <!-- Success State - Show Generated Image -->
      <div v-else-if="generatedImageUrl" class="flex-1 flex gap-4 overflow-hidden min-h-0">
        <!-- Left: Image (50%) -->
        <div class="w-[50%] flex-shrink-0 rounded-xl overflow-hidden bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 flex items-center justify-center p-4">
          <img
            :src="generatedImageUrl"
            alt="Virtual try-on result"
            class="max-w-full max-h-full w-auto h-auto object-contain rounded-xl"
          />
        </div>

        <!-- Right: Content (50%) -->
        <div class="w-[50%] flex-shrink-0 flex flex-col gap-3 overflow-y-auto min-h-0">
          <!-- Image Info -->
          <div class="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <Check class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p class="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Virtual try-on generated successfully!
                </p>
                <p class="text-xs text-purple-700 dark:text-purple-300">
                  Powered by Gemini
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3 flex-shrink-0">
            <button
              @click="downloadImage"
              class="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
            >
              <Download class="w-5 h-5" />
              Download Image
            </button>
            <button
              @click="$emit('close')"
              class="w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Initial State - Before Generation -->
      <div v-else class="flex flex-col items-center justify-center py-16">
        <div class="w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6">
          <Sparkles class="w-10 h-10 text-purple-500" />
        </div>
        <p class="text-lg font-medium text-black dark:text-white mb-2">
          Ready to Generate
        </p>
        <p class="text-sm text-stone-600 dark:text-zinc-400 text-center max-w-md">
          Click generate to see your outfit on an AI model person
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X, Sparkles, Check, Download, AlertCircle } from 'lucide-vue-next'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  generating: {
    type: Boolean,
    default: false
  },
  generatedImageUrl: {
    type: String,
    default: null
  },
  error: {
    type: String,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'retry'])

// State
const loadingMessage = ref('Preparing outfit images...')
const isDesktop = ref(false)

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

const handleEsc = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

onMounted(() => {
  isDesktop.value = window.innerWidth >= 1024
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEsc)
})

// Loading messages to cycle through
const loadingMessages = [
  'Preparing outfit images...',
  'Analyzing clothing items...',
  'Compositing outfit...',
  'Calling AI model...',
  'Generating virtual try-on...',
  'Almost there...'
]

let messageInterval = null

// Watch for generating state changes
watch(() => props.generating, (isGenerating) => {
  if (isGenerating) {
    let currentMessageIndex = 0
    
    // Cycle through loading messages
    messageInterval = setInterval(() => {
      currentMessageIndex = (currentMessageIndex + 1) % loadingMessages.length
      loadingMessage.value = loadingMessages[currentMessageIndex]
    }, 2500)
  } else {
    // Stop message cycling
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }
})

// Download generated image
const downloadImage = () => {
  if (!props.generatedImageUrl) return
  
  const link = document.createElement('a')
  link.href = props.generatedImageUrl
  link.download = `virtual-tryon-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Cleanup on unmount
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    // Reset state when modal closes
    loadingMessage.value = loadingMessages[0]
    
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }
})
</script>


