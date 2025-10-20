<template>
  <option :value="value">
    <slot />
  </option>
</template>

<script setup>
defineProps({
  value: {
    type: [String, Number],
    required: true
  }
})
</script>
