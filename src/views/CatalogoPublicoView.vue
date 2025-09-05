<<<<<<< HEAD
=======
<!-- src/views/CatalogoPublicoView.vue (Versión Final, Completa y Corregida) -->
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
<script setup>
import { ref } from 'vue'
import { useCatalogo } from '../composables/useCatalogo'
import { useListaCotizacion } from '../composables/useListaCotizacion'
import { useToast } from '../lib/useToast'
import CatalogoFilters from '../components/CatalogoFilters.vue'
import ProductGridView from '../components/ProductGridView.vue'
import ProductListView from '../components/ProductListView.vue'
import ProductDetailModal from '../components/ProductDetailModal.vue'
import ListaCotizacionModal from '../components/ListaCotizacionModal.vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- COMPOSABLES ---
const {
  catalogo,
  loading,
  error,
  isExpired,
  uniqueCategories,
  filteredAndSortedProductos,
  productosBase,
  searchTerm,
  sortOrder,
  activeCategory,
  vistaActiva,
} = useCatalogo()

const { totalProductos } = useListaCotizacion()

// --- ESTADO LOCAL DE LA VISTA ---
const isDetailModalOpen = ref(false)
const isListaModalOpen = ref(false)
const selectedProduct = ref(null)

<<<<<<< HEAD
=======
// --- ESTADO PARA FILTROS Y BÚSQUEDA ---
const searchTerm = ref('')
const sortOrder = ref('nombre-asc')
const activeCategory = ref('Todos')

// --- PROPIEDADES COMPUTADAS ---

const isExpired = computed(() => {
  if (!catalogo.value || !catalogo.value.fecha_caducidad) return false
  return new Date(catalogo.value.fecha_caducidad) < new Date()
})

const productosBase = computed(() => {
  if (!catalogo.value || !catalogo.value.catalogo_items) {
    return [];
  }
  const productos = catalogo.value.catalogo_items
    .filter(item => item.productos)
    .map(item => item.productos);
  
  // --- LOG #2: VERIFICAR LA LISTA DE PRODUCTOS EXTRAÍDA ---
  console.log('Log 2: Lista de productos extraída (productosBase):', productos);
  
  return productos;
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
    case 'nombre-asc':
      productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'precio-asc':
      productos.sort((a, b) => a.precio - b.precio);
      break;
    case 'precio-desc':
      productos.sort((a, b) => b.precio - a.precio);
      break;
  }
  
  // --- LOG #3: VERIFICAR EL RESULTADO FINAL ANTES DE MOSTRAR ---
  console.log('Log 3: Productos finales para mostrar (filteredAndSortedProductos):', productos);

  return productos;
});


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

    // --- LOG #1: VER LOS DATOS CRUDOS DE SUPABASE ---
    console.log('Log 1: Datos crudos recibidos de Supabase:', data);
    if (data.catalogo_items && data.catalogo_items.length > 0) {
      console.log('Log 1.1: Estructura del primer item.productos:', data.catalogo_items[0].productos);
    }
    
    catalogo.value = data
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
function openProductModal(producto) {
  selectedProduct.value = producto
  isDetailModalOpen.value = true
}

<<<<<<< HEAD
// --- FUNCIONES DE ACCIÓN ---

=======
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
async function getImageData(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        const img = new Image();
        img.src = base64;
        img.onload = () => resolve({ base64, width: img.width, height: img.height });
        img.onerror = reject;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error obteniendo datos de la imagen:", url, error);
    return null;
  }
}

