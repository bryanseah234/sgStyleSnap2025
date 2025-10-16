<!--
  ClosetGrid Component - StyleSnap
  
  Purpose: Displays user's closet items in a responsive grid layout with filtering and sorting
  
  Features:
  - Grid display of closet items (cards with images)
  - Category filter (tops, bottoms, shoes, outerwear, accessories)
  - Sorting options (recent, name, category)
  - Click item to view details/edit/delete
  - Add new item button
  - Shows QuotaIndicator
  - Empty state when no items
  - Loading skeletons while fetching
  
  Data Source:
  - Fetches from closet-store.js (Pinia store)
  - Items stored in Supabase closet_items table
  - Images served from Cloudinary CDN
  
  Usage:
  <ClosetGrid :items="items" :loading="loading" @item-click="handleClick" />
  
  Business Rules:
  - Show only current user's items (enforced by RLS in Supabase)
  - Max 200 items per user
  - Each item belongs to 1 of 5 categories
  
  Reference:
  - docs/design/mobile-mockups/03-closet-grid.png for grid layout design
  - requirements/database-schema.md for closet_items table structure
  - requirements/api-endpoints.md for GET /api/closet endpoints
-->

<template>
  <div class="closet-grid">
    <!-- Loading State with Skeletons -->
    <div
      v-if="loading"
      class="items-grid"
    >
      <div
        v-for="i in 8"
        :key="`skeleton-${i}`"
        class="skeleton-card animate-pulse"
      >
        <div class="skeleton-image shimmer" />
        <div class="skeleton-content">
          <div class="skeleton-title shimmer" />
          <div class="skeleton-subtitle shimmer" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="items.length === 0"
      class="empty-state"
    >
      <div class="empty-icon">
        👔
      </div>
      <p class="empty-message">
        {{ emptyMessage }}
      </p>
      <slot name="empty-action" />
    </div>

    <!-- Items Grid with Staggered Animation -->
    <div
      v-else
      class="items-grid"
    >
      <div
        v-for="(item, index) in items"
        :key="item.id"
        class="item-card"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="handleItemClick(item)"
      >
        <!-- Image Container with Zoom Effect -->
        <div class="item-image-container">
          <img
            v-if="item.image_url"
            :src="item.thumbnail_url || item.image_url"
            :alt="item.name"
            class="item-image"
            loading="lazy"
          >
          <div
            v-else
            class="item-image-placeholder"
          >
            {{ item.name }}
          </div>

          <!-- Dark Overlay on Hover -->
          <div class="item-overlay">
            <!-- Favorite Heart Button -->
            <button
              v-if="showFavorites"
              class="favorite-button"
              :class="{ 'is-favorite': item.is_favorite }"
              :aria-label="item.is_favorite ? 'Unfavorite' : 'Favorite'"
              @click.stop="handleFavoriteClick(item)"
            >
              <svg
                class="favorite-icon"
                :fill="item.is_favorite ? '#ef4444' : 'none'"
                :stroke="item.is_favorite ? '#ef4444' : '#6b7280'"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Item Info -->
        <div class="item-info">
          <h3 class="item-name">
            {{ item.name }}
          </h3>
          <p class="item-category">
            {{ getCategoryLabel(item.category) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getCategoryLabel } from '@/config/constants'

defineProps({
  items: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'Your closet is empty. Add your first item!'
  },
  showFavorites: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['item-click', 'favorite-click'])

function handleItemClick(item) {
  emit('item-click', item)
}

function handleFavoriteClick(item) {
  console.log('Heart clicked for item:', item.name, 'Current favorite status:', item.is_favorite)
  emit('favorite-click', item)
}
</script>

<style scoped>
.closet-grid {
  width: 100%;
}

/* Grid Layout */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  width: 100%;
}

@media (max-width: 768px) {
  .items-grid {
    gap: 0.75rem;
  }
}

/* Item Card with Staggered Entrance */
.item-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  position: relative;
  animation: slide-up-fade-in 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slide-up-fade-in {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Respect reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .item-card {
    animation: fade-in-only 0.3s ease-out forwards;
    transform: none;
  }

  @keyframes fade-in-only {
    to {
      opacity: 1;
    }
  }
}

/* Card Hover Effects */
.item-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .item-card:hover {
    transform: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

/* Image Container with Zoom */
.item-image-container {
  aspect-ratio: 1;
  overflow: hidden;
  position: relative;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.item-card:hover .item-image {
  transform: scale(1.1);
}

@media (prefers-reduced-motion: reduce) {
  .item-card:hover .item-image {
    transform: scale(1.02);
  }
}

.item-image-placeholder {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
  padding: 1rem;
  text-align: center;
}

/* Dark Overlay */
.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  transition: background 0.3s ease;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0.5rem;
}

.item-card:hover .item-overlay {
  background: rgba(0, 0, 0, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .item-card:hover .item-overlay {
    background: rgba(0, 0, 0, 0.2);
  }
}

/* Favorite Heart Button */
.favorite-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(4px);
}

.item-card:hover .favorite-button {
  opacity: 1;
  transform: scale(1);
}

.favorite-button.is-favorite {
  opacity: 1;
  transform: scale(1);
}

.favorite-button:hover {
  transform: scale(1.25);
  background: rgba(255, 255, 255, 1);
}

@media (prefers-reduced-motion: reduce) {
  .favorite-button {
    transition: opacity 0.2s ease;
  }

  .item-card:hover .favorite-button {
    transform: scale(1);
  }

  .favorite-button:hover {
    transform: scale(1);
  }
}

/* Heart Icon with Bounce Animation */
/* .heart-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
  transition: color 0.2s ease;
  fill: currentColor;
}

.favorite-button.is-favorite .heart-icon {
  color: #ef4444;
  fill: #ef4444;
  animation: heart-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
} */

.favorite-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: color 0.2s ease;
}

.favorite-active {
  color: var(--theme-error, #dc2626);
  fill: currentColor;
}

.favorite-inactive {
  color: var(--theme-text-muted, #9ca3af);
}


@keyframes heart-bounce {
  0%,
  100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(0.9);
  }
  75% {
    transform: scale(1.1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .favorite-button.is-favorite .favorite-icon {
    animation: none;
  }
}

/* Item Info */
.item-info {
  padding: 0.75rem;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-category {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Skeleton Loaders */
.skeleton-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.skeleton-image {
  aspect-ratio: 1;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
}

.skeleton-content {
  padding: 0.75rem;
}

.skeleton-title {
  height: 0.875rem;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.skeleton-subtitle {
  height: 0.75rem;
  width: 60%;
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%;
  border-radius: 0.25rem;
}

/* Shimmer Animation */
.shimmer {
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shimmer {
    animation: none;
    background: #f3f4f6;
  }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .empty-icon {
    animation: none;
  }
}

.empty-message {
  color: #9ca3af;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}
</style>
