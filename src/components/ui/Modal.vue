<!--
  Modal Component - StyleSnap
  
  Purpose: Reusable modal/dialog component with backdrop and close functionality
  
  Props:
  - isOpen: boolean (controls visibility)
  - title: string (modal header title)
  - size: 'sm' | 'md' | 'lg' | 'full' (default: 'md')
  - closeOnBackdrop: boolean (default: true)
  - showCloseButton: boolean (default: true)
  
  Emits:
  - close: emitted when modal should close
  
  Slots:
  - default: modal body content
  - footer: modal footer (buttons, etc.)
  
  Usage:
  <Modal :isOpen="showModal" title="Add Item" @close="showModal = false">
    <p>Modal content here</p>
    <template #footer>
      <Button @click="save">Save</Button>
    </template>
  </Modal>
  
  Reference: See docs/design/mobile-mockups/ for modal designs (22-modal-notification.png, etc.)
-->

<template>
  <teleport to="body">
    <transition name="modal">
      <div
        v-if="isOpen"
        class="modal-overlay"
        @click="handleBackdropClick"
      >
        <div
          class="modal"
          :class="`modal-${size}`"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          @click.stop
        >
          <div class="modal-header">
            <h2
              :id="titleId"
              class="modal-title"
            >
              {{ title }}
            </h2>
            <button
              v-if="showCloseButton"
              type="button"
              class="modal-close"
              aria-label="Close modal"
              @click="emit('close')"
            >
              ×
            </button>
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="modal-footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: value => ['sm', 'md', 'lg', 'full'].includes(value)
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  },
  showCloseButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const titleId = ref(`modal-title-${Math.random().toString(36).substr(2, 9)}`)

const handleBackdropClick = () => {
  if (props.closeOnBackdrop) {
    emit('close')
  }
}

// Handle escape key
watch(
  () => props.isOpen,
  isOpen => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        emit('close')
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-overlay.modal-backdrop {
  cursor: pointer;
}

.modal {
  background: var(--theme-surface);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 90vh;
  overflow-y: auto;
  cursor: default;
  border: 1px solid var(--theme-border);
}

.modal-sm {
  width: 100%;
  max-width: 400px;
}

.modal-md {
  width: 100%;
  max-width: 600px;
}

.modal-lg {
  width: 100%;
  max-width: 800px;
}

.modal-full {
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  border-radius: 0;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid var(--theme-border);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--theme-text);
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: var(--theme-text-secondary);
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: var(--theme-hover);
  color: var(--theme-text);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9);
}

/* Mobile styles */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }

  .modal {
    width: 100%;
    max-height: 90vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .modal-enter-from .modal,
  .modal-leave-to .modal {
    transform: translateY(100%);
  }
}
</style>
