<!--
  Skeleton Component - StyleSnap
  
  Purpose: Loading skeleton placeholder for content that's being fetched
  
  Props:
  - type: 'text' | 'circle' | 'rect' | 'card' (default: 'rect')
  - width: string (CSS width value, default: '100%')
  - height: string (CSS height value, default: '20px')
  - count: number (for multiple skeleton lines, default: 1)
  
  Usage:
  <Skeleton type="circle" width="80px" height="80px" /> (for avatar)
  <Skeleton type="text" count="3" /> (for text lines)
  <Skeleton type="card" height="200px" /> (for item cards)
  
  Note: Used while images and data are loading from Supabase/Cloudinary
  Reference: requirements/performance.md for loading state requirements
-->

<template>
  <div class="skeleton-wrapper">
    <div
      v-for="index in count"
      :key="index"
      class="skeleton"
      :class="[`skeleton-${type}`, { 'skeleton-multiple': count > 1 }]"
      :style="{
        width: width,
        height: height
      }"
    />
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'rect',
    validator: (value) => ['text', 'circle', 'rect', 'card'].includes(value)
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '20px'
  },
  count: {
    type: Number,
    default: 1
  }
})
</script>

<style scoped>
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 0%,
    #e0e0e0 20%,
    #f0f0f0 40%,
    #f0f0f0 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Types */
.skeleton-text {
  border-radius: 4px;
  height: 16px;
}

.skeleton-circle {
  border-radius: 50%;
}

.skeleton-rect {
  border-radius: 0.25rem;
}

.skeleton-card {
  border-radius: 0.5rem;
}

/* Multiple skeletons - add variation in width for text */
.skeleton-multiple.skeleton-text:nth-child(odd) {
  width: 95%;
}

.skeleton-multiple.skeleton-text:last-child {
  width: 60%;
}
</style>
