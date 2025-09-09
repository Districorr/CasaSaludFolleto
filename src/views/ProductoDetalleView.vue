<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useListaCotizacion } from '../composables/useListaCotizacion'
import { useSiteConfig } from '../composables/useSiteConfig'
import ProductDetailModal from '../components/ProductDetailModal.vue'

const route = useRoute()
const { config } = useSiteConfig()
const { alternarProducto, estaEnLista } = useListaCotizacion()

const producto = ref(null)
const loading = ref(true)
const error = ref(null)
const isGalleryModalOpen = ref(false)

async function fetchProducto() {
  const slug = route.params.slug
  
  if (!slug) {
    loading.value = false
    error.value = 'No se ha especificado un producto para mostrar.'
    return
  }

  try {
    loading.value = true
    const { data, error: fetchError } = await supabase
      .from('productos')
      .select('*, producto_imagenes(*)')
      .eq('slug', slug)
      .single()

    if (fetchError) throw fetchError
    if (!data) throw new Error('Producto no encontrado.')
    producto.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducto)

const puntosClaveArray = computed(() => {
  if (!producto.value?.puntos_clave) return []
  return producto.value.puntos_clave.split('\n').filter(punto => punto.trim() !== '')
})

function formatCurrency(value) {
  if (typeof value !== 'number') return '$ 0,00'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}

function cotizarPorWhatsApp() {
  const mensaje = encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${producto.value.nombre} (Código: ${producto.value.codigo}).`)
  const numeroWhatsApp = '5493704357985'
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank')
}
</script>

<template>
  <div v-if="loading" class="text-center py-20">
    <p class="text-gray-500">Cargando producto...</p>
  </div>

  <div v-else-if="error" class="text-center py-20">
    <h2 class="text-xl font-bold text-red-600">Error al Cargar</h2>
    <p class="text-gray-600 mt-2">{{ error }}</p>
  </div>
  
  <div v-else-if="producto" class="container mx-auto px-4 py-12">
    <ProductDetailModal
      v-if="isGalleryModalOpen"
      :producto="producto"
      :color-primario="config.configuracionGlobal.tema.colores.primario"
      :precios-ocultos="false"
      @cerrar="isGalleryModalOpen = false"
    />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      <!-- Columna Izquierda: Galería de Imágenes -->
      <div class="w-full">
        <div class="relative">
          <img v-if="producto.producto_imagenes && producto.producto_imagenes.length > 0" 
               :src="producto.producto_imagenes[0].imagen_url" 
               class="w-full aspect-square object-cover rounded-lg shadow-lg cursor-pointer"
               @click="isGalleryModalOpen = true">
          <div v-else class="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
            <p class="text-gray-500">Sin imagen</p>
          </div>
          <div v-if="producto.producto_imagenes && producto.producto_imagenes.length > 1" 
               class="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-3 py-1 rounded-full pointer-events-none">
            +{{ producto.producto_imagenes.length - 1 }} imágenes
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Información y Acciones -->
      <div class="w-full">
        <div v-if="producto.badges && producto.badges.length > 0" class="flex flex-wrap gap-2 mb-2">
          <span v-for="badge in producto.badges" :key="badge" class="px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-md">{{ badge }}</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-bold text-gray-900">{{ producto.nombre }}</h1>
        <p class="text-md text-gray-500 mt-2">Código: {{ producto.codigo }}</p>
        
        <p class="text-3xl font-bold my-4" :style="{ color: config.configuracionGlobal.tema.colores.primario }">
          {{ formatCurrency(producto.precio) }}
        </p>

        <div class="prose max-w-none text-gray-600">
          <p>{{ producto.descripcion }}</p>
        </div>

        <div v-if="puntosClaveArray.length > 0" class="mt-6 border-t pt-4">
          <h3 class="text-md font-semibold text-gray-800 mb-2">Características Principales:</h3>
          <ul class="space-y-2 list-disc list-inside text-gray-600">
            <li v-for="(punto, index) in puntosClaveArray" :key="index">{{ punto }}</li>
          </ul>
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-4">
          <button @click="alternarProducto(producto.id)"
                  class="w-full px-6 py-3 font-semibold rounded-md border-2 transition-colors"
                  :class="estaEnLista(producto.id) 
                    ? 'bg-green-100 border-green-500 text-green-700' 
                    : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'">
            <span v-if="estaEnLista(producto.id)">✓ Agregado a la Lista</span>
            <span v-else>+ Añadir a Lista de Cotización</span>
          </button>
          <button @click="cotizarPorWhatsApp"
                  class="w-full px-6 py-3 font-semibold text-white rounded-md flex items-center justify-center gap-2"
                  :style="{ backgroundColor: config.configuracionGlobal.tema.colores.primario }">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.523.074-.797.372-.273.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
            <span>Consultar por WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>