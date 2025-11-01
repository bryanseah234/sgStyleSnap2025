<!--
  StyleSnap Brand Component
  
  Displays the StyleSnap brand name with split typography:
  - "Style" in serif italic font
  - "Snap" in bold sans-serif font
-->
<template>
  <span :class="[sizeClass, brandClass]">
    <span class="brand-style">Style</span><span class="brand-snap">Snap</span>
  </span>
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

const sizeClass = computed(() => {
  return `text-${props.size}`
})

const brandClass = computed(() => {
  return props.class || ''
})
</script>

<style scoped>
.brand-style {
  font-family: 'Playfair Display', 'Georgia', 'Times New Roman', serif !important;
  font-style: italic !important;
  font-weight: 400 !important;
  letter-spacing: 0.02em;
}

.brand-snap {
  font-family: 'Montserrat', 'Inter', 'Helvetica Neue', 'Arial', sans-serif !important;
  font-style: normal !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em;
}

/* Inherit font size from parent text-size class */
.brand-style,
.brand-snap {
  display: inline-block;
}
</style>

