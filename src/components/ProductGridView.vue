<!-- src/components/ProductGridView.vue (con "Añadir a Lista") -->
<script setup>
import { useListaCotizacion } from '../composables/useListaCotizacion'

defineProps({
  productos: Array,
  catalogo: Object,
})

const emit = defineEmits(['ver-ficha'])

// Obtenemos las funciones y el estado de nuestro composable
const { alternarProducto, estaEnLista } = useListaCotizacion()

function formatCurrency(value) {
  if (typeof value !== 'number') return '$ 0,00'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    <div v-for="producto in productos" :key="producto.id" 
         class="product-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
      
      <div class="relative overflow-hidden aspect-square">
        <img v-if="producto.producto_imagenes && producto.producto_imagenes.length > 0" 
             :src="producto.producto_imagenes[0].imagen_url" 
             :alt="producto.nombre"
             loading="lazy"
             class="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
        <div v-else class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Sin imagen</div>

        <!-- === INICIO DE CAMBIOS === -->
        <!-- Botón para Añadir/Quitar de la lista -->
        <button 
          @click="alternarProducto(producto.id)"
          class="absolute top-2 right-2 p-2 rounded-full transition-colors duration-200"
          :class="estaEnLista(producto.id) ? 'bg-green-500 text-white' : 'bg-black/40 text-white hover:bg-blue-600'"
          :title="estaEnLista(producto.id) ? 'Quitar de la lista' : 'Añadir a la lista de cotización'"
        >
          <!-- Icono de Check si está en la lista -->
          <svg v-if="estaEnLista(producto.id)" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <!-- Icono de Plus si no está en la lista -->
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </button>
        <!-- === FIN DE CAMBIOS === -->
      </div>
      
      <div class="p-6 flex-1 flex flex-col">
        <h2 class="text-xl font-bold text-gray-800">{{ producto.nombre }}</h2>
        <p class="text-gray-600 mt-4 flex-1 line-clamp-3">{{ producto.descripcion || 'Sin descripción disponible.' }}</p>
        <div class="mt-6 flex justify-between items-center">
          <span v-if="!catalogo.precios_ocultos" class="text-xl font-bold" :style="{ color: catalogo.color_primario }">
            {{ formatCurrency(producto.precio) }}
          </span>
          <span v-else class="text-sm text-gray-500">Consultar precio</span>
          <button @click="emit('ver-ficha', producto)" class="px-4 py-2 text-sm font-semibold text-white rounded-md" :style="{ backgroundColor: catalogo.color_primario }">
            Ver Ficha
          </button>
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