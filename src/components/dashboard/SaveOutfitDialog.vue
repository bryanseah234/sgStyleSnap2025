<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div
      :class="`w-full max-w-md rounded-xl p-6 ${
        theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
      }`"
      @click.stop
    >
      <h3 :class="`text-2xl font-bold mb-4 ${
        theme.value === 'dark' ? 'text-white' : 'text-black'
      }`">
        Save Outfit
      </h3>

      <div class="space-y-4">
        <div>
          <label :class="`block text-base mb-2 ${
            theme.value === 'dark' ? 'text-zinc-300' : 'text-stone-700'
          }`">
            Outfit Name
          </label>
          <input
            v-model="outfitName"
            type="text"
            placeholder="e.g., Summer Casual"
            :class="`w-full h-12 px-3 rounded-xl border ${
              theme.value === 'dark'
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-400'
                : 'bg-stone-50 border-stone-200 text-black placeholder-stone-500'
            }`"
            @keydown.enter="handleSave"
          />
        </div>

        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            :class="`flex-1 h-12 rounded-xl font-medium transition-all duration-200 ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`"
          >
            Cancel
          </button>
          <button
            @click="handleSave"
            :disabled="!outfitName.trim() || saving"
            :class="`flex-1 h-12 rounded-xl font-medium transition-all duration-200 ${
              !outfitName.trim() || saving
                ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed'
                : theme.value === 'dark'
                ? 'bg-white text-black hover:bg-zinc-100'
                : 'bg-black text-white hover:bg-stone-900'
            }`"
          >
            {{ saving ? 'Saving...' : 'Save Outfit' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  canvasItems: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'save'])

// Theme
const { theme } = useTheme()

// State
const outfitName = ref('')
const saving = ref(false)

// Methods
const handleSave = async () => {
  if (!outfitName.value.trim() || saving.value) return
  
  saving.value = true
  try {
    await emit('save', outfitName.value)
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
</script>
