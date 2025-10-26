<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div class="w-full max-w-md mx-auto" @click.stop>
      <AddItemForm 
        :is-open="isOpen"
        @close="$emit('close')"
        @item-added="handleItemAdded"
      />
    </div>
  </div>
</template>

<script setup>
import AddItemForm from './AddItemForm.vue'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'itemAdded'])

// Methods
const handleItemAdded = () => {
  emit('itemAdded')
}
</script>