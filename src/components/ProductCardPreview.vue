<!-- src/components/ProductCardPreview.vue (Versión Multimedia) -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  nombre: String,
  descripcion: String,
  precio: Number,
  imagenUrl: String,
  videoUrl: String, // <-- Nueva prop para la URL del video
})

// Función para convertir una URL de YouTube a una URL de "embed"
const youtubeEmbedUrl = computed(() => {
  if (!props.videoUrl) return null
  try {
    const url = new URL(props.videoUrl)
    let videoId = url.searchParams.get('v')
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.substring(1)
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  } catch (error) {
    return null // Devuelve null si la URL no es válida
  }
})

function formatCurrency(value) {
  if (typeof value !== 'number') return '$ 0,00'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}
</script>

<template>
  <div class="sticky top-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Previsualización de la Tarjeta</h3>
    <div class="product-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
      
      <!-- Contenido Multimedia (Video o Imagen) -->
      <div class="relative overflow-hidden h-64 bg-black">
        <!-- Si hay una URL de video válida, muestra el video -->
        <iframe
          v-if="youtubeEmbedUrl"
          :src="youtubeEmbedUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          class="w-full h-full"
        ></iframe>
        <!-- Si no hay video, muestra la imagen -->
        <img v-else-if="imagenUrl" :src="imagenUrl" :alt="nombre" class="w-full h-full object-cover">
        <!-- Si no hay ni video ni imagen -->
        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
          <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        </div>
      </div>
      
      <!-- Contenido de texto (sin cambios) -->
      <div class="p-6 flex-1 flex flex-col">
        <h2 class="text-xl font-bold text-gray-800 truncate">{{ nombre || 'Nombre del Producto' }}</h2>
        <p class="text-gray-600 mt-4 flex-1 line-clamp-3">{{ descripcion || 'Aquí aparecerá la descripción...' }}</p>
        <div class="mt-6 flex justify-between items-center">
          <span class="text-xl font-bold text-blue-600">{{ formatCurrency(precio) }}</span>
          <button disabled class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md opacity-50">Ver Ficha</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
   overflow: hidden;
   display: -webkit-box;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 3;
}
</style>