<!-- src/views/CatalogosView.vue (Versión Final y Completa) -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { RouterLink } from 'vue-router'
import { useToast } from '../lib/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { showToast } = useToast()
const catalogos = ref([])
const loading = ref(true)
const errorMessage = ref(null)
const searchTerm = ref('')

// --- ESTADO PARA ELIMINACIÓN ---
const showDeleteModal = ref(false)
const catalogoAEliminar = ref(null)

const baseUrl = computed(() => window.location.origin)

// Propiedad computada para filtrar los catálogos según la búsqueda
const filteredCatalogos = computed(() => {
  if (!searchTerm.value) {
    return catalogos.value
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return catalogos.value.filter(c =>
    c.titulo.toLowerCase().includes(lowerCaseSearch) ||
    (c.nombre_cliente && c.nombre_cliente.toLowerCase().includes(lowerCaseSearch))
  )
})

async function fetchCatalogos() {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("Usuario no autenticado.")

    // Pedimos el catálogo y el conteo de sus productos asociados
    const { data, error } = await supabase
      .from('catalogos')
      .select('*, catalogo_items(count)')
      .eq('creado_por', user.id)
      .order('creado_en', { ascending: false })

    if (error) throw error
    catalogos.value = data
  } catch (error) {
    errorMessage.value = 'Error al cargar los catálogos: ' + error.message
  } finally {
    loading.value = false
  }
}

function copiarLink(slug) {
  const link = `${baseUrl.value}/c/${slug}`
  navigator.clipboard.writeText(link).then(() => {
    showToast('¡Link copiado al portapapeles!', 'success')
  }).catch(() => {
    showToast('No se pudo copiar el link.', 'error')
  })
}

function pedirConfirmacionEliminar(catalogo) {
  catalogoAEliminar.value = catalogo
  showDeleteModal.value = true
}

async function handleEliminarCatalogo() {
  if (!catalogoAEliminar.value) return
  try {
    const { error } = await supabase
      .from('catalogos')
      .delete()
      .eq('id', catalogoAEliminar.value.id)
    
    if (error) throw error

    catalogos.value = catalogos.value.filter(c => c.id !== catalogoAEliminar.value.id)
    showToast('Catálogo eliminado con éxito.', 'success')
  } catch (error) {
    showToast('Error al eliminar el catálogo: ' + error.message, 'error')
  } finally {
    showDeleteModal.value = false
    catalogoAEliminar.value = null
  }
}

function formatFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })
}

onMounted(fetchCatalogos)
</script>

<template>
  <div>
    <ConfirmModal
      v-if="showDeleteModal"
      titulo="Eliminar Catálogo"
      :mensaje="`¿Estás seguro de que quieres eliminar el catálogo '${catalogoAEliminar?.titulo}'? Esta acción no se puede deshacer.`"
      @confirmar="handleEliminarCatalogo"
      @cancelar="showDeleteModal = false"
    />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestión de Catálogos</h1>
      <RouterLink to="/admin/catalogos/nuevo" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
        Crear Catálogo
      </RouterLink>
    </div>

    <div class="mb-4">
      <input 
        v-model="searchTerm"
        type="text" 
        placeholder="Buscar por título o cliente..."
        class="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      >
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Cargando catálogos...</div>
    <div v-if="errorMessage" class="p-4 text-red-700 bg-red-100 rounded-md">{{ errorMessage }}</div>

    <div v-if="!loading && !errorMessage">
      <div v-if="catalogos.length > 0" class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Productos</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Creación</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="catalogo in filteredCatalogos" :key="catalogo.id">
              <td class="px-6 py-4 whitespace-nowrap font-medium">
                <a :href="`/c/${catalogo.slug}`" target="_blank" class="text-blue-600 hover:underline">{{ catalogo.titulo }}</a>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ catalogo.nombre_cliente }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="!catalogo.fecha_caducidad || new Date(catalogo.fecha_caducidad) > new Date()"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Activo
                </span>
                <span v-else
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                  Expirado
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">{{ catalogo.catalogo_items[0].count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatFecha(catalogo.creado_en) }}</td>
              <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                <button @click="copiarLink(catalogo.slug)" class="text-indigo-600 hover:text-indigo-900" title="Copiar Link">Copiar</button>
                <RouterLink :to="`/admin/catalogos/editar/${catalogo.id}`" class="ml-4 text-green-600 hover:text-green-900" title="Editar">Editar</RouterLink>
                <button @click="pedirConfirmacionEliminar(catalogo)" class="ml-4 text-red-600 hover:text-red-900" title="Eliminar">Eliminar</button>
              </td>
            </tr>
            <tr v-if="filteredCatalogos.length === 0 && catalogos.length > 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No se encontraron catálogos que coincidan con tu búsqueda.</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="text-center py-16 bg-white rounded-lg shadow">
        <h3 class="text-xl font-semibold text-gray-800">Aún no tienes catálogos</h3>
        <p class="mt-2 text-gray-500">¡Empieza a crear folletos personalizados para tus clientes!</p>
        <RouterLink to="/admin/catalogos/nuevo" class="mt-6 inline-block px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Crear mi primer catálogo
        </RouterLink>
      </div>
    </div>
  </div>
</template>