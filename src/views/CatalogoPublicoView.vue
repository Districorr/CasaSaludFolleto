<!-- src/views/CatalogoPublicoView.vue (Versión Final y Completa) -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import ProductDetailModal from '../components/ProductDetailModal.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const route = useRoute()
const catalogo = ref(null)
const loading = ref(true)
const error = ref(null)

// --- ESTADO PARA MODAL ---
const isModalOpen = ref(false)
const selectedProduct = ref(null)

// --- ESTADO PARA FILTROS Y BÚSQUEDA ---
const searchTerm = ref('')
const sortOrder = ref('nombre-asc')
const activeCategory = ref('Todos')

// --- PROPIEDADES COMPUTADAS ---

// Comprueba si el catálogo ha expirado
const isExpired = computed(() => {
  if (!catalogo.value || !catalogo.value.fecha_caducidad) return false
  // Compara la fecha de caducidad con la fecha y hora actual
  return new Date(catalogo.value.fecha_caducidad) < new Date()
})

const uniqueCategories = computed(() => {
  if (!catalogo.value) return []
  const allCategories = catalogo.value.catalogo_items.map(item => item.productos.categoria)
  return ['Todos', ...new Set(allCategories.filter(Boolean))].sort()
})

const filteredAndSortedProductos = computed(() => {
  if (!catalogo.value) return []
  let productos = catalogo.value.catalogo_items.map(item => item.productos)

  if (activeCategory.value !== 'Todos') {
    productos = productos.filter(p => p.categoria === activeCategory.value)
  }

  if (searchTerm.value) {
    const lowerCaseSearch = searchTerm.value.toLowerCase()
    productos = productos.filter(p => 
      p.nombre.toLowerCase().includes(lowerCaseSearch) ||
      (p.codigo && p.codigo.toLowerCase().includes(lowerCaseSearch))
    )
  }

  switch (sortOrder.value) {
    case 'nombre-asc':
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre))
      break
    case 'precio-asc':
      productos.sort((a, b) => a.precio - b.precio)
      break
    case 'precio-desc':
      productos.sort((a, b) => b.precio - a.precio)
      break
  }
  return productos
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

function openProductModal(producto) {
  selectedProduct.value = producto
  isModalOpen.value = true
}

async function imageUrlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error convirtiendo imagen a base64:", url, error);
    return null;
  }
}

