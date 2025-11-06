<!--
  Skeleton Loader Component
  
  Displays skeleton placeholder UI that mirrors the layout of actual content.
  Features a subtle shimmer/pulse animation.
  
  @author Stylesnap Team
  @version 1.0.0
-->
<template>
  <div class="skeleton-loader" :class="[variantClass, animationClass]">
    <!-- Text skeleton -->
    <div v-if="variant === 'text'" class="skeleton-text" :style="textStyle"></div>
    
    <!-- Avatar skeleton -->
    <div v-else-if="variant === 'avatar'" class="skeleton-avatar" :style="avatarStyle"></div>
    
    <!-- Card skeleton -->
    <div v-else-if="variant === 'card'" class="skeleton-card">
      <div class="skeleton-card-image"></div>
      <div class="skeleton-card-content">
        <div class="skeleton-text skeleton-text--title"></div>
        <div class="skeleton-text skeleton-text--subtitle"></div>
      </div>
    </div>
    
    <!-- Rectangle skeleton -->
    <div v-else-if="variant === 'rectangle'" class="skeleton-rectangle" :style="rectangleStyle"></div>
    
    <!-- Circle skeleton -->
    <div v-else-if="variant === 'circle'" class="skeleton-circle" :style="circleStyle"></div>
    
    <!-- Custom skeleton -->
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'text', // 'text', 'avatar', 'card', 'rectangle', 'circle', 'custom'
    validator: (value) => ['text', 'avatar', 'card', 'rectangle', 'circle', 'custom'].includes(value)
  },
  animation: {
    type: String,
    default: 'pulse', // 'pulse', 'shimmer', 'none'
    validator: (value) => ['pulse', 'shimmer', 'none'].includes(value)
  },
  width: {
    type: [String, Number],
    default: null
  },
  height: {
    type: [String, Number],
    default: null
  },
  lines: {
    type: Number,
    default: 1
  }
})

const variantClass = computed(() => `skeleton-loader--${props.variant}`)
const animationClass = computed(() => props.animation !== 'none' ? `skeleton-loader--${props.animation}` : '')

const textStyle = computed(() => ({
  width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : '100%',
  height: props.height ? (typeof props.height === 'number' ? `${props.height}px` : props.height) : '1em'
}))

const avatarStyle = computed(() => ({
  width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : '48px',
  height: props.height ? (typeof props.height === 'number' ? `${props.height}px` : props.height) : '48px'
}))

const rectangleStyle = computed(() => ({
  width: props.width ? (typeof props.width === 'number' ? `${props.width}px` : props.width) : '100%',
  height: props.height ? (typeof props.height === 'number' ? `${props.height}px` : props.height) : '100px'
}))

const circleStyle = computed(() => {
  const size = props.width || props.height || '48px'
  const sizeValue = typeof size === 'number' ? `${size}px` : size
  return {
    width: sizeValue,
    height: sizeValue
  }
})
</script>

<style scoped>
.skeleton-loader {
  position: relative;
  overflow: hidden;
}

/* Base skeleton styling */
.skeleton-text,
.skeleton-avatar,
.skeleton-rectangle,
.skeleton-circle,
.skeleton-card-image,
.skeleton-card-content > div {
  background: hsl(var(--muted) / 0.3);
  border-radius: 4px;
}

/* Dark mode */
:global(.dark) .skeleton-text,
:global(.dark) .skeleton-avatar,
:global(.dark) .skeleton-rectangle,
:global(.dark) .skeleton-circle,
:global(.dark) .skeleton-card-image,
:global(.dark) .skeleton-card-content > div {
  background: hsl(var(--muted) / 0.2);
}

/* Text skeleton */
.skeleton-text {
  height: 1em;
  margin-bottom: 0.5em;
}

.skeleton-text:last-child {
  margin-bottom: 0;
}

/* Avatar skeleton */
.skeleton-avatar {
  border-radius: 50%;
}

/* Card skeleton */
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: hsl(var(--card));
  border-radius: 12px;
  border: 1px solid hsl(var(--border));
}

.skeleton-card-image {
  width: 100%;
  height: 200px;
  border-radius: 8px;
}

.skeleton-card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-text--title {
  width: 70%;
  height: 20px;
}

.skeleton-text--subtitle {
  width: 50%;
  height: 16px;
}

/* Rectangle skeleton */
.skeleton-rectangle {
  border-radius: 8px;
}

/* Circle skeleton */
.skeleton-circle {
  border-radius: 50%;
}

/* Pulse animation */
.skeleton-loader--pulse .skeleton-text,
.skeleton-loader--pulse .skeleton-avatar,
.skeleton-loader--pulse .skeleton-rectangle,
.skeleton-loader--pulse .skeleton-circle,
.skeleton-loader--pulse .skeleton-card-image,
.skeleton-loader--pulse .skeleton-card-content > div {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Shimmer animation */
.skeleton-loader--shimmer .skeleton-text::after,
.skeleton-loader--shimmer .skeleton-avatar::after,
.skeleton-loader--shimmer .skeleton-rectangle::after,
.skeleton-loader--shimmer .skeleton-circle::after,
.skeleton-loader--shimmer .skeleton-card-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

:global(.dark) .skeleton-loader--shimmer .skeleton-text::after,
:global(.dark) .skeleton-loader--shimmer .skeleton-avatar::after,
:global(.dark) .skeleton-loader--shimmer .skeleton-rectangle::after,
:global(.dark) .skeleton-loader--shimmer .skeleton-circle::after,
:global(.dark) .skeleton-loader--shimmer .skeleton-card-image::after {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .skeleton-loader--pulse .skeleton-text,
  .skeleton-loader--pulse .skeleton-avatar,
  .skeleton-loader--pulse .skeleton-rectangle,
  .skeleton-loader--pulse .skeleton-circle,
  .skeleton-loader--pulse .skeleton-card-image,
  .skeleton-loader--pulse .skeleton-card-content > div {
    animation: none;
    opacity: 0.7;
  }
  
  .skeleton-loader--shimmer .skeleton-text::after,
  .skeleton-loader--shimmer .skeleton-avatar::after,
  .skeleton-loader--shimmer .skeleton-rectangle::after,
  .skeleton-loader--shimmer .skeleton-circle::after,
  .skeleton-loader--shimmer .skeleton-card-image::after {
    animation: none;
  }
}
</style>

