<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      class="w-full max-w-md rounded-xl p-6 relative bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800"
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

      <h3 :class="`text-2xl font-bold mb-4 pr-8 text-black dark:text-white`">
        Share Outfit with {{ getFirstName(friendName) }}
      </h3>

      <div class="space-y-4">
        <div>
          <label :class="`block text-base mb-2 text-stone-700 dark:text-zinc-300`">
            Outfit Name <span class="text-red-500">*</span>
          </label>
          <input
            v-model="outfitName"
            type="text"
            placeholder="e.g., Summer Casual Look"
            maxlength="50"
            class="w-full h-12 px-3 rounded-xl border bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700 text-black dark:text-white placeholder-stone-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
            @input="outfitName = sanitizeText(outfitName)"
            @keydown.enter="handleSave"
            autofocus
          />
          <div class="flex items-center justify-between mt-1">
            <p class="text-sm text-stone-500 dark:text-zinc-400">
              Give this outfit a name to share with your friend
            </p>
            <p :class="`text-sm ${outfitName.length >= 50 ? 'text-red-500' : 'text-stone-400 dark:text-zinc-500'}`">
              {{ outfitName.length }}/50
            </p>
          </div>
        </div>

        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            :class="`flex-1 h-12 rounded-xl font-medium transition-all duration-200 bg-stone-100 text-stone-700 hover:bg-stone-200
              dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700`"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="!outfitName.trim() || saving"
            :class="`flex-1 h-12 rounded-xl font-medium transition-all duration-200 ${
              !outfitName.trim() || saving
                ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                : 'bg-black dark:bg-white text-white dark:text-black hover:bg-stone-900 dark:hover:bg-zinc-100'
            }`"
          >
            {{ saving ? 'Sharing...' : 'Share Outfit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { useSanitize } from '@/composables/useSanitize'
import { getFirstName } from '@/utils'
import { X } from 'lucide-vue-next'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  friendName: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Theme
const { theme } = useTheme()
const { sanitizeText } = useSanitize()

// Desktop detection for ESC hint
const isDesktop = ref(false)

const handleResize = () => {
  isDesktop.value = window.innerWidth >= 1024
}

const handleEsc = (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

// State
const outfitName = ref('')
const saving = ref(false)

// Methods
const handleSave = async () => {
  // Sanitize the outfit name
  const sanitized = sanitizeText(outfitName.value)
  
  // Validate that outfit name is provided
  if (!sanitized.trim() || saving.value) return
  
  saving.value = true
  try {
    await emit('save', sanitized)
    outfitName.value = ''
  } finally {
    saving.value = false
  }
}

// Watch for dialog open/close to reset form
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    outfitName.value = ''
    saving.value = false
  }
})

// Lifecycle hooks
onMounted(() => {
  isDesktop.value = window.innerWidth >= 1024
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleEsc)
})
</script>

