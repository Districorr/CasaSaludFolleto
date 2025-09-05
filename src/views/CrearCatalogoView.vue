<!-- src/views/CrearCatalogoView.vue (Versión Final y Completa) -->
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'
import ProductSelectorModal from '../components/ProductSelectorModal.vue'

const router = useRouter()
const { showToast } = useToast()

// Estado del formulario, ahora con las nuevas propiedades
const catalogo = ref({
  titulo: '',
  nombre_cliente: '',
  color_primario: '#3B82F6',
  color_fondo: '#F9FAFB',
  precios_ocultos: false, // Por defecto, los precios se muestran
})
const fechaCaducidadInput = ref('') // Modelo separado para el input de fecha

const productosSeleccionados = ref([])
const isModalOpen = ref(false)
const saving = ref(false)

function slugify(text) {
  return text.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
}

const slugComputado = computed(() => slugify(catalogo.value.titulo))

async function handleGuardarSeleccion(nuevaSeleccionIds) {
  productosSeleccionados.value = nuevaSeleccionIds
  isModalOpen.value = false
}

async function handleCrearCatalogo() {
  if (productosSeleccionados.value.length === 0) {
    showToast('Debes seleccionar al menos un producto.', 'error')
    return
  }
  
  try {
    saving.value = true
    const { data: { user } } = await supabase.auth.getUser()

    const fechaParaGuardar = fechaCaducidadInput.value ? new Date(fechaCaducidadInput.value).toISOString() : null

    const { data: nuevoCatalogo, error: catalogoError } = await supabase
      .from('catalogos')
      .insert({
        ...catalogo.value,
        slug: slugComputado.value,
        fecha_caducidad: fechaParaGuardar,
        creado_por: user.id,
      })
      .select()
      .single()

    if (catalogoError) throw catalogoError

    const itemsParaInsertar = productosSeleccionados.value.map(productoId => ({
      catalogo_id: nuevoCatalogo.id,
      producto_id: productoId,
    }))

    const { error: itemsError } = await supabase.from('catalogo_items').insert(itemsParaInsertar)
    if (itemsError) throw itemsError

    showToast('¡Catálogo creado con éxito!', 'success')
    router.push('/admin/catalogos')

  } catch (error) {
    showToast('Error al guardar el catálogo: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <ProductSelectorModal
      v-if="isModalOpen"
      :seleccionados-iniciales="productosSeleccionados"
      @cerrar="isModalOpen = false"
      @guardar="handleGuardarSeleccion"
    />

    <h1 class="text-3xl font-bold mb-6">Crear Nuevo Catálogo</h1>

    <form @submit.prevent="handleCrearCatalogo" class="space-y-8">
      <div class="p-8 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">1. Datos y Personalización</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="titulo">Título del Catálogo</label>
            <input v-model="catalogo.titulo" type="text" id="titulo" required>
          </div>
          <div>
            <label for="cliente">Nombre del Cliente</label>
            <input v-model="catalogo.nombre_cliente" type="text" id="cliente">
          </div>
          <div class="md:col-span-2">
            <label for="slug">Link Público (se genera automáticamente)</label>
            <div class="mt-1 flex rounded-md shadow-sm">
              <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">/c/</span>
              <input :value="slugComputado" type="text" id="slug" disabled class="flex-1 block w-full rounded-none rounded-r-md bg-gray-100">
            </div>
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
          <div class="md:col-span-2 flex items-center pt-4 border-t">
            <input 
              v-model="catalogo.precios_ocultos" 
              type="checkbox" 
              id="precios_ocultos" 
              class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            >
            <label for="precios_ocultos" class="ml-3 block text-sm font-medium text-gray-900">
              Ocultar todos los precios en este catálogo
            </label>
          </div>
        </div>
      </div>

      <div class="p-8 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">2. Productos Incluidos</h2>
        <div class="p-4 border border-gray-200 rounded-md flex items-center justify-between">
          <p class="text-gray-700">
            <span class="font-bold text-blue-600">{{ productosSeleccionados.length }}</span> productos seleccionados.
          </p>
          <button @click="isModalOpen = true" type="button" class="px-4 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
            Seleccionar Productos
          </button>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <RouterLink to="/admin/catalogos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {{ saving ? 'Guardando...' : 'Guardar Catálogo' }}
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