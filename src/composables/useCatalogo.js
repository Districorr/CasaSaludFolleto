// src/composables/useCatalogo.js (Versión con Paginación)

import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

export function useCatalogo() {
  // --- ESTADO ---
  const route = useRoute()
  const catalogo = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Estado de filtros y vista
  const searchTerm = ref('')
  const sortOrder = ref('nombre-asc')
  const activeCategory = ref('Todos')
  const vistaActiva = ref('grid')

  // --- NUEVO ESTADO PARA PAGINACIÓN ---
  const currentPage = ref(1)
  const itemsPerPage = ref(16) // 16 es un buen número para grids de 4 columnas

  // --- PROPIEDADES COMPUTADAS ---

  const isExpired = computed(() => {
    if (!catalogo.value || !catalogo.value.fecha_caducidad) return false
    return new Date(catalogo.value.fecha_caducidad) < new Date()
  })

  const productosBase = computed(() => {
    if (!catalogo.value?.catalogo_items) return [];
    return catalogo.value.catalogo_items
      .filter(item => item.productos)
      .map(item => item.productos);
  });

  const uniqueCategories = computed(() => {
    if (productosBase.value.length === 0) return ['Todos'];
    const allCategories = productosBase.value.map(p => p.categoria);
    return ['Todos', ...new Set(allCategories.filter(Boolean))].sort();
  });

  // La lista filtrada y ordenada ahora contiene TODOS los productos que coinciden
  const filteredAndSortedProductos = computed(() => {
    let productos = [...productosBase.value];
    
    if (activeCategory.value !== 'Todos') {
      productos = productos.filter(p => p.categoria === activeCategory.value);
    }
    
    if (searchTerm.value) {
      const lowerCaseSearch = searchTerm.value.toLowerCase();
      productos = productos.filter(p => 
        p.nombre.toLowerCase().includes(lowerCaseSearch) ||
        (p.codigo && p.codigo.toLowerCase().includes(lowerCaseSearch))
      );
    }

    switch (sortOrder.value) {
      case 'nombre-asc': productos.sort((a, b) => a.nombre.localeCompare(b.nombre)); break;
      case 'precio-asc': productos.sort((a, b) => a.precio - b.precio); break;
      case 'precio-desc': productos.sort((a, b) => b.precio - a.precio); break;
    }
    return productos;
  });

  // --- NUEVAS PROPIEDADES COMPUTADAS PARA PAGINACIÓN ---

  // Calcula el número total de páginas necesarias
  const totalPages = computed(() => {
    if (!filteredAndSortedProductos.value) return 0;
    return Math.ceil(filteredAndSortedProductos.value.length / itemsPerPage.value)
  })

  // Devuelve solo la "porción" de productos para la página actual
  const paginatedProductos = computed(() => {
    if (!filteredAndSortedProductos.value) return [];
    
    // Si un filtro cambia y la página actual queda fuera de rango, reseteamos a la última página válida.
    if (currentPage.value > totalPages.value) {
      currentPage.value = totalPages.value || 1;
    }
    
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredAndSortedProductos.value.slice(start, end)
  })

  // --- FUNCIONES ---

  async function fetchCatalogo() {
    try {
      loading.value = true
      const slug = route.params.slug
      const { data, error: fetchError } = await supabase
        .from('catalogos')
        .select(`*, catalogo_items(productos(*, producto_imagenes(*)))`)
        .eq('slug', slug)
        .single()
      if (fetchError) throw fetchError
      if (!data) throw new Error('No se encontró el catálogo solicitado.')
      catalogo.value = data
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  // --- NUEVAS FUNCIONES PARA PAGINACIÓN ---
  function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
      // Llevamos al usuario al principio de la lista de productos para que vea los nuevos resultados
      window.scrollTo({ top: 300, behavior: 'smooth' }); // 300px para no quedar debajo del header/filtros
    }
  }

  // Observamos si los filtros cambian para resetear la paginación a la primera página
  watch([searchTerm, activeCategory, sortOrder], () => {
    currentPage.value = 1;
  })

  // --- CICLO DE VIDA ---
  onMounted(fetchCatalogo)

  // --- VALORES Y FUNCIONES EXPUESTOS ---
  return {
    // Datos
    catalogo,
    loading,
    error,
    isExpired,
    uniqueCategories,
    productosBase,
    filteredAndSortedProductos, // La exportamos para poder mostrar el conteo total
    
    // Lógica de paginación
    paginatedProductos, // <-- La lista que realmente mostraremos en la UI
    currentPage,
    totalPages,
    goToPage,

    // Estado de la UI (para v-model)
    searchTerm,
    sortOrder,
    activeCategory,
    vistaActiva,
  }
}