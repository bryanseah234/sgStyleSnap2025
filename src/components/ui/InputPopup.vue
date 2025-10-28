<template>
  <!-- Input Popup -->
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
        <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <Edit class="w-5 h-5 text-white" />
        </div>
        <h3 :class="`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-black'}`">
          {{ title }}
        </h3>
      </div>

      <!-- Message -->
      <p v-if="message" :class="`text-sm mb-4 ${theme === 'dark' ? 'text-zinc-400' : 'text-stone-600'}`">
        {{ message }}
      </p>

      <!-- Input Field -->
      <input
        ref="inputRef"
        v-model="inputValue"
        type="text"
        :placeholder="placeholder"
        maxlength="50"
        @keydown.enter="handleConfirm"
        @keydown.esc="$emit('close')"
        :class="`w-full px-4 py-2 rounded-lg border transition-colors ${
          theme === 'dark'
            ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none'
            : 'bg-white border-stone-300 text-black placeholder-stone-400 focus:border-stone-500 focus:outline-none'
        }`"
      />
      
      <!-- Character Counter -->
      <div class="flex justify-end mb-4">
        <p :class="`text-sm ${inputValue.length >= 50 ? 'text-red-500' : theme === 'dark' ? 'text-zinc-500' : 'text-stone-400'}`">
          {{ inputValue.length }}/50
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 justify-end">
        <button 
          @click="handleCancel" 
          :class="`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm" 
          :class="`px-4 py-2 rounded-lg font-medium ${
            theme === 'dark'
              ? 'bg-white text-black hover:bg-zinc-100'
              : 'bg-black text-white hover:bg-stone-900'
          }`"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { X, Edit } from 'lucide-vue-next'

const { theme } = useTheme()

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  defaultValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'OK'
  },
  cancelText: {
    type: String,
    default: 'Cancel'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const inputValue = ref(props.defaultValue)
const inputRef = ref(null)

// Watch for show prop to reset input and focus
watch(() => props.show, (newVal) => {
  if (newVal) {
    inputValue.value = props.defaultValue
    nextTick(() => {
      inputRef.value?.focus()
      inputRef.value?.select()
    })
  }
})

const handleConfirm = () => {
  emit('confirm', inputValue.value)
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
</script>

