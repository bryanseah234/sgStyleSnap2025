<template>
  <div class="catalog-grid">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <CatalogItemCard
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :style="{ 'animation-delay': `${index * 0.1}s` }"
        class="animate-slide-up"
        @add-to-closet="emit('add-to-closet', item.id)"
        @click="emit('item-click', item)"
      />
    </div>

    <!-- Load More Trigger (Intersection Observer for virtual scrolling) -->
    <div
      v-if="items.length > 0 && !loading"
      ref="loadMoreTrigger"
      class="load-more-trigger h-4"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import CatalogItemCard from './CatalogItemCard.vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['add-to-closet', 'item-click', 'load-more'])

const loadMoreTrigger = ref(null)
let observer = null

onMounted(() => {
  // Set up intersection observer for infinite scroll
  observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !props.loading) {
          emit('load-more')
        }
      })
    },
    {
      root: null,
      rootMargin: '200px', // Start loading 200px before reaching the trigger
      threshold: 0
    }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.load-more-trigger {
  visibility: hidden;
}

/* Animation keyframes */
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slide-up 0.6s ease-out forwards;
  opacity: 0;
}

/* Grid animations */
.catalog-grid {
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
