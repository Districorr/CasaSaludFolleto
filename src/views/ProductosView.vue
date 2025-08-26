<!-- src/views/ProductosView.vue (Versión "Next Level") -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { RouterLink } from 'vue-router'
import { useToast } from '../lib/useToast'
import ConfirmModal from '../components/ConfirmModal.vue'

const { showToast } = useToast()

// --- ESTADO PRINCIPAL ---
const todosLosProductos = ref([]) // La lista completa, sin filtrar
const loading = ref(true)
const errorMessage = ref(null)

// --- ESTADO PARA BÚSQUEDA Y FILTROS ---
const searchTerm = ref('')
const filtroMarca = ref('')
const filtroCategoria = ref('')

// --- ESTADO PARA PAGINACIÓN ---
const currentPage = ref(1)
const itemsPerPage = ref(10) // Puedes ajustar este número

// --- ESTADO PARA ELIMINACIÓN ---
const showDeleteModal = ref(false)
const productoAEliminar = ref(null)

// --- PROPIEDADES COMPUTADAS (LA MAGIA) ---

// Genera listas únicas de marcas y categorías para los filtros
const uniqueMarcas = computed(() => [...new Set(todosLosProductos.value.map(p => p.marca).filter(Boolean))].sort())
const uniqueCategorias = computed(() => [...new Set(todosLosProductos.value.map(p => p.categoria).filter(Boolean))].sort())

// Filtra los productos basándose en todos los criterios
const filteredProductos = computed(() => {
  let productos = todosLosProductos.value

  // 1. Filtro por búsqueda
  if (searchTerm.value) {
    const lowerCaseSearch = searchTerm.value.toLowerCase()
    productos = productos.filter(p =>
      p.nombre.toLowerCase().includes(lowerCaseSearch) ||
      (p.codigo && p.codigo.toLowerCase().includes(lowerCaseSearch)) ||
      (p.marca && p.marca.toLowerCase().includes(lowerCaseSearch)) ||
      (p.categoria && p.categoria.toLowerCase().includes(lowerCaseSearch))
    )
  }
  // 2. Filtro por marca
  if (filtroMarca.value) {
    productos = productos.filter(p => p.marca === filtroMarca.value)
  }
  // 3. Filtro por categoría
  if (filtroCategoria.value) {
    productos = productos.filter(p => p.categoria === filtroCategoria.value)
  }
  return productos
})

// Calcula el número total de páginas
const totalPages = computed(() => Math.ceil(filteredProductos.value.length / itemsPerPage.value))

// Devuelve solo los productos para la página actual
const paginatedProductos = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProductos.value.slice(start, end)
})

// --- FUNCIONES ---

async function fetchProductos() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('productos')
      .select('id, codigo, nombre, marca, categoria, precio')
      .order('nombre', { ascending: true }) // Ordenar alfabéticamente por nombre

    if (error) throw error
    todosLosProductos.value = data
  } catch (error) {
    errorMessage.value = 'Error al cargar los productos: ' + error.message
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) { /* ... (sin cambios) ... */
  if (typeof value !== 'number') return '$ 0,00'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value)
}

function pedirConfirmacionEliminar(producto) {
  productoAEliminar.value = producto
  showDeleteModal.value = true
}

async function handleEliminarProducto() {
  if (!productoAEliminar.value) return
  try {
    const { error } = await supabase.from('productos').delete().eq('id', productoAEliminar.value.id)
    if (error) throw error
    
    todosLosProductos.value = todosLosProductos.value.filter(p => p.id !== productoAEliminar.value.id)
    showToast('Producto eliminado con éxito.', 'success')
  } catch (error) {
    showToast('Error al eliminar el producto: ' + error.message, 'error')
  } finally {
    showDeleteModal.value = false
    productoAEliminar.value = null
  }
}

function resetFilters() {
  searchTerm.value = ''
  filtroMarca.value = ''
  filtroCategoria.value = ''
  currentPage.value = 1
}

function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++ }
function prevPage() { if (currentPage.value > 1) currentPage.value-- }

onMounted(fetchProductos)
</script>

<template>
  <div>
    <ConfirmModal
      v-if="showDeleteModal"
      titulo="Eliminar Producto"
      :mensaje="`¿Estás seguro de que quieres eliminar '${productoAEliminar?.nombre}'? Esta acción no se puede deshacer.`"
      @confirmar="handleEliminarProducto"
      @cancelar="showDeleteModal = false"
    />

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Gestión de Productos</h1>
      <div class="flex gap-4">
        <RouterLink to="/admin/productos/importar" class="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700">Importar</RouterLink>
        <RouterLink to="/admin/productos/nuevo" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">Crear Producto</RouterLink>
      </div>
    </div>

    <!-- Barra de Filtros y Búsqueda -->
    <div class="p-4 bg-white rounded-lg shadow mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
      <input v-model="searchTerm" type="text" placeholder="Buscar producto..." class="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md">
      <select v-model="filtroMarca" class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md">
        <option value="">Todas las Marcas</option>
        <option v-for="marca in uniqueMarcas" :key="marca" :value="marca">{{ marca }}</option>
      </select>
      <select v-model="filtroCategoria" class="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md">
        <option value="">Todas las Categorías</option>
        <option v-for="cat in uniqueCategorias" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <button @click="resetFilters" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Limpiar</button>
    </div>

    <div v-if="loading" class="text-center text-gray-500 py-10">Cargando productos...</div>
    <div v-if="errorMessage" class="p-4 text-red-700 bg-red-100 rounded-md">{{ errorMessage }}</div>

    <div v-if="!loading && !errorMessage" class="bg-white rounded-lg shadow">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <!-- ... (thead es igual que antes) ... -->
          <thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th><th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th></tr></thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="paginatedProductos.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-gray-500">No se encontraron productos que coincidan con los filtros.</td>
            </tr>
            <tr v-for="producto in paginatedProductos" :key="producto.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ producto.codigo }}</td>
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{{ producto.nombre }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ producto.marca }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ producto.categoria }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{{ formatCurrency(producto.precio) }}</td>
              <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-medium">
                <RouterLink :to="`/admin/productos/editar/${producto.id}`" class="text-indigo-600 hover:text-indigo-900">Editar</RouterLink>
                <button @click="pedirConfirmacionEliminar(producto)" class="ml-4 text-red-600 hover:text-red-900">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Controles de Paginación -->
      <div v-if="totalPages > 1" class="p-4 flex items-center justify-between border-t">
        <span class="text-sm text-gray-700">
          Mostrando {{ filteredProductos.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} - {{ Math.min(currentPage * itemsPerPage, filteredProductos.length) }} de {{ filteredProductos.length }} productos
        </span>
        <div class="flex gap-2">
          <button @click="prevPage" :disabled="currentPage === 1" class="px-3 py-1 border rounded-md disabled:opacity-50">Anterior</button>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="px-3 py-1 border rounded-md disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>