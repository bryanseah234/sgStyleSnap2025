<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1200] p-4 backdrop-blur-sm overflow-y-auto overflow-x-hidden"
    @click="$emit('close')"
  >
    <div
      class="w-full max-w-4xl rounded-2xl p-6 relative bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 shadow-2xl md:max-h-[90vh] max-h-[calc(100vh-9rem)] mb-20 md:mb-4 overflow-hidden flex flex-col"
      @click.stop
      style="overflow-x: hidden; max-width: 100%;"
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
      </div>

      <!-- Loading State -->
      <div v-if="generating" class="flex flex-col items-center justify-center py-16">
        <div class="spinner-modern mb-6"></div>
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
      <div v-else-if="generatedImageUrl" class="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden min-h-0 max-w-full">
        <!-- Left: Image -->
        <div class="flex-[1.2] md:flex-[1.2] flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 min-w-0 max-w-full">
          <img
            :src="generatedImageUrl"
            alt="Virtual try-on result"
            class="w-full h-full object-contain rounded-xl"
          />
        </div>

        <!-- Right: Content -->
        <div class="flex-shrink-0 flex flex-col gap-3 min-h-0 w-full md:w-[280px] max-w-full overflow-y-auto overflow-x-hidden">
          <!-- Image Info -->
          <div class="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 flex-shrink-0 min-w-0">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div class="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <Check class="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-medium text-purple-900 dark:text-purple-100 truncate">
                  Virtual try-on generated successfully!
                </p>
                <p class="text-xs text-purple-700 dark:text-purple-300 truncate">
                  Powered by Gemini
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col gap-3 flex-shrink-0 min-w-0 pb-2 md:pb-2">
            <button
              @click="downloadImage"
              class="w-full px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 bg-purple-500 text-white hover:bg-purple-600"
            >
              <Download class="w-5 h-5 flex-shrink-0" />
              <span class="truncate">Download Image</span>
            </button>
            <button
              @click="$emit('close')"
              class="w-full px-6 py-3 rounded-2xl font-medium transition-all duration-200 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
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

<style scoped>
/* Ensure buttons maintain rounded corners on hover - prevent clipping from parent overflow */
.scrollable-content button {
  position: relative;
  z-index: 1;
}

.scrollable-content button:hover {
  z-index: 2;
}
</style>
