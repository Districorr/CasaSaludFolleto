<!-- src/views/EditarProductoView.vue (Versión Final con Generación de Slug) -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'
import ProductCardPreview from '../components/ProductCardPreview.vue'

const route = useRoute()
const router = useRouter()
const { showToast } = useToast()

const producto = ref(null)
const imagenesActuales = ref([])
const nuevosArchivos = ref([])
const loading = ref(true)
const saving = ref(false)
const teniaCodigoInicialmente = ref(false)
const badgesInput = ref('')

const productoId = route.params.id

const imagenPrincipalUrl = computed(() => {
  if (nuevosArchivos.value.length > 0) return URL.createObjectURL(nuevosArchivos.value[0]);
  if (imagenesActuales.value.length > 0) return imagenesActuales.value[0].imagen_url;
  return null;
});

// Función para crear slugs amigables para la URL
function slugify(text) {
  if (!text) return ''
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
}

async function fetchProducto() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('productos')
      .select('*, producto_imagenes(*)')
      .eq('id', productoId)
      .single()

    if (error) throw error
    producto.value = data
    imagenesActuales.value = data.producto_imagenes || []
    teniaCodigoInicialmente.value = !!data.codigo
    if (data.badges) {
      badgesInput.value = data.badges.join(', ')
    }

  } catch (error) {
    showToast('Error al cargar el producto: ' + error.message, 'error')
    router.push('/admin/productos')
  } finally {
    loading.value = false
  }
}

onMounted(fetchProducto)

function handleFileChange(event) {
  nuevosArchivos.value = Array.from(event.target.files)
}

async function eliminarImagen(imagen) {
  if (!confirm('¿Seguro que quieres eliminar esta imagen?')) return
  try {
    await supabase.from('producto_imagenes').delete().eq('id', imagen.id)
    const filePath = new URL(imagen.imagen_url).pathname.split('/imagenes_productos/')[1]
    await supabase.storage.from('imagenes_productos').remove([filePath])
    imagenesActuales.value = imagenesActuales.value.filter(img => img.id !== imagen.id)
    showToast('Imagen eliminada.', 'success')
  } catch (error) {
    showToast('Error al eliminar la imagen: ' + error.message, 'error')
  }
}

