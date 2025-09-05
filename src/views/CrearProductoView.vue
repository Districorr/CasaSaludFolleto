<!-- src/views/CrearProductoView.vue (Versión Mejorada y Completa) -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'

const router = useRouter()
const { showToast } = useToast()

// Estado del formulario
const producto = ref({
  codigo: '',
  nombre: '',
  descripcion: '',
  precio: 0.00,
  marca: '',
  categoria: '',
})

// Estado para el manejo de imágenes
const archivosDeImagen = ref([]) // Almacena los objetos de archivo seleccionados
const previewsDeImagen = ref([]) // Almacena las URLs locales para previsualización

const saving = ref(false)

// Maneja la selección de archivos de imagen
function handleFileChange(event) {
  const files = Array.from(event.target.files)
  if (!files.length) return

  archivosDeImagen.value = files
  
  // Genera URLs de previsualización para cada archivo
  previewsDeImagen.value = files.map(file => URL.createObjectURL(file))
}

// Función principal para crear el producto
async function handleCrearProducto() {
  try {
    saving.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No se pudo identificar al usuario.")

    // --- PASO 1: Crear el registro del producto en la tabla 'productos' ---
    // Usamos .select().single() para obtener el objeto del producto recién creado, incluido su ID.
    const { data: nuevoProducto, error: insertError } = await supabase
      .from('productos')
      .insert({
        ...producto.value,
        creado_por: user.id,
      })
      .select()
      .single()

    if (insertError) throw insertError

    // --- PASO 2: Si hay imágenes, subirlas y asociarlas al nuevo producto ---
    if (archivosDeImagen.value.length > 0) {
      const promesasDeSubida = archivosDeImagen.value.map(file => {
        const filePath = `${user.id}/${nuevoProducto.id}/${Date.now()}-${file.name}`
        return supabase.storage.from('imagenes_productos').upload(filePath, file)
      })
      
      const resultados = await Promise.all(promesasDeSubida)
      
      const imagenesParaInsertar = []
      for (const resultado of resultados) {
        if (resultado.error) throw resultado.error
        const { data: publicUrlData } = supabase.storage.from('imagenes_productos').getPublicUrl(resultado.data.path)
        imagenesParaInsertar.push({
          producto_id: nuevoProducto.id,
          imagen_url: publicUrlData.publicUrl
        })
      }

      if (imagenesParaInsertar.length > 0) {
        const { error: insertImgError } = await supabase.from('producto_imagenes').insert(imagenesParaInsertar)
        if (insertImgError) throw insertImgError
      }
    }

    showToast("¡Producto creado con éxito!", 'success')
    router.push('/admin/productos')

  } catch (error) {
    // Manejo de errores de código duplicado
    if (error.message.includes('duplicate key value violates unique constraint')) {
      showToast('Error: El código/SKU que intentas usar ya existe.', 'error')
    } else {
      showToast('Error al crear el producto: ' + error.message, 'error')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Crear Nuevo Producto</h1>

    <form @submit.prevent="handleCrearProducto" class="p-8 bg-white rounded-lg shadow-md max-w-2xl">
      <div class="space-y-6">
        <!-- Código / SKU -->
        <div>
          <label for="codigo" class="block text-sm font-medium text-gray-700">Código / SKU</label>
          <input v-model="producto.codigo" type="text" id="codigo" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          <p class="text-xs text-gray-500 mt-1">Este código debe ser único para cada producto.</p>
        </div>

        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Producto</label>
          <input v-model="producto.nombre" type="text" id="nombre" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>

        <!-- Descripción -->
        <div>
          <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea v-model="producto.descripcion" id="descripcion" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Marca -->
          <div>
            <label for="marca" class="block text-sm font-medium text-gray-700">Marca</label>
            <input v-model="producto.marca" type="text" id="marca" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <!-- Categoría -->
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700">Categoría</label>
            <input v-model="producto.categoria" type="text" id="categoria" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
        </div>

        <!-- Precio -->
        <div>
          <label for="precio" class="block text-sm font-medium text-gray-700">Precio</label>
          <div class="relative mt-1">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span class="text-gray-500 sm:text-sm">$</span>
            </div>
            <input v-model.number="producto.precio" type="number" id="precio" step="0.01" class="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-blue-500 focus:ring-blue-500">
          </div>
        </div>

        <!-- Imágenes -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Imágenes del Producto</label>
          <input @change="handleFileChange" type="file" accept="image/*" multiple class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
          
          <!-- Previsualización de Imágenes -->
          <div v-if="previewsDeImagen.length > 0" class="mt-4 grid grid-cols-3 gap-4">
            <div v-for="(src, index) in previewsDeImagen" :key="index" class="relative">
              <img :src="src" alt="Previsualización" class="h-24 w-full object-cover rounded-md">
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="mt-8 flex justify-end gap-4">
        <RouterLink to="/admin/productos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {{ saving ? 'Guardando...' : 'Guardar Producto' }}
        </button>
      </div>
    </form>
  </div>
</template>