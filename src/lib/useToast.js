// src/lib/useToast.js
import { ref } from 'vue'

const toast = ref({
  show: false,
  message: '',
  type: 'success', // 'success', 'error', 'info'
  duration: 3000,
})

let timeoutId = null

export function useToast() {
  function showToast(message, type = 'success', duration = 3000) {
    // Limpiamos cualquier toast anterior
    if (timeoutId) clearTimeout(timeoutId)

    toast.value.message = message
    toast.value.type = type
    toast.value.duration = duration
    toast.value.show = true

    // Si la duración no es 0, el toast se cierra solo
    if (duration !== 0) {
      timeoutId = setTimeout(() => {
        toast.value.show = false
      }, duration)
    }
  }

  function hideToast() {
    if (timeoutId) clearTimeout(timeoutId)
    toast.value.show = false
  }

  return { toast, showToast, hideToast }
}