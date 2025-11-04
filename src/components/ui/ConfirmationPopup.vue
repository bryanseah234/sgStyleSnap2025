<template>
  <!-- Confirmation Popup -->
  <div v-if="show" class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-[1200] p-4 backdrop-blur-sm" @click="handleBackdropClick">
    <div :class="`relative w-full max-w-md rounded-xl p-6 shadow-2xl border ${
      theme === 'dark' 
        ? 'bg-zinc-900 border-zinc-800' 
        : 'bg-white border-stone-200'
    }`" @click.stop>
      <!-- Close Button -->
      <div class="absolute top-4 right-4 z-50 flex items-center gap-2">
        <!-- ESC Key Hint (Desktop only) -->
        <div v-if="isDesktop" class="keyboard-hint-modal">
          <span class="keyboard-hint-key">ESC</span>
        </div>
        <button
          @click="$emit('close')"
          :class="`p-2 rounded-lg transition-all shadow-lg ${
            theme === 'dark'
              ? 'bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700'
              : 'bg-white/90 hover:bg-stone-200 text-stone-600 hover:text-black border border-stone-300'
          }`"
          aria-label="Close dialog"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-4 pr-12">
        <div v-if="type === 'error'" class="w-10 h-10 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center flex-shrink-0">
          <X class="w-5 h-5 text-white" />
        </div>
        <div v-else-if="type === 'success'" class="w-10 h-10 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center flex-shrink-0">
          <Check class="w-5 h-5 text-white" />
        </div>
        <div v-else-if="type === 'warning'" class="w-10 h-10 rounded-full bg-yellow-500 dark:bg-yellow-600 flex items-center justify-center flex-shrink-0">
          <AlertTriangle class="w-5 h-5 text-white" />
        </div>
        <div v-else class="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Info class="w-5 h-5 text-white" />
        </div>
        <h3 :class="`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`">
          {{ title }}
        </h3>
      </div>

      <!-- Message -->
      <p :class="`text-sm mb-4 leading-relaxed ${theme === 'dark' ? 'text-zinc-300' : 'text-stone-700'}`">
        {{ message }}
      </p>

      <!-- Image (if provided) -->
      <div v-if="imageUrl" class="mb-6">
        <p :class="`text-xs mb-2 text-center ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
          Processed image (background removed):
        </p>
        <div class="flex justify-center">
          <div :class="`relative rounded-lg overflow-hidden border-2 ${
            theme === 'dark' 
              ? 'border-zinc-700 bg-zinc-800/50' 
              : 'border-stone-200 bg-stone-50'
          }`">
            <img
              :src="imageUrl"
              alt="Processed image"
              class="max-w-full max-h-64 object-contain"
              @load="handleImageLoad"
              @error="handleImageError"
            />
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-3 justify-end">
        <button 
          v-if="showCancel"
          @click="handleCancel" 
          :class="`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
            theme === 'dark' 
              ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700' 
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-300'
          }`"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          :class="`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${getConfirmButtonClass()}`"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { X, Check, AlertTriangle, Info } from 'lucide-vue-next'

const { theme } = useTheme()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'info', 'success', 'warning', 'error'
    validator: (value) => ['info', 'success', 'warning', 'error'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  confirmText: {
    type: String,
    default: 'OK'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  showCancel: {
    type: Boolean,
    default: false
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

// Desktop detection
const isDesktop = ref(false)

const handleEsc = (e) => {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
}

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
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

const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

const handleImageLoad = () => {
  // Image loaded successfully
}

const handleImageError = () => {
  // Image failed to load - could show fallback but for now just fail silently
  console.warn('Failed to load image in popup')
}

const getConfirmButtonClass = () => {
  switch (props.type) {
    case 'error':
      return theme.value === 'dark'
        ? 'bg-red-600 text-white hover:bg-red-700 border border-red-700'
        : 'bg-red-500 text-white hover:bg-red-600 border border-red-600'
    case 'success':
      return theme.value === 'dark'
        ? 'bg-green-600 text-white hover:bg-green-700 border border-green-700'
        : 'bg-green-500 text-white hover:bg-green-600 border border-green-600'
    case 'warning':
      return theme.value === 'dark'
        ? 'bg-yellow-600 text-white hover:bg-yellow-700 border border-yellow-700'
        : 'bg-yellow-500 text-white hover:bg-yellow-600 border border-yellow-600'
    default:
      return theme.value === 'dark'
        ? 'bg-white text-black hover:bg-zinc-100 border border-zinc-700'
        : 'bg-black text-white hover:bg-stone-900 border border-stone-900'
  }
}
</script>
