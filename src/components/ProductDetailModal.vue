<!-- src/components/ProductDetailModal.vue -->
<script setup>
import { ref } from 'vue'

const props = defineProps({
  producto: Object,
  colorPrimario: String,
})
const emit = defineEmits(['cerrar'])

const imagenActivaIndex = ref(0)

function nextImage() {
  imagenActivaIndex.value = (imagenActivaIndex.value + 1) % props.producto.producto_imagenes.length
}
function prevImage() {
  imagenActivaIndex.value = (imagenActivaIndex.value - 1 + props.producto.producto_imagenes.length) % props.producto.producto_imagenes.length
}

function cotizarPorWhatsApp() {
  const mensaje = encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${props.producto.nombre} (Código: ${props.producto.codigo}). ¿Podrían darme más información?`)
  // Reemplaza 'NUMERO' con el número de WhatsApp de la empresa
  const numeroWhatsApp = '5491123456789' 
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank')
}
</script>

<template>
  <div @click.self="emit('cerrar')" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row">
      <!-- Carrusel de Imágenes -->
      <div class="w-full md:w-1/2 relative bg-gray-100 rounded-l-lg">
        <img v-if="producto.producto_imagenes.length > 0" :src="producto.producto_imagenes[imagenActivaIndex].imagen_url" class="w-full h-full object-cover">
        <div v-else class="flex items-center justify-center h-full text-gray-400">Sin imagen</div>
        <div v-if="producto.producto_imagenes.length > 1" class="absolute inset-0 flex justify-between items-center px-2">
          <button @click="prevImage" class="bg-black/40 text-white p-2 rounded-full hover:bg-black/60">&lt;</button>
          <button @click="nextImage" class="bg-black/40 text-white p-2 rounded-full hover:bg-black/60">&gt;</button>
        </div>
      </div>
      <!-- Detalles del Producto -->
      <div class="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
        <h2 class="text-3xl font-bold text-gray-900">{{ producto.nombre }}</h2>
        <p class="text-sm text-gray-500 mt-1">Código: {{ producto.codigo || 'N/A' }}</p>
        <span class="mt-4 text-2xl font-bold" :style="{ color: colorPrimario }">
          {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(producto.precio) }}
        </span>
        <p class="mt-4 text-gray-700 flex-1">{{ producto.descripcion }}</p>
        <button @click="cotizarPorWhatsApp" class="mt-6 w-full py-3 text-white font-semibold rounded-lg transition-transform hover:scale-105" :style="{ backgroundColor: colorPrimario }">
          Consultar por WhatsApp
        </button>
      </div>
    </div>
  </div>
</template>