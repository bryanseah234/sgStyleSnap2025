<template>
  <!-- Confirmation Popup -->
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleBackdropClick">
    <div :class="`relative w-full max-w-md rounded-xl p-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`" @click.stop>
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        :class="`absolute top-4 right-4 z-10 p-2 rounded-lg transition-all ${
          theme === 'dark'
            ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white'
            : 'bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-black'
        }`"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-4 pr-12">
        <div v-if="type === 'error'" class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
          <X class="w-5 h-5 text-white" />
        </div>
        <div v-else-if="type === 'success'" class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
          <Check class="w-5 h-5 text-white" />
        </div>
        <div v-else-if="type === 'warning'" class="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
          <AlertTriangle class="w-5 h-5 text-white" />
        </div>
        <div v-else class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Info class="w-5 h-5 text-white" />
        </div>
        <h3 :class="`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`">
          {{ title }}
        </h3>
      </div>

      <!-- Message -->
      <p :class="`text-sm mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
        {{ message }}
      </p>

      <!-- Image (if provided) -->
      <div v-if="imageUrl" class="mb-6">
        <p :class="`text-xs mb-2 text-center ${theme === 'dark' ? 'text-zinc-500' : 'text-stone-500'}`">
          Processed image (background removed):
        </p>
        <div class="flex justify-center">
          <div :class="`relative rounded-lg overflow-hidden border-2 ${theme === 'dark' ? 'border-zinc-700' : 'border-stone-200'}`">
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
      <div class="flex gap-2 justify-end">
        <button 
          v-if="showCancel"
          @click="handleCancel" 
          :class="`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          :class="`px-4 py-2 rounded-lg font-medium ${getConfirmButtonClass()}`"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
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
      return 'bg-red-500 text-white hover:bg-red-600'
    case 'success':
      return 'bg-green-500 text-white hover:bg-green-600'
    case 'warning':
      return 'bg-yellow-500 text-white hover:bg-yellow-600'
    default:
      return 'bg-black text-white hover:bg-stone-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100'
  }
}
</script>
