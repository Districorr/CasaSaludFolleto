<!-- src/components/ListaCotizacionModal.vue (Versión Robusta y Corregida) -->
<script setup>
import { ref, watch, onMounted } from 'vue'
import { useListaCotizacion } from '../composables/useListaCotizacion'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({
  catalogo: Object,
})

const emit = defineEmits(['cerrar'])

const { listaComoArray, quitarProducto, limpiarLista } = useListaCotizacion()

const productosEnLista = ref([])
const loading = ref(true)

// --- NUEVA LÓGICA ---
// Esta función busca la información de los productos basándose en los IDs de la lista.
async function fetchProductosDeLista() {
  loading.value = true
  productosEnLista.value = [] // Limpiamos para evitar datos viejos

  const ids = listaComoArray.value
  if (ids.length === 0) {
    loading.value = false
    return
  }

  try {
    const { data, error } = await supabase
      .from('productos')
      .select('id, codigo, nombre, producto_imagenes(imagen_url)')
      .in('id', ids)
    
    if (error) throw error

    // Reordenamos los resultados para que coincidan con el orden de selección del usuario
    const productosMap = new Map(data.map(p => [p.id, p]))
    productosEnLista.value = ids.map(id => productosMap.get(id)).filter(Boolean)

  } catch (error) {
    console.error("Error al cargar productos de la lista:", error)
  } finally {
    loading.value = false
  }
}

// Observamos cambios en la lista de IDs. Si cambia, volvemos a buscar los datos.
// Esto asegura que si el usuario quita un producto, la lista se actualiza.
watch(listaComoArray, fetchProductosDeLista)

// Buscamos los datos la primera vez que el modal se monta.
onMounted(fetchProductosDeLista)


function enviarConsultaWhatsApp() {
  if (productosEnLista.value.length === 0) return
  let mensaje = `¡Hola! Quisiera consultar por los siguientes productos del catálogo '${props.catalogo.titulo}':\n\n`
  productosEnLista.value.forEach(p => {
    mensaje += `- ${p.nombre} (Código: ${p.codigo || 'N/A'})\n`
  })
  const mensajeCodificado = encodeURIComponent(mensaje)
  const numeroWhatsApp = '5493704357985'
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`, '_blank')
  limpiarLista()
  emit('cerrar')
}
</script>

<template>
  <div @click.self="emit('cerrar')" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
      <header class="p-4 border-b flex justify-between items-center">
        <h2 class="text-xl font-semibold">Mi Lista de Consulta</h2>
        <button @click="emit('cerrar')" class="text-gray-400 hover:text-gray-600">&times;</button>
      </header>

      <main class="flex-1 overflow-y-auto p-4">
        <div v-if="loading" class="text-center text-gray-500 py-8">Cargando...</div>
        <div v-else-if="productosEnLista.length === 0" class="text-center text-gray-500 py-8">
          Tu lista está vacía.
        </div>
        <ul v-else class="space-y-3">
          <li v-for="producto in productosEnLista" :key="producto.id"
              class="flex items-center gap-4 p-2 bg-gray-50 rounded-md">
            <img v-if="producto.producto_imagenes && producto.producto_imagenes.length > 0" 
                 :src="producto.producto_imagenes[0].imagen_url" 
                 class="w-12 h-12 object-cover rounded-md flex-shrink-0">
            <div v-else class="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0"></div>
            <div class="flex-1">
              <p class="font-medium text-sm">{{ producto.nombre }}</p>
              <p class="text-xs text-gray-500">Código: {{ producto.codigo || 'N/A' }}</p>
            </div>
            <button @click="quitarProducto(producto.id)" title="Quitar de la lista"
                    class="p-1 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </li>
        </ul>
      </main>

      <footer class="p-4 border-t flex justify-between items-center bg-gray-50">
        <button @click="limpiarLista" class="text-sm text-gray-600 hover:text-red-600">
          Vaciar Lista
        </button>
        <button @click="enviarConsultaWhatsApp" 
                :disabled="productosEnLista.length === 0"
                class="px-6 py-3 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-300 flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.523.074-.797.372-.273.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
          <span>Enviar Consulta por WhatsApp</span>
        </button>
      </footer>
    </div>
  </div>
</template>