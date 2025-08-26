<!-- src/views/CrearProductoView.vue -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const producto = ref({
  nombre: '',
  descripcion: '',
  precio: 0.00,
  marca: '',
  categoria: '',
  imagen_url: null,
})
const imagenArchivo = ref(null)
const imagenPreviewUrl = ref(null)
const loading = ref(false)
const errorMessage = ref(null)
const successMessage = ref(null)

// Función para manejar la selección de un archivo de imagen
function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return

  imagenArchivo.value = file
  // Creamos una URL local para la previsualización
  imagenPreviewUrl.value = URL.createObjectURL(file)
}

// Función principal para guardar el producto
async function handleCrearProducto() {
  try {
    loading.value = true
    errorMessage.value = null
    successMessage.value = null

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No se pudo identificar al usuario.")

    // 1. Subir la imagen si existe
    if (imagenArchivo.value) {
      // Buena práctica: nombre de archivo único para evitar colisiones
      const filePath = `${user.id}/${Date.now()}-${imagenArchivo.value.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('imagenes_productos')
        .upload(filePath, imagenArchivo.value)

      if (uploadError) throw uploadError

      // Obtenemos la URL pública de la imagen subida
      const { data: publicUrlData } = supabase.storage
        .from('imagenes_productos')
        .getPublicUrl(filePath)
      
      producto.value.imagen_url = publicUrlData.publicUrl
    }

    // 2. Insertar los datos del producto en la tabla
    const { error: insertError } = await supabase
      .from('productos')
      .insert({
        ...producto.value,
        creado_por: user.id,
      })

    if (insertError) throw insertError

    successMessage.value = "¡Producto creado con éxito! Redirigiendo..."
    
    // Esperamos 2 segundos y redirigimos a la lista de productos
    setTimeout(() => {
      router.push('/admin/productos')
    }, 2000)

  } catch (error) {
    errorMessage.value = 'Error: ' + error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Crear Nuevo Producto</h1>

    <form @submit.prevent="handleCrearProducto" class="p-8 bg-white rounded-lg shadow-md max-w-2xl">
      <div class="space-y-6">
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

        <!-- Imagen -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Imagen del Producto</label>
          <div class="mt-1 flex items-center gap-4">
            <img v-if="imagenPreviewUrl" :src="imagenPreviewUrl" alt="Previsualización" class="h-20 w-20 object-cover rounded-md bg-gray-100">
            <div v-else class="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">Sin imagen</div>
            <input @change="handleFileChange" type="file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
          </div>
        </div>
      </div>

      <!-- Mensajes y Botones -->
      <div class="mt-8">
        <div v-if="errorMessage" class="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{{ errorMessage }}</div>
        <div v-if="successMessage" class="mb-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">{{ successMessage }}</div>
        
        <div class="flex justify-end gap-4">
          <RouterLink to="/admin/productos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
          <button type="submit" :disabled="loading" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
            {{ loading ? 'Guardando...' : 'Guardar Producto' }}
          </button>
        </div>
      </div>
    </form>
  </div>
</template>