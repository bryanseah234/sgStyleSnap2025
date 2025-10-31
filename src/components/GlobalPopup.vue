<template>
  <ConfirmationPopup
    :show="showPopup"
    :type="popupConfig.type"
    :title="popupConfig.title"
    :message="popupConfig.message"
    :image-url="popupConfig.imageUrl"
    :confirm-text="popupConfig.confirmText"
    :cancel-text="popupConfig.cancelText"
    :show-cancel="popupConfig.showCancel"
    :close-on-backdrop="popupConfig.closeOnBackdrop"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="hidePopup"
  />
  
  <InputPopup
    :show="showInputPopup"
    :title="inputPopupConfig.title"
    :message="inputPopupConfig.message"
    :default-value="inputPopupConfig.defaultValue"
    :placeholder="inputPopupConfig.placeholder"
    :confirm-text="inputPopupConfig.confirmText"
    :cancel-text="inputPopupConfig.cancelText"
    :close-on-backdrop="inputPopupConfig.closeOnBackdrop"
    @confirm="handleInputConfirm"
    @cancel="handleInputCancel"
    @close="hideInputPopup"
  />
</template>

<script setup>
import { usePopup } from '@/composables/usePopup'
import ConfirmationPopup from '@/components/ui/ConfirmationPopup.vue'
import InputPopup from '@/components/ui/InputPopup.vue'

const {
  showPopup,
  popupConfig,
  hidePopup,
  handleConfirm,
  handleCancel,
  showInputPopup,
  inputPopupConfig,
  hideInputPopup,
  handleInputConfirm,
  handleInputCancel
} = usePopup()
</script>
