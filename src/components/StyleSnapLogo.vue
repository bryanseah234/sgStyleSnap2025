<!--
  Stylesnap Logo Component
  
  Uses favicon.svg and adapts to theme:
  - Light mode: Black background, white icon (original)
  - Dark mode: White background, black icon (inverted)
-->
<template>
  <img 
    :src="logoPath" 
    :alt="'Stylesnap Logo'"
    :class="[sizeClass, 'stylesnap-logo']"
    :style="{ width: sizeValue, height: sizeValue }"
  />
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  class: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'base', // base, sm, lg, xl, 2xl, 3xl, 4xl
    validator: (value) => ['sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'].includes(value)
  }
})

// Size mapping for logo dimensions
const sizeValue = computed(() => {
  const sizes = {
    'sm': '1rem',      // 16px
    'base': '1.5rem',  // 24px
    'lg': '2rem',      // 32px
    'xl': '2.5rem',    // 40px
    '2xl': '3rem',     // 48px
    '3xl': '3.5rem',    // 56px
    '4xl': '4rem',     // 64px
    '5xl': '5rem',     // 80px
    '6xl': '6rem'      // 96px
  }
  return sizes[props.size] || sizes.base
})

const sizeClass = computed(() => {
  return props.class || ''
})

// Use favicon.svg - CSS will handle theme adaptation
const logoPath = '/favicon.svg'
</script>

<style scoped>
.stylesnap-logo {
  display: inline-block;
  object-fit: contain;
  transition: filter 0.3s ease;
  border-radius: 0.5rem; /* Match rounded-xl styling */
}

/* Light mode: Keep original (black bg, white icon) */
.stylesnap-logo {
  filter: none;
}

/* Dark mode: Invert colors (white bg, black icon) */
.dark .stylesnap-logo {
  filter: invert(1);
}
</style>

