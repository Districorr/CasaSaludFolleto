<!-- src/components/ProductSelectorModal.vue (Versión con Filtro por Marca) -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../lib/supabaseClient'

const props = defineProps({
  seleccionadosIniciales: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['cerrar', 'guardar'])

// --- ESTADO INTERNO ---
const todosLosProductos = ref([])
const loading = ref(true)
const searchTerm = ref('')
const filtroMarca = ref('') // <-- Nuevo estado para el filtro de marca

const seleccionadosIds = ref(new Set(props.seleccionadosIniciales))

// --- PROPIEDADES COMPUTADAS ---

// Genera una lista única de marcas para el menú desplegable
const uniqueMarcas = computed(() => {
  const marcas = todosLosProductos.value.map(p => p.marca).filter(Boolean) // Filtra nulos o vacíos
  return [...new Set(marcas)].sort()
})

// Lista de productos DISPONIBLES (filtrada por búsqueda Y marca)
const productosDisponibles = computed(() => {
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  
  return todosLosProductos.value.filter(p => {
    // Condición 1: No debe estar ya seleccionado
    const noSeleccionado = !seleccionadosIds.value.has(p.id)
    if (!noSeleccionado) return false

    // Condición 2: Debe coincidir con la marca seleccionada (si hay alguna)
    if (filtroMarca.value && p.marca !== filtroMarca.value) {
      return false
    }

    // Condición 3: Debe coincidir con el término de búsqueda (si hay alguno)
    if (searchTerm.value) {
      const coincideBusqueda = p.nombre.toLowerCase().includes(lowerCaseSearch) ||
                             (p.codigo && p.codigo.toLowerCase().includes(lowerCaseSearch))
      return coincideBusqueda
    }

    // Si no hay término de búsqueda, pasa el filtro
    return true
  })
})

// Lista de productos SELECCIONADOS
const productosSeleccionados = computed(() => {
  const seleccionadosMap = new Map(todosLosProductos.value.map(p => [p.id, p]))
  return Array.from(seleccionadosIds.value)
    .map(id => seleccionadosMap.get(id))
    .filter(Boolean)
})

// --- FUNCIONES DE MANEJO ---

function anadirProducto(productoId) {
  seleccionadosIds.value.add(productoId)
}

function quitarProducto(productoId) {
  seleccionadosIds.value.delete(productoId)
}

function guardarSeleccion() {
  emit('guardar', Array.from(seleccionadosIds.value))
}

async function fetchTodosLosProductos() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('productos')
      .select('id, codigo, nombre, marca')
      .order('nombre', { ascending: true })
    if (error) throw error
    todosLosProductos.value = data
  } catch (error) {
    console.error("Error cargando productos para el modal:", error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchTodosLosProductos)
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
      <!-- Encabezado -->
      <header class="p-4 border-b">
        <h2 class="text-xl font-semibold">Seleccionar Productos</h2>
      </header>

      <!-- Cuerpo con dos columnas -->
      <main class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-hidden">
        <!-- Columna Izquierda: Disponibles -->
        <div class="flex flex-col border rounded-md overflow-hidden">
          <div class="p-3 bg-gray-50 border-b space-y-2">
            <!-- Barra de Búsqueda -->
            <input 
              v-model="searchTerm"
              type="text" 
              placeholder="Buscar por nombre o código..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
            <!-- Filtro de Marca -->
            <select v-model="filtroMarca" class="w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Todas las Marcas</option>
              <option v-for="marca in uniqueMarcas" :key="marca" :value="marca">{{ marca }}</option>
            </select>
          </div>
          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="loading" class="text-center p-4">Cargando...</div>
            <div v-else>
              <div v-for="producto in productosDisponibles" :key="producto.id"
                   class="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                <div>
                  <p class="font-medium text-sm">{{ producto.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ producto.codigo }} - {{ producto.marca }}</p>
                </div>
                <button @click="anadirProducto(producto.id)" class="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 flex-shrink-0">
                  Añadir
                </button>
              </div>
              <div v-if="productosDisponibles.length === 0 && !loading" class="text-center text-gray-500 p-4 text-sm">
                No hay productos que coincidan con los filtros.
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Seleccionados -->
        <div class="flex flex-col border rounded-md overflow-hidden">
          <div class="p-3 bg-gray-50 border-b">
            <h3 class="font-semibold">Productos en el Catálogo ({{ seleccionadosIds.size }})</h3>
          </div>
          <div class="flex-1 overflow-y-auto p-2">
            <div v-if="productosSeleccionados.length === 0" class="text-center text-gray-500 p-4 text-sm">
              Añade productos desde la lista de la izquierda.
            </div>
            <div v-else>
              <div v-for="producto in productosSeleccionados" :key="producto.id"
                   class="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                <div>
                  <p class="font-medium text-sm">{{ producto.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ producto.codigo }} - {{ producto.marca }}</p>
                </div>
                <button @click="quitarProducto(producto.id)" class="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 flex-shrink-0">
                  Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Pie de Página -->
      <footer class="p-4 border-t flex justify-end gap-4 bg-gray-50">
        <button @click="emit('cerrar')" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
        <button @click="guardarSeleccion" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Guardar Selección
        </button>
      </footer>
    </div>
  </div>
</template>