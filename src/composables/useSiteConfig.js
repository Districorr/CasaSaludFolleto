// src/composables/useSiteConfig.js
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

// Estado singleton para guardar la configuración
const siteConfig = ref(null)
const loading = ref(false)
const error = ref(null)

export function useSiteConfig() {
  
  async function fetchConfig() {
    // Si ya la cargamos una vez, no la volvemos a pedir.
    if (siteConfig.value || loading.value) return

    try {
      loading.value = true
      const { data, error: fetchError } = await supabase
        .from('sitio_configuracion')
        .select('config_json')
        .eq('id', true)
        .single()

      if (fetchError) throw fetchError
      if (data) {
        siteConfig.value = data.config_json
      }
    } catch (e) {
      error.value = e.message
      console.error("Error al cargar la configuración del sitio:", e)
    } finally {
      loading.value = false
    }
  }

  return {
    config: siteConfig,
    loading,
    error,
    fetchConfig,
  }
}