async function handleActualizarProducto() {
  try {
    saving.value = true
    const { data: { user } } = await supabase.auth.getUser()

    if (!producto.value.codigo || String(producto.value.codigo).trim() === '') {
      showToast('El campo Código / SKU no puede estar vacío.', 'error')
      saving.value = false
      return
    }
    
    const { data: productoExistente } = await supabase
      .from('productos')
      .select('id')
      .eq('codigo', producto.value.codigo.trim())
      .eq('creado_por', user.id)
      .neq('id', productoId)
      .maybeSingle()

    if (productoExistente) {
      showToast('Error: El código que intentas asignar ya está en uso.', 'error')
      saving.value = false
      return
    }

    if (nuevosArchivos.value.length > 0) {
      const promesasDeSubida = nuevosArchivos.value.map(file => {
        const filePath = `${user.id}/${productoId}/${Date.now()}-${file.name}`
        return supabase.storage.from('imagenes_productos').upload(filePath, file)
      })
      const resultados = await Promise.all(promesasDeSubida)
      const imagenesParaInsertar = []
      for (const resultado of resultados) {
        if (resultado.error) throw resultado.error
        const { data: publicUrlData } = supabase.storage.from('imagenes_productos').getPublicUrl(resultado.data.path)
        imagenesParaInsertar.push({ producto_id: productoId, imagen_url: publicUrlData.publicUrl })
      }
      if (imagenesParaInsertar.length > 0) {
        await supabase.from('producto_imagenes').insert(imagenesParaInsertar)
      }
    }

    const badgesParaGuardar = badgesInput.value.split(',').map(badge => badge.trim()).filter(badge => badge)
    
    // Lógica de generación de slug
    let slugParaGuardar = producto.value.slug;
    if (!slugParaGuardar) {
      slugParaGuardar = slugify(producto.value.nombre);
    }

    const { error: updateError } = await supabase
      .from('productos')
      .update({
        codigo: producto.value.codigo.trim(),
        nombre: producto.value.nombre,
        descripcion: producto.value.descripcion,
        precio: producto.value.precio,
        marca: producto.value.marca,
        categoria: producto.value.categoria,
        video_youtube_url: producto.value.video_youtube_url,
        puntos_clave: producto.value.puntos_clave,
        badges: badgesParaGuardar,
        slug: slugParaGuardar,
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
    <div v-if="loading" class="text-center py-10">Cargando datos del producto...</div>
    <div v-else-if="producto" class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      
      <div class="p-8 bg-white rounded-lg shadow-md">
        <form @submit.prevent="handleActualizarProducto">
          <div class="space-y-6">
            <div>
              <label for="codigo" class="block text-sm font-medium text-gray-700">Código / SKU</label>
              <input v-model="producto.codigo" type="text" id="codigo" required :disabled="teniaCodigoInicialmente" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" :class="{ 'bg-gray-100 text-gray-500 cursor-not-allowed': teniaCodigoInicialmente }">
              <p v-if="!teniaCodigoInicialmente" class="text-xs text-green-600 mt-1">Este producto no tiene código. Por favor, asígnale uno único.</p>
              <p v-else class="text-xs text-gray-500 mt-1">El código no se puede modificar una vez asignado.</p>
            </div>

            <div>
              <label for="nombre" class="block text-sm font-medium text-gray-700">Nombre del Producto</label>
              <input v-model="producto.nombre" type="text" id="nombre" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>

            <div>
              <label for="slug" class="block text-sm font-medium text-gray-700">URL Amigable (Slug)</label>
              <input :value="producto.slug || '(se generará al guardar)'" type="text" id="slug" disabled class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500">
            </div>

            <div>
              <label for="descripcion" class="block text-sm font-medium text-gray-700">Descripción Larga</label>
              <textarea v-model="producto.descripcion" id="descripcion" rows="5" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
            </div>

            <div>
              <label for="puntos_clave" class="block text-sm font-medium text-gray-700">Puntos Clave / Ficha Técnica</label>
              <textarea v-model="producto.puntos_clave" id="puntos_clave" rows="5" placeholder="Escribe cada punto en una nueva línea..." class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
              <p class="text-xs text-gray-500 mt-1">Cada línea se mostrará como un punto de viñeta.</p>
            </div>

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

            <div>
              <label for="badges" class="block text-sm font-medium text-gray-700">Badges / Etiquetas</label>
              <input v-model="badgesInput" type="text" id="badges" placeholder="Nuevo, Promo, Envío 24hs" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
              <p class="text-xs text-gray-500 mt-1">Escribe las etiquetas separadas por comas.</p>
            </div>

            <div>
              <label for="video_youtube_url" class="block text-sm font-medium text-gray-700">URL de Video de YouTube (Opcional)</label>
              <input v-model="producto.video_youtube_url" type="text" id="video_youtube_url" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Imágenes del Producto</label>
              <div v-if="imagenesActuales.length > 0" class="grid grid-cols-3 gap-4 mb-4">
                <div v-for="img in imagenesActuales" :key="img.id" class="relative group border rounded-md overflow-hidden">
                  <img :src="img.imagen_url" class="h-24 w-full object-cover">
                  <button @click="eliminarImagen(img)" type="button" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>
              <div v-else class="text-gray-500 text-sm mb-2">No hay imágenes cargadas.</div>
              <label class="block text-sm font-medium text-gray-700 mt-4">Añadir nuevas imágenes</label>
              <input @change="handleFileChange" type="file" accept="image/*" multiple class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
              <p v-if="nuevosArchivos.length > 0" class="text-xs text-gray-500 mt-1">Se subirán {{ nuevosArchivos.length }} nuevas imágenes al guardar.</p>
            </div>
          </div>
          
          <div class="mt-8 flex justify-end gap-4">
            <RouterLink to="/admin/productos" class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md">Cancelar</RouterLink>
            <button type="submit" :disabled="saving" class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>

      <div class="hidden lg:block">
        <ProductCardPreview 
          :nombre="producto.nombre"
          :descripcion="producto.descripcion"
          :precio="producto.precio"
          :imagen-url="imagenPrincipalUrl"
          :video-url="producto.video_youtube_url"
        />
      </div>
    </div>
  </div>
</template>