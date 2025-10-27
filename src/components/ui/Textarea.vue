<template>
  <textarea
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
    :placeholder="placeholder"
    :rows="rows"
    class="w-full px-3 py-2 rounded-lg border resize-none bg-white dark:bg-zinc-800 border-stone-300 dark:border-zinc-700 text-black dark:text-white placeholder-stone-500 dark:placeholder-zinc-400"
  />
</template>

<script setup>
// Props
defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  rows: {
    type: Number,
    default: 3
  }
})

// Emits
defineEmits(['update:modelValue'])
</script>
