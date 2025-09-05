<!-- src/components/CatalogoFilters.vue -->
<script setup>
// Este componente es muy "tonto" (dumb). No tiene lógica propia, solo
// recibe datos (props) y emite eventos cuando el usuario interactúa.

defineProps({
  // Usamos 'modelValue' para poder usar v-model en el componente padre.
  // Estas props recibirán las variables reactivas desde nuestro composable.
  searchTerm: String,
  sortOrder: String,
  activeCategory: String,
  vistaActiva: String,
  
  // Recibimos la lista de categorías para generar los botones.
  categories: Array,
})

// Definimos los eventos que este componente puede emitir.
// El formato 'update:propName' es la convención para que v-model funcione.
const emit = defineEmits([
  'update:searchTerm',
  'update:sortOrder',
  'update:activeCategory',
  'update:vistaActiva',
])

// Función simple para manejar el clic en una categoría.
function selectCategory(category) {
  emit('update:activeCategory', category)
}
</script>

<template>
  <nav class="no-print sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm p-4">
    <div class="container mx-auto">
      <!-- Fila superior: Búsqueda, Ordenamiento y Selector de Vista -->
      <div class="flex flex-col md:flex-row gap-4 items-center">
        <input 
          :value="searchTerm"
          @input="$emit('update:searchTerm', $event.target.value)"
          type="text" 
          placeholder="Buscar en el catálogo..." 
          class="w-full md:w-auto md:flex-1 px-4 py-2 border rounded-full"
        >
        <select 
          :value="sortOrder"
          @change="$emit('update:sortOrder', $event.target.value)"
          class="w-full md:w-auto px-4 py-2 border rounded-full"
        >
          <option value="nombre-asc">Ordenar por Nombre (A-Z)</option>
          <option value="precio-asc">Ordenar por Precio (Menor a Mayor)</option>
          <option value="precio-desc">Ordenar por Precio (Mayor a Menor)</option>
        </select>
        
        <div class="flex border border-gray-300 rounded-full">
          <button @click="$emit('update:vistaActiva', 'grid')" title="Vista de Tarjetas" class="p-2 rounded-l-full" :class="vistaActiva === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
          </button>
          <button @click="$emit('update:vistaActiva', 'list')" title="Vista de Lista" class="p-2 rounded-r-full border-l border-gray-300" :class="vistaActiva === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
          </button>
        </div>
      </div>
      
      <!-- Fila inferior: Filtros de Categoría -->
      <div class="mt-4 flex flex-wrap gap-2 justify-center">
        <button v-for="cat in categories" :key="cat" @click="selectCategory(cat)"
          :class="[
            'px-3 py-1 text-sm font-medium rounded-full transition-colors',
            activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          ]">
          {{ cat }}
        </button>
      </div>
    </div>
  </nav>
</template>