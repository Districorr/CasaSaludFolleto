<!-- src/components/FeaturedItems.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabaseClient'

const props = defineProps({
  bloque: Object
})

const items = ref([])
const loading = ref(true)

onMounted(async () => {
  if (!props.bloque.items || props.bloque.items.length === 0) {
    loading.value = false
    return
  }

  // Separamos los slugs de catálogos y los SKUs de productos
  const catalogoSlugs = props.bloque.items.filter(i => i.tipo === 'catalogo').map(i => i.slug)
  const productoSkus = props.bloque.items.filter(i => i.tipo === 'producto').map(i => i.codigo_sku)

  const fetches = []

  // Preparamos las consultas a la base de datos
  if (catalogoSlugs.length > 0) {
    fetches.push(supabase.from('catalogos').select('slug, titulo, nombre_cliente').in('slug', catalogoSlugs))
  } else {
    fetches.push(Promise.resolve({ data: [] })) // Placeholder si no hay catálogos
  }

  if (productoSkus.length > 0) {
    fetches.push(supabase.from('productos').select('codigo, nombre, slug, producto_imagenes(imagen_url)').in('codigo', productoSkus))
  } else {
    fetches.push(Promise.resolve({ data: [] })) // Placeholder si no hay productos
  }

  // Ejecutamos ambas consultas en paralelo
  const [catalogosResult, productosResult] = await Promise.all(fetches)
  
  const fetchedCatalogos = catalogosResult.data || []
  const fetchedProductos = productosResult.data || []

  // Mapeamos y combinamos los resultados para crear las tarjetas
  const combinedItems = props.bloque.items.map(itemConfig => {
    if (itemConfig.tipo === 'catalogo') {
      const catalogoData = fetchedCatalogos.find(c => c.slug === itemConfig.slug)
      if (!catalogoData) return null
      return {
        tipo: 'Catálogo',
        titulo: catalogoData.titulo,
        subtitulo: catalogoData.nombre_cliente || 'Colección de productos',
        url: `/c/${itemConfig.slug}`,
        imagenUrl: '/images/default-catalogo.webp' // Imagen por defecto para catálogos
      }
    }
    if (itemConfig.tipo === 'producto') {
      const productoData = fetchedProductos.find(p => p.codigo === itemConfig.codigo_sku)
      if (!productoData) return null
      return {
        tipo: 'Producto',
        titulo: productoData.nombre,
        subtitulo: `Código: ${productoData.codigo}`,
        url: `/producto/${productoData.slug}`,
        imagenUrl: productoData.producto_imagenes[0]?.imagen_url || '/images/default-producto.webp' // Imagen por defecto para productos
      }
    }
    return null
  }).filter(Boolean) // Limpiamos cualquier item que no se haya encontrado

  items.value = combinedItems
  loading.value = false
})
</script>

<template>
  <div v-if="bloque.activo && (loading || items.length > 0)" class="py-12 bg-gray-50">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-8">{{ bloque.titulo }}</h2>
      
      <div v-if="loading" class="text-center text-gray-500">
        Cargando destacados...
      </div>
      
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <RouterLink v-for="(item, index) in items" :key="index" :to="item.url" 
                    class="bg-white rounded-lg shadow-md overflow-hidden group transition-shadow hover:shadow-xl">
          <div class="aspect-video overflow-hidden">
            <img :src="item.imagenUrl" :alt="item.titulo" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
          </div>
          <div class="p-4">
            <p class="text-xs font-semibold uppercase" :class="item.tipo === 'Catálogo' ? 'text-blue-500' : 'text-green-500'">
              {{ item.tipo }}
            </p>
            <h3 class="font-bold mt-1">{{ item.titulo }}</h3>
            <p class="text-sm text-gray-500">{{ item.subtitulo }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>