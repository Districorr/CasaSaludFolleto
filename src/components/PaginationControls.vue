<!-- src/components/PaginationControls.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
})

const emit = defineEmits(['change-page'])

// Propiedad computada para generar los números de página a mostrar
// Muestra los primeros, los últimos y los cercanos a la página actual
const pages = computed(() => {
  if (props.totalPages <= 7) {
    return Array.from({ length: props.totalPages }, (_, i) => i + 1)
  }

  const pagesToShow = new Set()
  pagesToShow.add(1)
  pagesToShow.add(props.totalPages)

  for (let i = -1; i <= 1; i++) {
    if (props.currentPage + i > 1 && props.currentPage + i < props.totalPages) {
      pagesToShow.add(props.currentPage + i)
    }
  }

  const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b)
  const result = []

  for (let i = 0; i < sortedPages.length; i++) {
    result.push(sortedPages[i])
    if (i < sortedPages.length - 1 && sortedPages[i+1] - sortedPages[i] > 1) {
      result.push('...') // Añadimos puntos suspensivos si hay un salto
    }
  }
  return result
})
</script>

<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-12">
    <!-- Botón Anterior -->
    <button 
      @click="emit('change-page', currentPage - 1)"
      :disabled="currentPage === 1"
      class="pagination-button"
    >
      &lt; Anterior
    </button>

    <!-- Números de Página -->
    <template v-for="(page, index) in pages" :key="index">
      <span v-if="page === '...'" class="px-4 py-2 text-gray-500">...</span>
      <button v-else
        @click="emit('change-page', page)"
        class="pagination-button"
        :class="{ 'bg-blue-600 text-white': page === currentPage }"
      >
        {{ page }}
      </button>
    </template>

    <!-- Botón Siguiente -->
    <button 
      @click="emit('change-page', currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="pagination-button"
    >
      Siguiente &gt;
    </button>
  </nav>
</template>

<style scoped>
.pagination-button {
  @apply px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>