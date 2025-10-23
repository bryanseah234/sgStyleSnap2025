<template>
  <!-- Modal Backdrop with Liquid Glass -->
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen"
      class="liquid-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <!-- Modal Card with Fluid Expansion -->
      <Transition name="modal" appear>
        <div
          v-if="isOpen"
          :class="`liquid-modal-card relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden ${
            theme.value === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-stone-200'
          }`"
          @click.stop
        >
          <!-- Close Button with Liquid Press -->
          <button
            @click="closeModal"
            @mousedown="handleClosePress"
            @mouseup="handleCloseRelease"
            @mouseleave="handleCloseRelease"
            :class="`liquid-close-btn absolute top-4 right-4 z-10 p-2 rounded-lg ${
              theme.value === 'dark'
                ? 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                : 'bg-white/80 text-stone-700 hover:bg-stone-100'
            }`"
          >
            <X class="w-5 h-5" />
      </button>

      <div class="grid md:grid-cols-2">
        <!-- Left: Image with Liquid Scale -->
        <div class="liquid-modal-image aspect-square relative overflow-hidden bg-stone-100 dark:bg-zinc-800">
          <img
            v-if="item?.image_url"
            :src="item.image_url"
            :alt="item.name"
            class="w-full h-full object-cover"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
          >
            <Shirt :class="`w-16 h-16 ${theme.value === 'dark' ? 'text-zinc-600' : 'text-stone-400'}`" />
          </div>
        </div>

        <!-- Right: Details with Liquid Reveal -->
        <div class="liquid-modal-content p-6 space-y-6">
          <!-- Item Name & Category -->
          <div>
            <h2 :class="`text-2xl font-bold mb-2 ${
              theme.value === 'dark' ? 'text-white' : 'text-black'
            }`">
              {{ item?.name || 'Untitled Item' }}
            </h2>
            <span :class="`inline-block px-3 py-1 text-sm rounded-full ${
              theme.value === 'dark'
                ? 'bg-zinc-800 text-zinc-300'
                : 'bg-stone-100 text-stone-700'
            }`">
              {{ item?.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Uncategorized' }}
            </span>
          </div>

          <!-- Item Details -->
          <div class="space-y-3">
            <div v-if="item?.brand">
              <p :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">Brand</p>
              <p :class="`text-base ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">{{ item.brand }}</p>
            </div>

            <div v-if="item?.color">
              <p :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">Color</p>
              <p :class="`text-base ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">{{ item.color }}</p>
            </div>

            <div v-if="item?.size">
              <p :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">Size</p>
              <p :class="`text-base ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">{{ item.size }}</p>
            </div>

            <div v-if="item?.season">
              <p :class="`text-sm font-medium ${
                theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
              }`">Season</p>
              <p :class="`text-base ${
                theme.value === 'dark' ? 'text-white' : 'text-black'
              }`">{{ item.season.charAt(0).toUpperCase() + item.season.slice(1) }}</p>
            </div>
          </div>

          <!-- Privacy Setting -->
          <div>
            <label :class="`block text-sm font-medium mb-2 ${
              theme.value === 'dark' ? 'text-zinc-400' : 'text-stone-600'
            }`">
              Privacy
            </label>
            <select
              v-model="localPrivacy"
              @change="updatePrivacy"
              :class="`w-full px-4 py-2 rounded-lg border transition-colors ${
                theme.value === 'dark'
                  ? 'bg-zinc-800 border-zinc-700 text-white'
                  : 'bg-white border-stone-300 text-black'
              }`"
            >
              <option value="private">Private (Only Me)</option>
              <option value="friends">Friends</option>
              <option value="public">Public</option>
            </select>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-4">
            <button
              @click="removeItem"
              :disabled="isRemoving"
              :class="`flex-1 px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                isRemoving
                  ? 'opacity-50 cursor-not-allowed bg-red-500 text-white'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`"
            >
              <Trash2 class="w-5 h-5" />
              {{ isRemoving ? 'Removing...' : 'Remove Item' }}
            </button>
          </div>

          <!-- Meta Info -->
          <div :class="`pt-4 border-t text-xs ${
            theme.value === 'dark'
              ? 'border-zinc-800 text-zinc-500'
              : 'border-stone-200 text-stone-500'
          }`">
            <p>Added {{ formatDate(item?.created_at) }}</p>
            <p v-if="item?.updated_at && item.updated_at !== item.created_at">
              Updated {{ formatDate(item.updated_at) }}
            </p>
          </div>
        </div>
      </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useTheme } from '@/composables/useTheme'
import { usePopup } from '@/composables/usePopup'
import { useLiquidPress, useLiquidReveal } from '@/composables/useLiquidGlass'
import { ClothesService } from '@/services/clothesService'
import { X, Trash2, Shirt } from 'lucide-vue-next'

const { theme } = useTheme()
const { showError, showSuccess, showConfirm } = usePopup()
const clothesService = new ClothesService()

// Liquid glass composables
const { elementRef: closeButtonRef, pressIn: closePressIn, pressOut: closePressOut } = useLiquidPress()
const { elementRef: modalContentRef, reveal: modalContentReveal } = useLiquidReveal()

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  item: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'item-removed', 'item-updated'])

const localPrivacy = ref(props.item?.privacy || 'friends')
const isRemoving = ref(false)

// Watch for item changes to update local privacy
watch(() => props.item, (newItem) => {
  if (newItem) {
    localPrivacy.value = newItem.privacy || 'friends'
  }
}, { immediate: true })

const closeModal = () => {
  emit('close')
}

const updatePrivacy = async () => {
  if (!props.item) return

  try {
    await clothesService.updateClothes(props.item.id, {
      privacy: localPrivacy.value
    })
    
    console.log('✅ Privacy updated to:', localPrivacy.value)
    emit('item-updated')
  } catch (error) {
    console.error('❌ Error updating privacy:', error)
    showError('Failed to update privacy setting')
    // Revert to original value
    localPrivacy.value = props.item.privacy
  }
}

const removeItem = async () => {
  if (!props.item) return

  showConfirm(
    `Are you sure you want to remove "${props.item.name}" from your closet?`,
    'Remove Item',
    async () => {
      isRemoving.value = true
      try {
        await clothesService.deleteClothes(props.item.id)
        
        console.log('✅ Item removed successfully')
        showSuccess('Item removed successfully!')
        emit('item-removed', props.item.id)
        closeModal()
      } catch (error) {
        console.error('❌ Error removing item:', error)
        showError('Failed to remove item')
      } finally {
        isRemoving.value = false
      }
    }
  )
}

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Liquid glass event handlers
const handleClosePress = (event) => {
  closePressIn(event.target)
}

const handleCloseRelease = (event) => {
  closePressOut(event.target)
}

// Trigger modal content reveal on open
watch(isOpen, (newValue) => {
  if (newValue && modalContentRef.value) {
    setTimeout(() => {
      modalContentReveal()
    }, 100)
  }
})
</script>

