<!-- src/views/ProductosPorCategoriaView.vue -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useSiteConfig } from '../composables/useSiteConfig'
import ProductGridView from '../components/ProductGridView.vue' // Reutilizamos el componente de vista de tarjetas

const route = useRoute()
const { config } = useSiteConfig()

const productos = ref([])
const loading = ref(true)
const error = ref(null)

// Propiedad computada para obtener la información de la categoría actual
const categoriaActual = computed(() => {
  if (!config.value) return null
  // Buscamos en nuestra configuración la categoría que coincide con el slug de la URL
  return config.value.categorias.find(cat => cat.slug === route.params.slug)
})

// Función para cargar los productos de la categoría
async function fetchProductosPorCategoria() {
  if (!categoriaActual.value) return
  try {
    loading.value = true
    // Pedimos a Supabase todos los productos donde la columna 'categoria' coincida
    const { data, error: fetchError } = await supabase
      .from('productos')
      .select('*, producto_imagenes(imagen_url)')
      .eq('categoria', categoriaActual.value.nombre) // La clave es filtrar por el nombre de la categoría
      .order('nombre', { ascending: true })

    if (fetchError) throw fetchError
    productos.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Usamos 'watch' para que si el usuario navega de una categoría a otra,
// la página se recargue con los nuevos productos.
watch(categoriaActual, (newCategoria) => {
  if (newCategoria) {
    fetchProductosPorCategoria()
  }
}, { immediate: true }) // 'immediate: true' hace que se ejecute la primera vez
</script>

<template>
  <div v-if="loading" class="text-center py-20">Cargando productos...</div>
  <div v-else-if="error" class="text-center py-20 text-red-600">Error: {{ error }}</div>
  
  <div v-else-if="categoriaActual" class="py-12">
    <div class="container mx-auto px-4">
      <!-- Encabezado de la Categoría -->
      <div class="text-center mb-12">
        <h1 class="text-4xl font-extrabold tracking-tight">{{ categoriaActual.nombre }}</h1>
        <p class="mt-4 max-w-2xl mx-auto text-lg text-gray-600">{{ categoriaActual.descripcion }}</p>
      </div>

      <!-- Usamos nuestro componente de vista de tarjetas reutilizable -->
      <ProductGridView 
        :productos="productos"
        :catalogo="{ precios_ocultos: false, color_primario: config.configuracionGlobal.tema.colores.primario }"
      />
      
      <div v-if="productos.length === 0" class="text-center py-16">
        <h3 class="text-xl font-semibold">No hay productos en esta categoría</h3>
        <p class="text-gray-500 mt-2">Pronto añadiremos nuevo contenido. ¡Vuelve a visitarnos!</p>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-20">
    <h1 class="text-2xl font-bold">Categoría no encontrada</h1>
  </div>
</template>