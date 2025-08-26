// src/lib/useToast.js
import { ref } from 'vue'

const toast = ref({
  show: false,
  message: '',
  type: 'success', // 'success' o 'error'
})

export function useToast() {
  function showToast(message, type = 'success', duration = 3000) {
    toast.value.message = message
    toast.value.type = type
    toast.value.show = true

    setTimeout(() => {
      toast.value.show = false
    }, duration)
  }

  return { toast, showToast }
}