<template>
  <!-- Modal Backdrop with Liquid Glass -->
  <Transition name="modal-backdrop">
    <div
      v-if="isOpen"
      class="liquid-modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <!-- Modal Card with Fluid Expansion -->
      <Transition name="modal" appear>
        <div
          v-if="isOpen"
          :class="`liquid-modal-card relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden bg-white border border-stone-200
          dark:bg-zinc-900 dark:border border-zinc-800`"
          @click.stop
        >
          <!-- Close Button with Liquid Press -->
          <button
            @click="closeModal"
            @mousedown="handleClosePress"
            @mouseup="handleCloseRelease"
            @mouseleave="handleCloseRelease"
            :class="`liquid-close-btn absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/80 text-stone-700 hover:bg-stone-100
            dark:bg-zinc-800/80 dark:text-zinc-300 dark:hover:bg-zinc-700`"
          >
            <X class="w-5 h-5" />
      </button>

      <!-- Favorite Button (Heart) -->
      <button
        v-if="item"
        @click="toggleFavorite"
        :class="`liquid-favorite-btn absolute top-4 right-16 z-10 p-2 rounded-full transition-all duration-200 ${item.is_favorite ? 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-500 dark:hover:bg-red-600' : 'bg-white/90 text-stone-500 hover:bg-stone-100/90 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-700/90'}`"
        title="Favorite"
      >
        <Heart :class="`w-5 h-5 ${item.is_favorite ? 'fill-current' : ''}`" />
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
            <Shirt :class="`w-16 h-16 text-stone-400 dark:text-zinc-600`" />
          </div>
        </div>

        <!-- Right: Details with Liquid Reveal -->
        <div class="liquid-modal-content p-6 space-y-6">
          <!-- Item Name & Category -->
          <div>
            <h2 class="text-2xl font-bold mb-2 text-foreground">
              {{ item?.name || 'Untitled Item' }}
            </h2>
            <span :class="`inline-block px-3 py-1 text-sm rounded-full bg-stone-100 text-stone-700
            dark:bg-zinc-800 dark:text-zinc-300`">
              {{ item?.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : 'Uncategorized' }}
            </span>
          </div>

          <!-- Item Details -->
          <div class="space-y-3">
            <div v-if="item?.brand">
              <p :class="`text-sm font-medium text-stone-600 dark:text-zinc-400`">Brand</p>
              <p class="text-base text-foreground">{{ item.brand }}</p>
            </div>

            <div v-if="item?.color">
              <p :class="`text-sm font-medium text-stone-600 dark:text-zinc-400`">Color</p>
              <p class="text-base text-foreground">{{ item.color }}</p>
            </div>

            <div v-if="item?.size">
              <p :class="`text-sm font-medium text-stone-600 dark:text-zinc-400`">Size</p>
              <p class="text-base text-foreground">{{ item.size }}</p>
            </div>

            <div v-if="item?.season">
              <p :class="`text-sm font-medium text-stone-600 dark:text-zinc-400`">Season</p>
              <p class="text-base text-foreground">{{ item.season.charAt(0).toUpperCase() + item.season.slice(1) }}</p>
            </div>
          </div>

          <!-- Privacy Setting -->
          <div>
            <label :class="`block text-sm font-medium mb-2 text-stone-600 dark:text-zinc-400`">
              Privacy
            </label>
            <select
              v-model="localPrivacy"
              @change="updatePrivacy"
              :class="`w-full px-4 py-2 rounded-lg border transition-colors bg-white border-stone-300 text-black
              dark:bg-zinc-800 dark:border-zinc-700 dark:text-white`"
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
          <div :class="`pt-4 border-t text-xs border-stone-200 text-stone-500
          dark:border-zinc-800 dark:text-zinc-500`">
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
import { X, Trash2, Shirt, Heart } from 'lucide-vue-next'

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
watch(() => props.isOpen, (newValue) => {
  if (newValue && modalContentRef.value) {
    setTimeout(() => {
      modalContentReveal()
    }, 100)
  }
})

const toggleFavorite = async () => {
  if (!props.item) return
  try {
    // Add simple animation feedback
    const heartBtn = document.querySelector('.liquid-favorite-btn')
    if (heartBtn) {
      heartBtn.classList.add('heart-pulse')
      setTimeout(() => heartBtn.classList.remove('heart-pulse'), 300)
    }
    const result = await clothesService.toggleFavorite(props.item.id)
    if (result.success) {
      props.item.is_favorite = result.data.is_favorite
      console.log('Toggled favorite for item:', props.item.name, 'New status:', props.item.is_favorite)
      emit('item-updated')
    } else {
      showError('Failed to update favorite status')
    }
  } catch (error) {
    showError('An error occurred while updating favorite status')
    console.error('Error toggling favorite:', error)
  }
}
</script>

