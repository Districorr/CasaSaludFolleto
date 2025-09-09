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
import PaginationControls from '../components/PaginationControls.vue' // <-- 1. Importamos el nuevo componente
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// 2. Obtenemos las nuevas propiedades y funciones del composable
const {
  catalogo,
  loading,
  error,
  isExpired,
  uniqueCategories,
  filteredAndSortedProductos,
  paginatedProductos, // <-- La nueva lista que vamos a mostrar
  currentPage,
  totalPages,
  goToPage,
  searchTerm,
  sortOrder,
  activeCategory,
  vistaActiva,
} = useCatalogo()

const { totalProductos } = useListaCotizacion()

const isDetailModalOpen = ref(false)
const isListaModalOpen = ref(false)
const selectedProduct = ref(null)

function openProductModal(producto) {
  selectedProduct.value = producto
  isDetailModalOpen.value = true
}

// --- Las funciones de acción (generatePDF, shareCatalogo, etc.) no necesitan cambios ---

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
  const { showToast, hideToast } = useToast()
  showToast('Generando PDF, aguarda un momento...', 'info', 0)
  try {
    const doc = new jsPDF();
    // IMPORTANTE: El PDF debe generarse con la lista COMPLETA, no solo la página actual.
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
  <div v-if="loading" class="p-8">
    <!-- Skeleton Loader -->
    <div class="animate-pulse space-y-4">
      <div class="h-16 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div class="h-10 bg-gray-200 rounded w-full"></div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div v-for="i in 8" :key="i" class="bg-gray-200 h-80 rounded-lg"></div>
      </div>
    </div>
  </div>

  <div v-else-if="error" class="flex items-center justify-center h-screen text-center">
    <div>
      <h1 class="text-2xl font-bold text-red-600">Error al Cargar</h1>
      <p>{{ error }}</p>
      <RouterLink to="/" class="mt-4 inline-block text-blue-600 hover:underline">Volver al inicio</RouterLink>
    </div>
  </div>

  <div v-else-if="catalogo">
    <div v-if="isExpired" class="flex items-center justify-center h-screen text-center p-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Este catálogo ha expirado</h1>
        <p class="text-gray-600 mt-2">Por favor, contacta a tu asesor de ventas para solicitar un catálogo actualizado.</p>
      </div>
    </div>

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
                class="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <span>Ver Lista ({{ totalProductos }})</span>
        </button>
        <a :href="`https://wa.me/5493704357985?text=Hola,%20estoy%20viendo%20el%20catálogo%20'${catalogo.titulo}'%20y%20quisiera%20hacer%20una%20consulta.`" 
           target="_blank" 
           class="px-4 py-2 bg-green-500 text-white font-semibold rounded-full shadow-lg hover:bg-green-600 flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l..."></path></svg>
          <span>Contactar Asesor</span>
        </a>
        <div class="flex gap-3">
          <button @click="shareCatalogo" title="Compartir" class="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700">...</button>
          <button @click="generatePDF" title="Guardar como PDF" class="p-3 bg-gray-600 text-white rounded-full shadow-lg hover:bg-gray-700">...</button>
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
        <!-- === INICIO DE CAMBIOS === -->
        <ProductGridView 
          v-if="vistaActiva === 'grid'"
          :productos="paginatedProductos"
          :catalogo="catalogo"
          @ver-ficha="openProductModal"
        />
        <ProductListView
          v-if="vistaActiva === 'list'"
          :productos="paginatedProductos"
          :catalogo="catalogo"
          @ver-ficha="openProductModal"
        />

        <div v-if="filteredAndSortedProductos.length === 0" class="text-center py-16 col-span-full">
          <h3 class="text-xl font-semibold">No se encontraron productos</h3>
          <p class="text-gray-500 mt-2">Intenta ajustar tu búsqueda o filtros.</p>
        </div>

        <!-- Controles de Paginación -->
        <PaginationControls
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="goToPage"
        />
        <!-- === FIN DE CAMBIOS === -->
      </main>
    </div>
  </div>
</template>