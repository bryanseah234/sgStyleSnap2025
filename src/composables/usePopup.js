import { ref } from 'vue'

const showPopup = ref(false)
const showInputPopup = ref(false)
const popupConfig = ref({
  type: 'info',
  title: '',
  message: '',
  imageUrl: null, // URL to display image in popup (e.g., processed image with background removed)
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
  closeOnBackdrop: true,
  onConfirm: null,
  onCancel: null
})

const inputPopupConfig = ref({
  title: '',
  message: '',
  defaultValue: '',
  placeholder: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  closeOnBackdrop: true,
  onConfirm: null,
  onCancel: null
})

export function usePopup() {
  const showAlert = (config) => {
    popupConfig.value = {
      type: config.type || 'info',
      title: config.title || 'Alert',
      message: config.message || '',
      imageUrl: config.imageUrl || null,
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel || false,
      closeOnBackdrop: config.closeOnBackdrop !== false,
      onConfirm: config.onConfirm || null,
      onCancel: config.onCancel || null
    }
    showPopup.value = true
  }

  const showError = (message, title = 'Error', imageUrl = null) => {
    showAlert({
      type: 'error',
      title,
      message,
      imageUrl
    })
  }

  const showSuccess = (message, title = 'Success') => {
    showAlert({
      type: 'success',
      title,
      message
    })
  }

  const showWarning = (message, title = 'Warning') => {
    showAlert({
      type: 'warning',
      title,
      message
    })
  }

  const showInfo = (message, title = 'Information') => {
    showAlert({
      type: 'info',
      title,
      message
    })
  }

  const showConfirm = (message, title = 'Confirm', onConfirm = null, onCancel = null) => {
    showAlert({
      type: 'info',
      title,
      message,
      showCancel: true,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm,
      onCancel
    })
  }

  const showPrompt = (config) => {
    inputPopupConfig.value = {
      title: config.title || 'Input',
      message: config.message || '',
      defaultValue: config.defaultValue || '',
      placeholder: config.placeholder || '',
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      closeOnBackdrop: config.closeOnBackdrop !== false,
      onConfirm: config.onConfirm || null,
      onCancel: config.onCancel || null
    }
    showInputPopup.value = true
  }

  const hidePopup = () => {
    // Clean up blob URL if it exists
    if (popupConfig.value.imageUrl && popupConfig.value.imageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(popupConfig.value.imageUrl)
    }
    showPopup.value = false
  }

  const hideInputPopup = () => {
    showInputPopup.value = false
  }

  const handleConfirm = () => {
    if (popupConfig.value.onConfirm) {
      popupConfig.value.onConfirm()
    }
    hidePopup()
  }

  const handleCancel = () => {
    if (popupConfig.value.onCancel) {
      popupConfig.value.onCancel()
    }
    hidePopup()
  }

  const handleInputConfirm = (value) => {
    if (inputPopupConfig.value.onConfirm) {
      inputPopupConfig.value.onConfirm(value)
    }
    hideInputPopup()
  }

  const handleInputCancel = () => {
    if (inputPopupConfig.value.onCancel) {
      inputPopupConfig.value.onCancel()
    }
    hideInputPopup()
  }

  return {
    showPopup,
    popupConfig,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConfirm,
    showPrompt,
    hidePopup,
    handleConfirm,
    handleCancel,
    // Input popup
    showInputPopup,
    inputPopupConfig,
    hideInputPopup,
    handleInputConfirm,
    handleInputCancel
  }
}
