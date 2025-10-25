<template>
  <!-- Confirmation Popup -->
  <div v-if="show" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="handleBackdropClick">
    <div :class="`w-full max-w-md rounded-xl p-6 ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`" @click.stop>
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        :class="`absolute top-4 right-4 p-2 rounded-lg transition-all ${
          theme === 'dark'
            ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
            : 'hover:bg-stone-100 text-stone-500 hover:text-black'
        }`"
      >
        <X class="w-5 h-5" />
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-4 pr-8">
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
      <p :class="`text-sm mb-6 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
        {{ message }}
      </p>

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

const getConfirmButtonClass = () => {
  switch (props.type) {
    case 'error':
      return 'bg-red-500 text-white hover:bg-red-600'
    case 'success':
      return 'bg-green-500 text-white hover:bg-green-600'
    case 'warning':
      return 'bg-yellow-500 text-white hover:bg-yellow-600'
    default:
      return theme.value === 'dark' 
        ? 'bg-white text-black hover:bg-zinc-100' 
        : 'bg-black text-white hover:bg-stone-900'
  }
}
</script>
