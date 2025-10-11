<template>
  <div
    v-if="displayCount > 0"
    class="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full flex items-center justify-center px-1.5 shadow-lg"
    :class="{ 'animate-pulse': pulse }"
  >
    <span class="text-white text-xs font-bold leading-none">
      {{ formattedCount }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  count: {
    type: Number,
    required: true,
    default: 0
  },
  pulse: {
    type: Boolean,
    default: false
  }
})

const displayCount = computed(() => Math.max(0, props.count))

const formattedCount = computed(() => {
  return displayCount.value > 99 ? '99+' : displayCount.value.toString()
})
</script>

<style scoped>
/* Ensure badge stays visible above parent */
.absolute {
  z-index: 10;
}

/* Custom pulse animation for new notifications */
@keyframes pulse-scale {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.animate-pulse {
  animation: pulse-scale 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
