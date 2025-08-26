<!-- src/views/EditarCatalogoView.vue (Versión Final y Completa) -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'
import ProductSelectorModal from '../components/ProductSelectorModal.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const catalogo = ref(null)
const productosSeleccionados = ref([]) // Array de IDs de productos
const productosInfo = ref([]) // Array de objetos {id, nombre, codigo} para la previsualización
const isModalOpen = ref(false)
const loading = ref(true)
const saving = ref(false)
const fechaCaducidadInput = ref('') // Modelo para el input de tipo 'date'

const catalogoId = route.params.id

// Función auxiliar para formatear la fecha para el input HTML
function formatDateForInput(date) {
  if (!date) return ''
  // new Date() maneja correctamente el formato ISO de Supabase
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Carga los datos iniciales del catálogo y sus productos asociados
async function fetchCatalogo() {
  try {
    loading.value = true
    // Pedimos el catálogo y la información básica de los productos que contiene
    const { data, error } = await supabase
      .from('catalogos')
      .select(`*, catalogo_items(productos(id, nombre, codigo))`)
      .eq('id', catalogoId)
      .single()

    if (error) throw error
    catalogo.value = data
    
    // Poblamos nuestros estados locales
    productosSeleccionados.value = data.catalogo_items.map(item => item.productos.id)
    productosInfo.value = data.catalogo_items.map(item => item.productos)
    
    // Formateamos la fecha de caducidad para mostrarla en el input
    fechaCaducidadInput.value = formatDateForInput(data.fecha_caducidad)

  } catch (error) {
    showToast('Error al cargar el catálogo: ' + error.message, 'error')
    router.push('/admin/catalogos')
  } finally {
    loading.value = false
  }
}

onMounted(fetchCatalogo)

// Cuando el modal de selección se guarda, actualizamos la previsualización
async function handleGuardarSeleccion(nuevaSeleccionIds) {
  productosSeleccionados.value = nuevaSeleccionIds
  isModalOpen.value = false
  
  if (nuevaSeleccionIds.length > 0) {
    const { data, error } = await supabase
      .from('productos')
      .select('id, nombre, codigo')
      .in('id', nuevaSeleccionIds)
    if (error) {
      showToast('Error al cargar previsualización de productos.', 'error')
      productosInfo.value = []
    } else {
      productosInfo.value = data
    }
  } else {
    productosInfo.value = []
  }
}

// Permite quitar un producto desde la lista de previsualización
function quitarProducto(productoId) {
  productosSeleccionados.value = productosSeleccionados.value.filter(id => id !== productoId)
  productosInfo.value = productosInfo.value.filter(p => p.id !== productoId)
}

// Función principal para guardar todos los cambios
async function handleActualizarCatalogo() {
  try {
    saving.value = true
    
    // Convierte la fecha del input a un formato ISO para Supabase, o null si está vacío
    const fechaParaGuardar = fechaCaducidadInput.value ? new Date(fechaCaducidadInput.value).toISOString() : null

    // 1. Actualizar los datos principales en la tabla 'catalogos'
    const { error: catalogoError } = await supabase
      .from('catalogos')
      .update({
        titulo: catalogo.value.titulo,
        nombre_cliente: catalogo.value.nombre_cliente,
        color_primario: catalogo.value.color_primario,
        color_fondo: catalogo.value.color_fondo,
        fecha_caducidad: fechaParaGuardar,
      })
      .eq('id', catalogoId)
    if (catalogoError) throw catalogoError

    // 2. Sincronizar la tabla 'catalogo_items'
    // Primero, borramos todas las entradas antiguas para este catálogo
    await supabase.from('catalogo_items').delete().eq('catalogo_id', catalogoId)
    
    // Luego, si hay productos seleccionados, los volvemos a insertar
    if (productosSeleccionados.value.length > 0) {
      const itemsParaInsertar = productosSeleccionados.value.map(id => ({ catalogo_id: catalogoId, producto_id: id }))
      const { error: itemsError } = await supabase.from('catalogo_items').insert(itemsParaInsertar)
      if (itemsError) throw itemsError
    }

    showToast('¡Catálogo actualizado con éxito!', 'success')
    router.push('/admin/catalogos')

  } catch (error) {
    showToast('Error al actualizar el catálogo: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

// La función slugify y la propiedad computada slugComputado no son necesarias aquí
// porque el slug se genera una sola vez al crear el catálogo y no debería cambiar.
</script>

<template>
  <div>
    <ProductSelectorModal
      v-if="isModalOpen"
      :seleccionados-iniciales="productosSeleccionados"
      @cerrar="isModalOpen = false"
      @guardar="handleGuardarSeleccion"
    />

    <h1 class="text-3xl font-bold mb-6">Editar Catálogo</h1>

    <div v-if="loading" class="text-center py-10">Cargando datos del catálogo...</div>

    <form v-else-if="catalogo" @submit.prevent="handleActualizarCatalogo" class="space-y-8">
      <!-- Sección de Datos del Catálogo -->
      <div class="p-8 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">1. Datos del Catálogo</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="titulo">Título del Catálogo</label>
            <input v-model="catalogo.titulo" type="text" id="titulo" required>
          </div>
          <div>
            <label for="cliente">Nombre del Cliente</label>
            <input v-model="catalogo.nombre_cliente" type="text" id="cliente">
          </div>
          <div>
            <label for="color_primario">Color Primario</label>
            <input v-model="catalogo.color_primario" type="color" id="color_primario">
          </div>
          <div>
            <label for="color_fondo">Color de Fondo</label>
            <input v-model="catalogo.color_fondo" type="color" id="color_fondo">
          </div>
          <div class="md:col-span-2">
            <label for="fecha_caducidad">Fecha de Caducidad (opcional)</label>
            <input v-model="fechaCaducidadInput" type="date" id="fecha_caducidad">
            <p class="text-xs text-gray-500 mt-1">El catálogo se desactivará después de esta fecha. Déjalo en blanco para que nunca caduque.</p>
          </div>
        </div>
      </div>

      <!-- Sección de Selección de Productos -->
      <div class="p-8 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">2. Seleccionar Productos</h2>
        <div class="p-4 border border-gray-200 rounded-md flex items-center justify-between">
          <p class="text-gray-700">
            <span class="font-bold text-blue-600">{{ productosSeleccionados.length }}</span> productos seleccionados.
          </p>
          <button @click="isModalOpen = true" type="button" class="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Seleccionar / Editar Selección
          </button>
        </div>
        
        <div v-if="productosInfo.length > 0" class="mt-4 border-t pt-4">
          <h3 class="text-md font-semibold text-gray-700 mb-2">Productos en este catálogo:</h3>
          <ul class="max-h-60 overflow-y-auto space-y-2 pr-2">
            <li v-for="producto in productosInfo" :key="producto.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-md hover:bg-gray-100">
              <div>
                <span class="font-medium text-sm">{{ producto.nombre }}</span>
                <span class="text-xs text-gray-500 ml-2">({{ producto.codigo }})</span>
              </div>
              <button @click="quitarProducto(producto.id)" type="button" class="text-red-500 hover:text-red-700 text-sm font-semibold">Quitar</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="flex justify-end gap-4">
        <RouterLink to="/admin/catalogos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
input[type="text"], input[type="date"] {
  @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500;
}
input[type="color"] {
  @apply mt-1 h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer;
}
label {
  @apply block text-sm font-medium text-gray-700;
}
</style>