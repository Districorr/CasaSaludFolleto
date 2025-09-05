// src/composables/useCatalogo.js

import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

// Un "composable" es simplemente una función que encapsula y devuelve estado y lógica reactiva.
export function useCatalogo() {
  // --- ESTADO INTERNO ---
  const route = useRoute()
  const catalogo = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Estado de los filtros y la vista
  const searchTerm = ref('')
  const sortOrder = ref('nombre-asc')
  const activeCategory = ref('Todos')
  const vistaActiva = ref('grid')

  // --- LÓGICA DE DATOS (PROPIEDADES COMPUTADAS) ---

  const isExpired = computed(() => {
    if (!catalogo.value || !catalogo.value.fecha_caducidad) return false
    return new Date(catalogo.value.fecha_caducidad) < new Date()
  })

  const productosBase = computed(() => {
    if (!catalogo.value || !catalogo.value.catalogo_items) return [];
    return catalogo.value.catalogo_items
      .filter(item => item.productos)
      .map(item => item.productos);
  });

  const uniqueCategories = computed(() => {
    if (productosBase.value.length === 0) return ['Todos'];
    const allCategories = productosBase.value.map(p => p.categoria);
    return ['Todos', ...new Set(allCategories.filter(Boolean))].sort();
  });

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

  // --- FUNCIÓN PRINCIPAL DE OBTENCIÓN DE DATOS ---

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

  // --- CICLO DE VIDA ---
  // El composable se encarga de llamar a la función cuando se usa por primera vez.
  onMounted(fetchCatalogo)

  // --- VALORES Y FUNCIONES EXPUESTOS ---
  // Devolvemos todo lo que el componente necesitará para funcionar.
  return {
    // Datos
    catalogo,
    loading,
    error,
    isExpired,
    uniqueCategories,
    filteredAndSortedProductos,

    // Estado de la UI (con v-model)
    searchTerm,
    sortOrder,
    activeCategory,
    vistaActiva,
  }
}