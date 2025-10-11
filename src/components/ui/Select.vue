<!--
  Select Component - StyleSnap
  
  Purpose: Reusable dropdown/select component for category selection and filters
  
  Props:
  - modelValue: string | number (v-model support)
  - options: Array<{value: string|number, label: string}>
  - label: string
  - placeholder: string (default: 'Select...')
  - error: string
  - required: boolean
  - disabled: boolean
  
  Emits:
  - update:modelValue: for v-model support
  
  Usage:
  <Select v-model="category" :options="categoryOptions" label="Category" required />
  
  Note: The 5 clothing categories are: tops, bottoms, shoes, outerwear, accessories
  Reference: requirements/database-schema.md for category enum values
-->

<template>
  <div class="form-select">
    <label
      v-if="label"
      :for="selectId"
      class="select-label"
    >
      {{ label }}
      <span
        v-if="required"
        class="required-mark"
      >*</span>
    </label>
    
    <div class="select-wrapper">
      <select
        :id="selectId"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="error ? `${selectId}-error` : undefined"
        class="select-field"
        :class="{ 'has-error': !!error, 'disabled': disabled }"
        @change="handleChange"
      >
        <option
          value=""
          disabled
        >
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Custom dropdown arrow -->
      <div class="select-arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
    
    <p
      v-if="error"
      :id="`${selectId}-error`"
      class="error-message"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => value.every(opt => 'value' in opt && 'label' in opt)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Select...'
  },
  error: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const selectId = computed(() => {
  return `select-${Math.random().toString(36).substr(2, 9)}`
})

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.form-select {
  margin-bottom: 1rem;
}

.select-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
}

.required-mark {
  color: #ef4444;
  margin-left: 0.25rem;
}

.select-wrapper {
  position: relative;
}

.select-field {
  width: 100%;
  padding: 0.625rem 2.5rem 0.625rem 0.875rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #2d3748;
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  transition: all 0.2s;
  outline: none;
  appearance: none;
  cursor: pointer;
}

.select-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-field.disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.select-field.has-error {
  border-color: #ef4444;
}

.select-field.has-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #a0aec0;
  width: 1.25rem;
  height: 1.25rem;
}

.select-arrow svg {
  width: 100%;
  height: 100%;
}

.select-field:disabled + .select-arrow {
  opacity: 0.5;
}

.error-message {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #ef4444;
}
</style>
