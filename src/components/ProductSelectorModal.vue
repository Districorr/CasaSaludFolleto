<!-- src/components/ProductSelectorModal.vue -->
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '../lib/supabaseClient'

// --- Props y Emits ---
// 'modelValue' es el estándar en Vue 3 para componentes que usan v-model.
// Recibirá el array de IDs de productos ya seleccionados.
const props = defineProps({
  seleccionadosIniciales: {
    type: Array,
    default: () => []
  }
})

// Definimos los eventos que este componente puede emitir.
const emit = defineEmits(['cerrar', 'guardar'])

// --- Estado Interno del Modal ---
const todosLosProductos = ref([])
const loading = ref(true)
const searchTerm = ref('')
// 'localSeleccionados' es una copia interna para no modificar la prop directamente.
const localSeleccionados = ref([...props.seleccionadosIniciales])

// --- Lógica de Búsqueda ---
// Una propiedad computada que filtra los productos en tiempo real mientras el usuario escribe.
const productosFiltrados = computed(() => {
  if (!searchTerm.value) {
    return todosLosProductos.value
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase()
  return todosLosProductos.value.filter(p => 
    p.nombre.toLowerCase().includes(lowerCaseSearch) ||
    (p.codigo && p.codigo.toLowerCase().includes(lowerCaseSearch)) ||
    (p.marca && p.marca.toLowerCase().includes(lowerCaseSearch))
  )
})

// --- Carga de Datos ---
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

// --- Funciones de Control ---
function guardarSeleccion() {
  emit('guardar', localSeleccionados.value)
}

function cancelar() {
  emit('cerrar')
}
</script>

<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
      <!-- Encabezado del Modal -->
      <header class="p-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold">Seleccionar Productos</h2>
        <input 
          v-model="searchTerm"
          type="text" 
          placeholder="Buscar por nombre, código o marca..."
          class="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
      </header>

      <!-- Cuerpo del Modal (con scroll) -->
      <main class="flex-1 overflow-y-auto p-4">
        <div v-if="loading">Cargando...</div>
        <div v-else class="space-y-2">
          <div v-for="producto in productosFiltrados" :key="producto.id" class="flex items-center p-2 rounded-md hover:bg-gray-100">
            <input 
              :id="`modal-producto-${producto.id}`" 
              :value="producto.id"
              v-model="localSeleccionados"
              type="checkbox" 
              class="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            >
            <label :for="`modal-producto-${producto.id}`" class="ml-3 text-sm text-gray-700 cursor-pointer">
              <span class="font-medium text-gray-900">{{ producto.nombre }}</span>
              <span class="text-gray-500 ml-2">({{ producto.codigo || 'S/C' }} - {{ producto.marca || 'S/M' }})</span>
            </label>
          </div>
          <div v-if="productosFiltrados.length === 0" class="text-center text-gray-500 py-8">
            No se encontraron productos que coincidan con la búsqueda.
          </div>
        </div>
      </main>

      <!-- Pie del Modal -->
      <footer class="p-4 border-t border-gray-200 flex justify-end gap-4 bg-gray-50">
        <button @click="cancelar" class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancelar</button>
        <button @click="guardarSeleccion" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Guardar Selección ({{ localSeleccionados.length }})
        </button>
      </footer>
    </div>
  </div>
</template>