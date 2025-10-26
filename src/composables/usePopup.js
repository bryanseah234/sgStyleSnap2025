import { ref } from 'vue'

const showPopup = ref(false)
const popupConfig = ref({
  type: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Cancel',
  showCancel: false,
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
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Cancel',
      showCancel: config.showCancel || false,
      closeOnBackdrop: config.closeOnBackdrop !== false,
      onConfirm: config.onConfirm || null,
      onCancel: config.onCancel || null
    }
    showPopup.value = true
  }

  const showError = (message, title = 'Error') => {
    showAlert({
      type: 'error',
      title,
      message
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

  const hidePopup = () => {
    showPopup.value = false
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

  return {
    showPopup,
    popupConfig,
    showAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    showConfirm,
    hidePopup,
    handleConfirm,
    handleCancel
  }
}
