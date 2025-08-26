<!-- src/views/ImportarProductosView.vue (FINAL) -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast' // <-- Importar nuestro sistema de toasts
import * as XLSX from 'xlsx'
import ConfirmModal from '../components/ConfirmModal.vue' // <-- Importar el modal

const router = useRouter()
const { showToast } = useToast()
const archivo = ref(null)
const nombreArchivo = ref('')
const loading = ref(false)
const showConfirmModal = ref(false) // <-- Controla la visibilidad del modal

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    archivo.value = file
    nombreArchivo.value = file.name
  }
}

// Paso 1: El usuario pide importar, mostramos el modal
function pedirConfirmacion() {
  if (!archivo.value) {
    showToast("Por favor, selecciona un archivo primero.", 'error')
    return
  }
  showConfirmModal.value = true
}

// Paso 2: El usuario confirma en el modal, ejecutamos la importación
async function handleImportar() {
  showConfirmModal.value = false // Ocultamos el modal
  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No se pudo identificar al usuario.")

    // --- LÓGICA DE SOBREESCRITURA ---
    // 1. Borramos todos los productos existentes del usuario
    const { error: deleteError } = await supabase
      .from('productos')
      .delete()
      .eq('creado_por', user.id)
    
    if (deleteError) throw new Error('Error al borrar productos antiguos: ' + deleteError.message)
    // ---------------------------------

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const filasValidas = jsonData.filter(row => row.DESCRIPCION && String(row.DESCRIPCION).trim() !== '')
        if (filasValidas.length === 0) throw new Error("No se encontraron filas con una columna 'DESCRIPCION' válida.")

        const productosParaInsertar = filasValidas.map(row => {
          // --- CORRECCIÓN DEL PRECIO AQUÍ ---
          const precioStr = String(row.PRECIO || '0').replace(',', '.')
          // ----------------------------------
          return {
            codigo: String(row.CODIGO || ''),
            nombre: String(row.DESCRIPCION).trim(),
            precio: parseFloat(precioStr) || 0,
            marca: String(row.MARCA || '').trim(),
            categoria: String(row.CATEGORIA || '').trim(),
            creado_por: user.id
          }
        })

        const { error: insertError } = await supabase.from('productos').insert(productosParaInsertar)
        if (insertError) throw insertError

        showToast(`¡Éxito! Se importaron ${productosParaInsertar.length} productos.`, 'success')
        setTimeout(() => router.push('/admin/productos'), 2000)

      } catch (processError) {
        showToast(processError.message, 'error')
      } finally {
        loading.value = false
      }
    }
    reader.onerror = () => {
      showToast('Error al leer el archivo: ' + reader.error, 'error')
      loading.value = false
    }
    reader.readAsArrayBuffer(archivo.value)

  } catch (error) {
    showToast(error.message, 'error')
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Nuestro Modal de Confirmación -->
    <ConfirmModal
      v-if="showConfirmModal"
      titulo="Sobrescribir Productos"
      mensaje="Esta acción eliminará TODOS tus productos actuales y los reemplazará con los del archivo Excel. ¿Estás seguro de que quieres continuar?"
      @confirmar="handleImportar"
      @cancelar="showConfirmModal = false"
    />

    <h1 class="text-3xl font-bold mb-6">Importar Productos desde Excel</h1>
    <div class="p-8 bg-white rounded-lg shadow-md max-w-2xl">
      <!-- ... (el resto del template es igual, no necesita cambios) ... -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900">Instrucciones</h3>
        <p class="mt-1 text-sm text-gray-600">
          Sube un archivo .xlsx con las columnas:
          <code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded">CODIGO</code>,
          <code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded">DESCRIPCION</code>,
          <code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded">PRECIO</code>,
          <code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded">MARCA</code>,
          <code class="bg-gray-200 text-gray-800 px-1 py-0.5 rounded">CATEGORIA</code>.
        </p>
      </div>
      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div class="space-y-1 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <div class="flex text-sm text-gray-600">
            <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
              <span>Selecciona un archivo</span>
              <input id="file-upload" name="file-upload" type="file" class="sr-only" @change="handleFileChange" accept=".xlsx, .xls">
            </label>
            <p class="pl-1">o arrástralo aquí</p>
          </div>
          <p class="text-xs text-gray-500">Solo archivos .xlsx o .xls</p>
          <p v-if="nombreArchivo" class="pt-2 text-sm font-semibold text-green-700">{{ nombreArchivo }}</p>
        </div>
      </div>
      <div class="mt-8 flex justify-end gap-4">
        <RouterLink to="/admin/productos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <!-- El botón ahora llama a la confirmación -->
        <button @click="pedirConfirmacion" :disabled="loading || !archivo" class="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
          {{ loading ? 'Importando...' : 'Iniciar Importación' }}
        </button>
      </div>
    </div>
  </div>
</template>