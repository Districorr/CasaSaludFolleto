<!-- src/views/ImportarProductosView.vue (Versión No Destructiva) -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'
import * as XLSX from 'xlsx'

const router = useRouter()
const { showToast } = useToast()
const archivo = ref(null)
const nombreArchivo = ref('')
const loading = ref(false)

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    archivo.value = file
    nombreArchivo.value = file.name
  }
}

async function handleImportar() {
  if (!archivo.value) {
    showToast("Por favor, selecciona un archivo para importar.", 'error')
    return
  }

  loading.value = true

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No se pudo identificar al usuario.")

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // Filtramos para asegurar que cada fila tenga un CÓDIGO. Es nuestra clave.
        const filasValidas = jsonData.filter(row => row.CODIGO && String(row.CODIGO).trim() !== '')
        if (filasValidas.length === 0) {
          throw new Error("El archivo no contiene filas con una columna 'CODIGO' válida.")
        }

        // Mapeamos los datos del Excel a la estructura de nuestra tabla.
        // Crucial: NO incluimos ningún campo relacionado con imágenes.
        const productosParaUpsert = filasValidas.map(row => {
          const precioStr = String(row.PRECIO || '0').replace(',', '.')
          return {
            codigo: String(row.CODIGO).trim(),
            nombre: String(row.DESCRIPCION || '').trim(),
            precio: parseFloat(precioStr) || 0,
            marca: String(row.MARCA || '').trim(),
            categoria: String(row.CATEGORIA || '').trim(),
            creado_por: user.id
          }
        })

        // LA MAGIA ESTÁ AQUÍ: Usamos .upsert()
        // onConflict: 'creado_por,codigo' le dice a Supabase que la combinación de estas dos
        // columnas es la clave única para decidir si actualizar o insertar.
        const { error } = await supabase
          .from('productos')
          .upsert(productosParaUpsert, { onConflict: 'creado_por,codigo' })

        if (error) throw error

        showToast(`¡Éxito! Se procesaron ${productosParaUpsert.length} productos.`, 'success')
        setTimeout(() => router.push('/admin/productos'), 2000)

      } catch (processError) {
        showToast('Error al procesar: ' + processError.message, 'error')
      } finally {
        loading.value = false
      }
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
    <h1 class="text-3xl font-bold mb-6">Importar y Actualizar Productos</h1>
    <div class="p-8 bg-white rounded-lg shadow-md max-w-2xl">
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900">Instrucciones</h3>
        <p class="mt-1 text-sm text-gray-600">
          Sube un archivo .xlsx. La columna <code class="font-bold bg-gray-200 px-1 rounded">CODIGO</code> es obligatoria y se usará para identificar los productos.
        </p>
        <ul class="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
          <li>Si un código de producto ya existe en tu base de datos, se **actualizará** su información (nombre, precio, etc.).</li>
          <li>Si un código no existe, se **creará** como un nuevo producto.</li>
          <li class="font-semibold text-red-600">Las imágenes de los productos existentes NO se modificarán ni eliminarán.</li>
        </ul>
      </div>

      <!-- Área para subir archivo (sin cambios) -->
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

      <!-- Botones (sin cambios) -->
      <div class="mt-8 flex justify-end gap-4">
        <RouterLink to="/admin/productos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <button @click="handleImportar" :disabled="loading || !archivo" class="px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300">
          {{ loading ? 'Procesando...' : 'Procesar Archivo' }}
        </button>
      </div>
    </div>
  </div>
</template>