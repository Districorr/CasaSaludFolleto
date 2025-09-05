<!-- src/components/ProductDetailModal.vue (Versión Final y Completa) -->
<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  producto: Object,
  colorPrimario: String,
  preciosOcultos: Boolean,
})
const emit = defineEmits(['cerrar'])

const slideActivoIndex = ref(0)
const zoomActivo = ref(false)
const zoomPos = ref({ x: 0, y: 0 })
const visorPrincipalRef = ref(null)

const youtubeEmbedUrl = computed(() => {
  if (!props.producto?.video_youtube_url) return null
  try {
    const url = new URL(props.producto.video_youtube_url)
    let videoId = url.searchParams.get('v')
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.substring(1)
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&modestbranding=1` : null
  } catch (error) {
    return null
  }
})

const mediaList = computed(() => {
  const media = []
  if (props.producto.producto_imagenes) {
    props.producto.producto_imagenes.forEach(img => {
      media.push({ type: 'image', src: img.imagen_url, thumbnail: img.imagen_url })
    })
  }
  if (youtubeEmbedUrl.value) {
    const videoId = new URL(youtubeEmbedUrl.value).pathname.split('/').pop()
    media.push({ type: 'video', src: youtubeEmbedUrl.value, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` })
  }
  return media
})

const slideActivo = computed(() => mediaList.value[slideActivoIndex.value] || null)

// Convierte el texto de puntos_clave (separado por saltos de línea) en un array
const puntosClaveArray = computed(() => {
  if (!props.producto?.puntos_clave) return []
  return props.producto.puntos_clave.split('\n').filter(punto => punto.trim() !== '')
})

function changeSlide(index) {
  slideActivoIndex.value = index
  zoomActivo.value = false
}

function nextSlide() {
  const newIndex = (slideActivoIndex.value + 1) % mediaList.value.length
  changeSlide(newIndex)
}

function prevSlide() {
  const newIndex = (slideActivoIndex.value - 1 + mediaList.value.length) % mediaList.value.length
  changeSlide(newIndex)
}

function handleMouseMove(event) {
  if (!visorPrincipalRef.value) return
  const rect = visorPrincipalRef.value.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  zoomPos.value = { x, y }
}

watch(() => props.producto, () => {
  slideActivoIndex.value = 0
})

function cotizarPorWhatsApp() {
<<<<<<< HEAD
  const mensaje = encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${props.producto.nombre} (Código: ${props.producto.codigo}).`)
  const numeroWhatsApp = '5493704357985'
=======
  const mensaje = encodeURIComponent(`¡Hola! Estoy interesado/a en el producto: ${props.producto.nombre} (Código: ${props.producto.codigo}). ¿Podrían darme más información?`)
  // Reemplaza 'NUMERO' con el número de WhatsApp de la empresa
  const numeroWhatsApp = '5493704357985' 
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank')
}
</script>

<template>
  <div @click.self="emit('cerrar')" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-full max-h-[600px] flex flex-col md:flex-row overflow-hidden">
      
      <!-- Columna Izquierda: Visor Multimedia -->
      <div class="w-full md:w-1/2 flex flex-col bg-white">
        <div ref="visorPrincipalRef" 
             class="relative flex-1 w-full flex items-center justify-center overflow-hidden"
             @mouseenter="zoomActivo = true"
             @mouseleave="zoomActivo = false"
             @mousemove="handleMouseMove">

          <div v-if="slideActivo?.type === 'image'" class="w-full h-full">
            <img :src="slideActivo.src" class="w-full h-full object-contain">
          </div>
          <iframe v-if="slideActivo?.type === 'video'" :src="slideActivo.src" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen class="w-full h-full"></iframe>
          
          <div v-if="slideActivo?.type === 'image' && zoomActivo" 
               class="absolute top-0 left-0 w-full h-full pointer-events-none bg-no-repeat cursor-zoom-in"
               :style="{ backgroundImage: `url(${slideActivo.src})`, backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`, backgroundSize: '250%' }">
          </div>

          <div v-if="slideActivo?.type === 'image'" 
               class="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <span>Mover para ampliar</span>
          </div>

          <div v-if="!slideActivo" class="text-center text-gray-400">
            <svg class="w-16 h-16 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <p class="mt-2 text-sm">Sin contenido multimedia</p>
          </div>

          <div v-if="mediaList.length > 1" class="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
            <button @click.stop="prevSlide" class="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 pointer-events-auto">&lt;</button>
            <button @click.stop="nextSlide" class="bg-black/40 text-white p-2 rounded-full hover:bg-black/60 pointer-events-auto">&gt;</button>
          </div>
        </div>
        <div v-if="mediaList.length > 1" class="flex-shrink-0 p-2 bg-gray-200 overflow-x-auto">
          <div class="flex gap-2">
            <button v-for="(media, index) in mediaList" :key="index" @click="changeSlide(index)"
                    class="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all"
                    :class="index === slideActivoIndex ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'">
              <img :src="media.thumbnail" class="w-full h-full object-cover">
            </button>
          </div>
        </div>
      </div>
      
      <!-- Columna Derecha: Detalles del Producto -->
      <div class="w-full md:w-1/2 p-6 flex flex-col overflow-y-auto">
        <h2 class="text-2xl md:text-3xl font-bold text-gray-900">{{ producto.nombre }}</h2>
        <p class="text-sm text-gray-500 mt-1">Código: {{ producto.codigo || 'N/A' }}</p>
        
        <span v-if="!preciosOcultos" class="mt-4 text-2xl font-bold" :style="{ color: colorPrimario }">
          {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(producto.precio) }}
        </span>

        <div class="mt-4 text-gray-700 prose max-w-none">
          <p>{{ producto.descripcion }}</p>
        </div>

        <div v-if="puntosClaveArray.length > 0" class="mt-6 border-t pt-4">
          <h3 class="text-md font-semibold text-gray-800 mb-2">Características Principales:</h3>
          <ul class="space-y-2 list-disc list-inside text-gray-600 text-sm">
            <li v-for="(punto, index) in puntosClaveArray" :key="index">
              {{ punto }}
            </li>
          </ul>
        </div>
        
        <div class="flex-grow"></div>

        <button @click="cotizarPorWhatsApp" class="mt-6 w-full py-3 text-white font-semibold rounded-lg flex items-center justify-center gap-2" :style="{ backgroundColor: colorPrimario }">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.523.074-.797.372-.273.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
          <span>Consultar por WhatsApp</span>
        </button>
      </div>
    </div>
  </div>
</template>
