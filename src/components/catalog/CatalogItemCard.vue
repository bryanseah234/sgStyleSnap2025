<template>
  <div
    class="catalog-item-card"
    @click="emit('click')"
  >
    <!-- Image Container -->
    <div class="item-image-container">
      <img
        v-if="item.image_url"
        :src="item.thumbnail_url || item.image_url"
        :alt="item.name"
        class="item-image"
        loading="lazy"
        @error="handleImageError"
      >
      <div
        v-else
        class="item-image-placeholder"
      >
        {{ item.name }}
      </div>

      <!-- Dark Overlay on Hover -->
      <div class="item-overlay">
        <!-- Quick Add Button -->
        <button
          :disabled="adding"
          class="add-to-closet-btn"
          :class="{ 'opacity-50 cursor-not-allowed': adding }"
          title="Add to closet"
          @click.stop="handleAddToCloset"
        >
          <svg
            v-if="!adding"
            class="add-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <div
            v-else
            class="loading-spinner"
          />
        </button>

        <!-- Category Badge -->
        <div class="category-badge">
          {{ getCategoryLabel(item.category) }}
        </div>
      </div>
    </div>

    <!-- Item Info -->
    <div class="item-info">
      <h3 class="item-name">
        {{ item.name }}
      </h3>

      <div class="item-details">
        <span
          v-if="item.brand"
          class="item-brand"
        >
          {{ item.brand }}
        </span>
        <span
          v-if="item.primary_color"
          class="item-color"
        >
          <span
            class="color-swatch"
            :style="{ backgroundColor: getColorHex(item.primary_color) }"
          />
          {{ getColorLabel(item.primary_color) }}
        </span>
      </div>

      <!-- Style Tags -->
      <div
        v-if="item.style_tags && item.style_tags.length > 0"
        class="item-tags"
      >
        <span
          v-for="tag in item.style_tags.slice(0, 3)"
          :key="tag"
          class="tag"
        >
          {{ tag }}
        </span>
        <span
          v-if="item.style_tags.length > 3"
          class="tag-more"
        >
          +{{ item.style_tags.length - 3 }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getCategoryLabel, getColorHex, getColorLabel } from '@/config/constants'
import { COLORS } from '@/config/constants'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-closet', 'click'])

const adding = ref(false)

async function handleAddToCloset() {
  if (adding.value) return

  adding.value = true
  try {
    emit('add-to-closet')
    // Wait a bit for the animation
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    adding.value = false
  }
}

function handleImageError(event) {
  // Fallback to placeholder image
  event.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
}

// Use the imported getColorLabel function instead of defining it locally
</script>

<style scoped>
.catalog-item-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translateY(0);
}

.catalog-item-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Image Container */
.item-image-container {
  position: relative;
  width: 100%;
  height: 280px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.catalog-item-card:hover .item-image {
  transform: scale(1.05);
}

.item-image-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.875rem;
  text-align: center;
  padding: 1rem;
}

/* Item Overlay */
.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem;
}

.catalog-item-card:hover .item-overlay {
  background: rgba(0, 0, 0, 0.1);
}

/* Add to Closet Button */
.add-to-closet-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0;
  transform: scale(0.8);
}

.catalog-item-card:hover .add-to-closet-btn {
  opacity: 1;
  transform: scale(1);
}

.add-to-closet-btn:hover {
  background: white;
  transform: scale(1.1);
}

.add-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #3b82f6;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Category Badge */
.category-badge {
  background: rgba(255, 255, 255, 0.9);
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  transform: translateY(10px);
}

.catalog-item-card:hover .category-badge {
  opacity: 1;
  transform: translateY(0);
}

/* Item Info */
.item-info {
  padding: 1rem;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.item-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.item-brand {
  font-weight: 500;
}

.item-color {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.color-swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
}

/* Item Tags */
.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.tag-more {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 640px) {
  .catalog-item-card {
    transform: none;
  }
  
  .catalog-item-card:hover {
    transform: none;
  }
  
  .item-image-container {
    height: 250px;
  }
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .catalog-item-card {
    background: #374151;
  }
  
  .item-image-placeholder {
    background: #4b5563;
    color: #9ca3af;
  }
  
  .item-name {
    color: white;
  }
  
  .item-details {
    color: #9ca3af;
  }
  
  .add-to-closet-btn {
    background: rgba(55, 65, 81, 0.9);
  }
  
  .category-badge {
    background: rgba(55, 65, 81, 0.9);
    color: white;
  }
  
  .tag {
    background: #4b5563;
    color: #d1d5db;
  }
  
  .tag-more {
    background: #374151;
    color: #9ca3af;
  }
}
</style>