async function generatePDF() {
<<<<<<< HEAD
  const { showToast, hideToast } = useToast()
  showToast('Generando PDF, aguarda un momento...', 'info', 0)
  try {
    const doc = new jsPDF();
    const productos = filteredAndSortedProductos.value;
    const promesasDeImagenes = productos.map(p => {
      if (p.producto_imagenes && p.producto_imagenes.length > 0) {
        return getImageData(p.producto_imagenes[0].imagen_url);
=======
  const doc = new jsPDF();
  const productos = filteredAndSortedProductos.value;

  const promesasDeImagenes = productos.map(p => {
    if (p.producto_imagenes && p.producto_imagenes.length > 0) {
      return getImageData(p.producto_imagenes[0].imagen_url);
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
          const cell = data.cell;
          const cellPadding = 2;
          const maxWidth = cell.width - (cellPadding * 2);
          const maxHeight = cell.height - (cellPadding * 2);
          const ratio = Math.min(maxWidth / imgData.width, maxHeight / imgData.height);
          const imgWidth = imgData.width * ratio;
          const imgHeight = imgData.height * ratio;
          const x = cell.x + (cell.width - imgWidth) / 2;
          const y = cell.y + (cell.height - imgHeight) / 2;
          doc.addImage(imgData.base64, 'JPEG', x, y, imgWidth, imgHeight);
        }
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
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
      const precioFormateado = catalogo.value.precios_ocultos 
        ? 'Consultar' 
        : new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(p.precio);
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
            const cell = data.cell;
            const cellPadding = 2;
            const maxWidth = cell.width - (cellPadding * 2);
            const maxHeight = cell.height - (cellPadding * 2);
            const ratio = Math.min(maxWidth / imgData.width, maxHeight / imgData.height);
            const imgWidth = imgData.width * ratio;
            const imgHeight = imgData.height * ratio;
            const x = cell.x + (cell.width - imgWidth) / 2;
            const y = cell.y + (cell.height - imgHeight) / 2;
            doc.addImage(imgData.base64, 'JPEG', x, y, imgWidth, imgHeight);
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
    hideToast();
    showToast('¡PDF generado con éxito!', 'success');
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    hideToast();
    showToast('Hubo un error al generar el PDF.', 'error');
  }
}

async function shareCatalogo() {
  const { showToast } = useToast()
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
      showToast('¡Link del catálogo copiado!', 'success')
    }
  } catch (err) {
    console.error("Error al compartir:", err)
  }
}
</script>

<template>
<<<<<<< HEAD
=======
  <!-- 1. SKELETON LOADER (se muestra mientras loading es true) -->
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
  <div v-if="loading" class="p-8">
    <div class="animate-pulse space-y-4">
      <div class="h-16 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div class="h-10 bg-gray-200 rounded w-full"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div v-for="i in 8" :key="i" class="bg-gray-200 h-80 rounded-lg"></div>
      </div>
    </div>
  </div>

<<<<<<< HEAD
=======
  <!-- 2. ESTADO DE ERROR (se muestra si loading es false y error tiene un valor) -->
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
  <div v-else-if="error" class="flex items-center justify-center h-screen text-center">
    <div>
      <h1 class="text-2xl font-bold text-red-600">Error al Cargar</h1>
      <p>{{ error }}</p>
      <RouterLink to="/" class="mt-4 inline-block text-blue-600 hover:underline">Volver al inicio</RouterLink>
    </div>
  </div>

<<<<<<< HEAD
  <div v-else-if="catalogo">
=======
  <!-- 3. CONTENIDO PRINCIPAL (se muestra si loading es false, no hay error, Y 'catalogo' TIENE DATOS) -->
  <div v-else-if="catalogo" class="main-content">
    <!-- 3a. PANTALLA DE CATÁLOGO EXPIRADO -->
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
    <div v-if="isExpired" class="flex items-center justify-center h-screen text-center p-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Este catálogo ha expirado</h1>
        <p class="text-gray-600 mt-2">Por favor, contacta a tu asesor de ventas para solicitar un catálogo actualizado.</p>
      </div>
    </div>

<<<<<<< HEAD
    <div v-else :style="{ backgroundColor: catalogo.color_fondo }" class="min-h-screen font-sans">
      <ProductDetailModal
        v-if="isDetailModalOpen"
        :producto="selectedProduct"
        :color-primario="catalogo.color_primario"
        :precios-ocultos="catalogo.precios_ocultos"
        @cerrar="isDetailModalOpen = false"
      />
      <ListaCotizacionModal
        v-if="isListaModalOpen"
        :catalogo="catalogo"
        @cerrar="isListaModalOpen = false"
      />

      <div class="no-print fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        <button v-if="totalProductos > 0" @click="isListaModalOpen = true"
                class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2 transition-transform hover:scale-105">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span>Ver Lista ({{ totalProductos }})</span>
        </button>
        
        <a :href="`https://wa.me/5493704357985?text=Hola,%20estoy%20viendo%20el%20catálogo%20'${catalogo.titulo}'%20y%20quisiera%20hacer%20una%20consulta.`" 
           target="_blank" 
           class="px-4 py-2 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 flex items-center gap-2 transition-transform hover:scale-105"
           title="Contactar Asesor por WhatsApp">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.523.074-.797.372-.273.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
          <span>Contactar Asesor</span>
        </a>
        <div class="flex gap-3">
          <button @click="shareCatalogo" title="Compartir" class="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path></svg></button>
          <button @click="generatePDF" title="Guardar como PDF" class="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700"><svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg></button>
        </div>
      </div>

      <header class="p-8 text-center" :style="{ backgroundColor: catalogo.color_primario, color: '#FFFFFF' }">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">{{ catalogo.titulo }}</h1>
        <p v-if="catalogo.nombre_cliente" class="mt-2 text-lg opacity-90">Preparado para: {{ catalogo.nombre_cliente }}</p>
      </header>

      <CatalogoFilters
        v-model:searchTerm="searchTerm"
        v-model:sortOrder="sortOrder"
        v-model:activeCategory="activeCategory"
        v-model:vistaActiva="vistaActiva"
        :categories="uniqueCategories"
      />

      <main class="container mx-auto p-4 md:p-8 max-w-7xl">
        <ProductGridView 
          v-if="vistaActiva === 'grid'"
          :productos="filteredAndSortedProductos"
          :catalogo="catalogo"
          @ver-ficha="openProductModal"
        />
        <ProductListView
          v-if="vistaActiva === 'list'"
          :productos="filteredAndSortedProductos"
          :catalogo="catalogo"
          @ver-ficha="openProductModal"
        />
        <div v-if="filteredAndSortedProductos.length === 0" class="text-center py-16 col-span-full">
          <h3 class="text-xl font-semibold">No se encontraron productos</h3>
          <p class="text-gray-500 mt-2">Intenta ajustar tu búsqueda o filtros.</p>
        </div>
      </main>
    </div>
  </div>
</template>
=======
    <!-- 3b. CONTENIDO DEL CATÁLOGO ACTIVO -->
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
        <a href="https://wa.me/5493704357985" target="_blank" class="px-4 py-2 text-white font-semibold rounded-full" :style="{ backgroundColor: catalogo.color_primario }">Contactar Asesor</a>
      </div>
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
>>>>>>> 56ba369d023572bd1b7a9809421f4bf7b8d26096