async function generatePDF() {
  const doc = new jsPDF();
  const productos = filteredAndSortedProductos.value;

  const promesasDeImagenes = productos.map(p => {
    if (p.producto_imagenes && p.producto_imagenes.length > 0) {
      return imageUrlToBase64(p.producto_imagenes[0].imagen_url);
    }
    return Promise.resolve(null);
  });
  const imagenesData = await Promise.all(promesasDeImagenes);

  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(catalogo.value.titulo, 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Preparado para: ${catalogo.value.nombre_cliente || 'Cliente General'}`, 105, 28, { align: 'center' });
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  const head = [['Imagen', 'Código', 'Descripción', 'Precio']];
  const body = productos.map((p, index) => {
    const precioFormateado = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio);
    return ['', p.codigo || 'S/C', p.nombre, precioFormateado];
  });

  autoTable(doc, {
    head: head,
    body: body,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 30, minCellHeight: 30 },
      1: { cellWidth: 25 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 30, halign: 'right' },
    },
    didDrawCell: function(data) {
      if (data.section === 'body' && data.column.index === 0) {
        const imgData = imagenesData[data.row.index];
        if (imgData) {
          const img = new Image();
          img.src = imgData;
          const cell = data.cell;
          const cellPadding = 2;
          const maxWidth = cell.width - (cellPadding * 2);
          const maxHeight = cell.height - (cellPadding * 2);
          const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
          const imgWidth = img.width * ratio;
          const imgHeight = img.height * ratio;
          const x = cell.x + (cell.width - imgWidth) / 2;
          const y = cell.y + (cell.height - imgHeight) / 2;
          doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
        }
      }
    },
    rowPageBreak: 'avoid',
    margin: { top: 40 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text('Casa Salud - Catálogo Personalizado', 105, 285, { align: 'center' });
    doc.text(`Página ${i} de ${pageCount}`, 190, 285, { align: 'right' });
  }

  doc.save(`${catalogo.value.slug}.pdf`);
}

async function shareCatalogo() {
  const shareData = {
    title: `Catálogo: ${catalogo.value.titulo}`,
    text: `Mira este catálogo personalizado de Casa Salud: ${catalogo.value.titulo}`,
    url: window.location.href,
  }
  try {
    if (navigator.share) {
      await navigator.share(shareData)
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('¡Link del catálogo copiado al portapapeles!')
    }
  } catch (err) {
    console.error("Error al compartir:", err)
  }
}

onMounted(fetchCatalogo)
</script>

<template>
  <!-- 1. SKELETON LOADER -->
  <div v-if="loading" class="p-8">
    <div class="animate-pulse space-y-4">
      <div class="h-16 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div class="h-10 bg-gray-200 rounded w-full"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
        <div v-for="i in 6" :key="i" class="bg-gray-200 h-96 rounded-lg"></div>
      </div>
    </div>
  </div>

  <!-- 2. ESTADO DE ERROR -->
  <div v-else-if="error" class="flex items-center justify-center h-screen text-center">
    <div>
      <h1 class="text-2xl font-bold text-red-600">Error al Cargar</h1>
      <p>{{ error }}</p>
      <RouterLink to="/" class="mt-4 inline-block text-blue-600 hover:underline">Volver al inicio</RouterLink>
    </div>
  </div>

  <!-- 3. PANTALLA DE CATÁLOGO EXPIRADO -->
  <div v-else-if="isExpired" class="flex items-center justify-center h-screen text-center p-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">Este catálogo ha expirado</h1>
      <p class="text-gray-600 mt-2">Por favor, contacta a tu asesor de ventas para solicitar un catálogo actualizado.</p>
    </div>
  </div>

  <!-- 4. CONTENIDO DEL CATÁLOGO ACTIVO -->
  <div v-else :style="{ backgroundColor: catalogo.color_fondo }" class="min-h-screen font-sans">
    <ProductDetailModal
      v-if="isModalOpen"
      :producto="selectedProduct"
      :color-primario="catalogo.color_primario"
      @cerrar="isModalOpen = false"
    />

    <div class="no-print fixed bottom-24 right-5 z-50 flex flex-col gap-3">
      <button @click="shareCatalogo" title="Compartir" class="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg></button>
      <button @click="generatePDF" title="Guardar como PDF" class="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></button>
    </div>

    <div id="catalogo-imprimible">
      <header class="p-8 text-center" :style="{ backgroundColor: catalogo.color_primario, color: '#FFFFFF' }">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">{{ catalogo.titulo }}</h1>
        <p v-if="catalogo.nombre_cliente" class="mt-2 text-lg opacity-90">Preparado para: {{ catalogo.nombre_cliente }}</p>
      </header>

      <nav class="no-print sticky top-0 z-40 bg-white/80 backdrop-blur-md shadow-sm p-4">
        <div class="container mx-auto">
          <div class="flex flex-col md:flex-row gap-4 items-center">
            <input v-model="searchTerm" type="text" placeholder="Buscar en el catálogo..." class="w-full md:w-1/3 px-4 py-2 border rounded-full">
            <select v-model="sortOrder" class="w-full md:w-auto px-4 py-2 border rounded-full">
              <option value="nombre-asc">Ordenar por Nombre (A-Z)</option>
              <option value="precio-asc">Ordenar por Precio (Menor a Mayor)</option>
              <option value="precio-desc">Ordenar por Precio (Mayor a Menor)</option>
            </select>
          </div>
          <div class="mt-4 flex flex-wrap gap-2 justify-center">
            <button v-for="cat in uniqueCategories" :key="cat" @click="activeCategory = cat"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-full transition-colors',
                activeCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              ]">
              {{ cat }}
            </button>
          </div>
        </div>
      </nav>

      <main class="container mx-auto p-4 md:p-8">
        <TransitionGroup name="list" tag="div" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="producto in filteredAndSortedProductos" :key="producto.id" 
               class="product-card bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
            
            <div class="relative overflow-hidden">
              <img v-if="producto.producto_imagenes && producto.producto_imagenes.length > 0" :src="producto.producto_imagenes[0].imagen_url" :alt="producto.nombre"
                   class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110">
              <div v-else class="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400">Sin imagen</div>
            </div>
            
            <div class="p-6 flex-1 flex flex-col">
              <h2 class="text-xl font-bold text-gray-800">{{ producto.nombre }}</h2>
              <p class="text-gray-600 mt-4 flex-1 line-clamp-3">{{ producto.descripcion || 'Sin descripción disponible.' }}</p>
              <div class="mt-6 flex justify-between items-center">
                <span class="text-xl font-bold" :style="{ color: catalogo.color_primario }">
                  {{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(producto.precio) }}
                </span>
                <button @click="openProductModal(producto)" class="px-4 py-2 text-sm font-semibold text-white rounded-md transition-transform hover:scale-105" :style="{ backgroundColor: catalogo.color_primario }">
                  Ver Ficha
                </button>
              </div>
            </div>
          </div>
        </TransitionGroup>
        <div v-if="filteredAndSortedProductos.length === 0" class="text-center py-16">
          <h3 class="text-xl font-semibold">No se encontraron productos</h3>
          <p class="text-gray-500 mt-2">Intenta ajustar tu búsqueda o filtros.</p>
        </div>
      </main>
    </div>
    
    <div class="no-print fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg p-3 flex justify-center items-center gap-4">
      <span class="font-semibold">¿Necesitas ayuda?</span>
      <a href="https://wa.me/5491123456789" target="_blank" class="px-4 py-2 text-white font-semibold rounded-full" :style="{ backgroundColor: catalogo.color_primario }">Contactar Asesor</a>
    </div>
  </div>
</template>

<style>
.list-move, .list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
.list-leave-active {
  position: absolute;
}
.line-clamp-3 {
   overflow: hidden;
   display: -webkit-box;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 3;
}
</style>