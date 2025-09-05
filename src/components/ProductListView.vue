<!-- src/components/ProductListView.vue (con "Añadir a Lista") -->
<script setup>
import { useListaCotizacion } from '../composables/useListaCotizacion'

defineProps({
  productos: Array,
  catalogo: Object,
})

const emit = defineEmits(['ver-ficha'])

const { alternarProducto, estaEnLista } = useListaCotizacion()

function formatCurrency(value) {
  if (typeof value !== 'number') return '$ 0,00'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}
</script>

<template>
  <div class="space-y-4">
    <div v-for="producto in productos" :key="producto.id" 
         class="bg-white rounded-lg shadow-md p-4 flex items-center gap-4 transition-shadow hover:shadow-lg">
      
      <img v-if="producto.producto_imagenes && producto.producto_imagenes.length > 0" 
           :src="producto.producto_imagenes[0].imagen_url" 
           :alt="producto.nombre" 
           loading="lazy" 
           class="w-20 h-20 object-cover rounded-md flex-shrink-0">
      <div v-else class="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0"></div>
      
      <div class="flex-1">
        <h2 class="font-bold text-gray-800">{{ producto.nombre }}</h2>
        <p class="text-sm text-gray-500">Código: {{ producto.codigo || 'N/A' }}</p>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex flex-col items-end">
          <span v-if="!catalogo.precios_ocultos" class="font-semibold" :style="{ color: catalogo.color_primario }">
            {{ formatCurrency(producto.precio) }}
          </span>
          <button @click="emit('ver-ficha', producto)" class="mt-1 px-3 py-1 text-sm font-semibold text-white rounded-md" :style="{ backgroundColor: catalogo.color_primario }">
            Ver Ficha
          </button>
        </div>
        
        <!-- === INICIO DE CAMBIOS === -->
        <button 
          @click="alternarProducto(producto.id)"
          class="p-2 rounded-full transition-colors duration-200 flex-shrink-0"
          :class="estaEnLista(producto.id) ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600 hover:bg-blue-100 hover:text-blue-600'"
          :title="estaEnLista(producto.id) ? 'Quitar de la lista' : 'Añadir a la lista de cotización'"
        >
          <svg v-if="estaEnLista(producto.id)" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        </button>
        <!-- === FIN DE CAMBIOS === -->
      </div>
    </div>
  </div>
</template>