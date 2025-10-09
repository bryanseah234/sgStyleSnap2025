<!--
  FormInput Component - StyleSnap
  
  Purpose: Reusable form input component with validation and error display
  
  Props:
  - modelValue: string (v-model support)
  - type: 'text' | 'email' | 'password' | 'number' | 'url' (default: 'text')
  - label: string
  - placeholder: string
  - error: string (error message to display)
  - required: boolean
  - disabled: boolean
  - maxlength: number
  
  Emits:
  - update:modelValue: for v-model support
  
  Usage:
  <FormInput v-model="itemName" label="Item Name" :error="errors.name" required />
  
  Reference: requirements/frontend-components.md for form styling
-->

<template>
  <div class="form-input">
    <label
      v-if="label"
      :for="inputId"
      class="input-label"
    >
      {{ label }}
      <span
        v-if="required"
        class="required-mark"
      >*</span>
    </label>
    
    <input
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :maxlength="maxlength"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${inputId}-error` : undefined"
      class="input-field"
      :class="{ 'has-error': !!error, 'disabled': disabled }"
      @input="handleInput"
    >
    
    <p
      v-if="error"
      :id="`${inputId}-error`"
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
  type: {
    type: String,
    default: 'text',
    validator: (value) => ['text', 'email', 'password', 'number', 'url'].includes(value)
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
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
  },
  maxlength: {
    type: Number,
    default: undefined
  }
})

const emit = defineEmits(['update:modelValue'])

const inputId = computed(() => {
  return `input-${Math.random().toString(36).substr(2, 9)}`
})

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style scoped>
.form-input {
  margin-bottom: 1rem;
}

.input-label {
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

.input-field {
  width: 100%;
  padding: 0.625rem 0.875rem;
  font-size: 1rem;
  line-height: 1.5;
  color: #2d3748;
  background: white;
  border: 1px solid #cbd5e0;
  border-radius: 0.375rem;
  transition: all 0.2s;
  outline: none;
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #a0aec0;
}

.input-field.disabled {
  background: #f7fafc;
  color: #a0aec0;
  cursor: not-allowed;
}

.input-field.has-error {
  border-color: #ef4444;
}

.input-field.has-error:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #ef4444;
}
</style>
