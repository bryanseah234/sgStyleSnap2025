<template>
  <ConfirmationPopup
    :show="showPopup"
    :type="popupConfig.type"
    :title="popupConfig.title"
    :message="popupConfig.message"
    :confirm-text="popupConfig.confirmText"
    :cancel-text="popupConfig.cancelText"
    :show-cancel="popupConfig.showCancel"
    :close-on-backdrop="popupConfig.closeOnBackdrop"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="hidePopup"
  />
</template>

<script setup>
import { usePopup } from '@/composables/usePopup'
import ConfirmationPopup from '@/components/ui/ConfirmationPopup.vue'

const {
  showPopup,
  popupConfig,
  hidePopup,
  handleConfirm,
  handleCancel
} = usePopup()
</script>
