<!-- src/views/EditarProductoView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const producto = ref(null)
const imagenesActuales = ref([]) // Lista de imágenes ya guardadas
const nuevosArchivos = ref([]) // Archivos seleccionados para subir
const loading = ref(true)
const saving = ref(false)

const productoId = route.params.id

// Función para cargar los datos del producto y sus imágenes
async function fetchProducto() {
  try {
    loading.value = true
    // Usamos select con join para traer el producto y todas sus imágenes relacionadas
    const { data, error } = await supabase
      .from('productos')
      .select('*, producto_imagenes(*)') 
      .eq('id', productoId)
      .single()

    if (error) throw error
    if (!data) throw new Error("Producto no encontrado.")
    
    producto.value = data
    // Separamos las imágenes relacionadas
    imagenesActuales.value = data.producto_imagenes || []

  } catch (error) {
    showToast('Error al cargar el producto: ' + error.message, 'error')
    router.push('/admin/productos')
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducto)

// Maneja la selección de múltiples archivos
function handleFileChange(event) {
  // Convertimos FileList a un Array para facilitar el manejo
  nuevosArchivos.value = Array.from(event.target.files)
}

// Elimina una imagen de la base de datos y del Storage
async function eliminarImagen(imagenId, imageUrl) {
  if (!confirm('¿Seguro que quieres eliminar esta imagen?')) return
  
  try {
    // 1. Eliminar de la tabla producto_imagenes
    const { error: dbError } = await supabase.from('producto_imagenes').delete().eq('id', imagenId)
    if (dbError) throw dbError

    // Opcional: Eliminar del Storage (más complejo, requiere parsear el path, lo omitimos por simplicidad en el MVP, pero es la buena práctica)
    // Por ahora, solo eliminamos la referencia de la BD.

    // 2. Actualizar la lista localmente
    imagenesActuales.value = imagenesActuales.value.filter(img => img.id !== imagenId)
    showToast('Imagen eliminada con éxito.', 'success')
  } catch (error) {
    showToast('Error al eliminar la imagen: ' + error.message, 'error')
  }
}

// Función principal para guardar los cambios
async function handleActualizarProducto() {
  try {
    saving.value = true
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Subir nuevas imágenes si las hay
    if (nuevosArchivos.value.length > 0) {
      const promesasDeSubida = nuevosArchivos.value.map(file => {
        // Creamos un path único: user_id/producto_id/timestamp-nombre.ext
        const filePath = `${user.id}/${productoId}/${Date.now()}-${file.name}`
        return supabase.storage.from('imagenes_productos').upload(filePath, file)
      })
      
      const resultados = await Promise.all(promesasDeSubida)
      
      const imagenesParaInsertar = []
      for (const resultado of resultados) {
        if (resultado.error) throw resultado.error
        
        // Obtenemos la URL pública
        const { data: publicUrlData } = supabase.storage.from('imagenes_productos').getPublicUrl(resultado.data.path)
        
        imagenesParaInsertar.push({
          producto_id: productoId,
          imagen_url: publicUrlData.publicUrl
        })
      }

      // Insertamos todas las nuevas URLs en la tabla producto_imagenes
      if (imagenesParaInsertar.length > 0) {
        const { error: insertImgError } = await supabase.from('producto_imagenes').insert(imagenesParaInsertar)
        if (insertImgError) throw insertImgError
      }
    }

    // 2. Actualizar los datos principales del producto
    const { error: updateError } = await supabase
      .from('productos')
      .update({
        nombre: producto.value.nombre,
        descripcion: producto.value.descripcion,
        precio: producto.value.precio,
        marca: producto.value.marca,
        categoria: producto.value.categoria,
        codigo: producto.value.codigo,
        // Nota: ya no actualizamos 'imagen_url' en esta tabla
      })
      .eq('id', productoId)

    if (updateError) throw updateError

    showToast('¡Producto actualizado con éxito!', 'success')
    router.push('/admin/productos')

  } catch (error) {
    showToast('Error al actualizar el producto: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Editar Producto</h1>

    <div v-if="loading" class="text-center">Cargando datos del producto...</div>
    
    <form v-else-if="producto" @submit.prevent="handleActualizarProducto" class="p-8 bg-white rounded-lg shadow-md max-w-2xl">
      <div class="space-y-6">
        <!-- Código -->
        <div>
          <label for="codigo" class="block text-sm font-medium text-gray-700">Código</label>
          <input v-model="producto.codigo" type="text" id="codigo" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
        <!-- Nombre -->
        <div>
          <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Producto</label>
          <input v-model="producto.nombre" type="text" id="nombre" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        </div>
        <!-- Descripción -->
        <div>
          <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea v-model="producto.descripcion" id="descripcion" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
        </div>
        <!-- Marca, Categoría, Precio -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="marca" class="block text-sm font-medium text-gray-700">Marca</label>
            <input v-model="producto.marca" type="text" id="marca" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          </div>
          <div>
            <label for="categoria" class="block text-sm font-medium text-gray-700">Categoría</label>
            <input v-model="producto.categoria" type="text" id="categoria" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
          </div>
        </div>
        <div>
          <label for="precio" class="block text-sm font-medium text-gray-700">Precio</label>
          <div class="relative mt-1">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span class="text-gray-500 sm:text-sm">$</span></div>
            <input v-model.number="producto.precio" type="number" id="precio" step="0.01" class="block w-full rounded-md border-gray-300 pl-7 pr-12">
          </div>
        </div>

        <!-- GESTIÓN DE MÚLTIPLES IMÁGENES -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
          
          <!-- Galería de imágenes existentes -->
          <div v-if="imagenesActuales.length > 0" class="grid grid-cols-3 gap-4 mb-4">
            <div v-for="img in imagenesActuales" :key="img.id" class="relative group border rounded-md overflow-hidden">
              <img :src="img.imagen_url" class="h-24 w-full object-cover">
              <button @click="eliminarImagen(img.id, img.imagen_url)" type="button" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          </div>
          <div v-else class="text-gray-500 text-sm mb-2">No hay imágenes cargadas para este producto.</div>

          <!-- Input para subir nuevas imágenes -->
          <label class="block text-sm font-medium text-gray-700 mt-4">Añadir nuevas imágenes</label>
          <input @change="handleFileChange" type="file" accept="image/*" multiple class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
          <p v-if="nuevosArchivos.length > 0" class="text-xs text-gray-500 mt-1">Archivos listos para subir: {{ nuevosArchivos.length }}</p>
        </div>
      </div>
      
      <!-- Botones -->
      <div class="mt-8 flex justify-end gap-4">
        <RouterLink to="/admin/productos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Cancelar</RouterLink>
        <button type="submit" :disabled="saving" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
          {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
        </button>
      </div>
    </form>
  </div>
</template>