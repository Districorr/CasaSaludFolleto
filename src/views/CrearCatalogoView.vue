<!-- src/views/CrearCatalogoView.vue -->
<script setup>
// src/views/CrearCatalogoView.vue -> <script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'
import ProductSelectorModal from '../components/ProductSelectorModal.vue' // <-- IMPORTAR EL MODAL

const router = useRouter()
const { showToast } = useToast()

const catalogo = ref({
  titulo: '',
  nombre_cliente: '',
  color_primario: '#3B82F6',
  color_fondo: '#F9FAFB',
})

const productosSeleccionados = ref([]) // Sigue siendo nuestro array de IDs
const isModalOpen = ref(false) // <-- Nuevo estado para controlar el modal
const saving = ref(false)

function slugify(text) { /* ... (la función slugify no cambia) ... */
  return text.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-')
}

const slugComputado = computed(() => slugify(catalogo.value.titulo))

// --- NUEVAS FUNCIONES PARA MANEJAR EL MODAL ---
function handleGuardarSeleccion(nuevaSeleccion) {
  productosSeleccionados.value = nuevaSeleccion
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

    const { data: nuevoCatalogo, error: catalogoError } = await supabase
      .from('catalogos')
      .insert({ ...catalogo.value, slug: slugComputado.value, creado_por: user.id })
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
<!-- src/views/CrearCatalogoView.vue -> <template> -->
<template>
  <!-- El modal se mostrará por encima de todo cuando isModalOpen sea true -->
  <ProductSelectorModal
    v-if="isModalOpen"
    :seleccionados-iniciales="productosSeleccionados"
    @cerrar="isModalOpen = false"
    @guardar="handleGuardarSeleccion"
  />

  <div>
    <h1 class="text-3xl font-bold mb-6">Crear Nuevo Catálogo</h1>

    <form @submit.prevent="handleCrearCatalogo" class="space-y-8">
      <!-- Sección de Datos Generales (no cambia) -->
      <div class="p-8 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">1. Datos del Catálogo</h2>
        <!-- ... (todo el contenido de esta sección es igual que antes) ... -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div><label for="titulo" class="block text-sm font-medium text-gray-700">Título del Catálogo</label><input v-model="catalogo.titulo" type="text" id="titulo" required class="mt-1 block w-full input-form"></div>
          <div><label for="cliente" class="block text-sm font-medium text-gray-700">Nombre del Cliente</label><input v-model="catalogo.nombre_cliente" type="text" id="cliente" class="mt-1 block w-full input-form"></div>
          <div class="md:col-span-2"><label for="slug" class="block text-sm font-medium text-gray-700">Link Público (se genera automáticamente)</label><div class="mt-1 flex rounded-md shadow-sm"><span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">/c/</span><input :value="slugComputado" type="text" id="slug" disabled class="flex-1 block w-full rounded-none rounded-r-md bg-gray-100 input-form"></div></div>
          <div><label for="color_primario" class="block text-sm font-medium text-gray-700">Color Primario</label><input v-model="catalogo.color_primario" type="color" id="color_primario" class="mt-1 h-10 w-full"></div>
          <div><label for="color_fondo" class="block text-sm font-medium text-gray-700">Color de Fondo</label><input v-model="catalogo.color_fondo" type="color" id="color_fondo" class="mt-1 h-10 w-full"></div>
        </div>
      </div>

      <!-- --- SECCIÓN DE SELECCIÓN DE PRODUCTOS (MODIFICADA) --- -->
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
      </div>
      <!-- ---------------------------------------------------- -->

      <!-- Botones de Acción (no cambia) -->
      <div class="flex justify-end gap-4">
        <RouterLink to="/admin/catalogos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {{ saving ? 'Guardando...' : 'Guardar Catálogo' }}
        </button>
      </div>
    </form>
  </div>
</template>