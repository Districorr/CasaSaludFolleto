<script setup>
import { ref, onMounted, shallowRef } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { useToast } from '../lib/useToast'
import draggable from 'vuedraggable'

// Importamos los componentes de formulario de forma dinámica
import FormHero from '../components/forms/FormHero.vue'
import FormDestacados from '../components/forms/FormDestacados.vue'
import FormBannerPromo from '../components/forms/FormBannerPromo.vue'

const { showToast } = useToast()

const config = ref(null)
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('general')

// --- Lógica del Modal de Edición ---
const isModalOpen = ref(false)
const bloqueAEditar = ref(null)
const formComponent = shallowRef(null)

const formMap = {
  hero: FormHero,
  destacados: FormDestacados,
  banner_promo: FormBannerPromo,
}

function abrirModalEdicion(bloque) {
  bloqueAEditar.value = JSON.parse(JSON.stringify(bloque))
  formComponent.value = formMap[bloque.tipo]
  isModalOpen.value = true
}

function guardarEdicionBloque() {
  const index = config.value.home.bloques.findIndex(b => b.id === bloqueAEditar.value.id)
  if (index !== -1) {
    const bloqueOriginal = config.value.home.bloques[index];
    const bloqueGuardado = { ...bloqueOriginal, ...bloqueAEditar.value };
    config.value.home.bloques[index] = bloqueGuardado;
  }
  cerrarModal()
}

function cerrarModal() {
  isModalOpen.value = false
  bloqueAEditar.value = null
  formComponent.value = null
}

async function fetchConfiguracion() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('sitio_configuracion')
      .select('config_json')
      .eq('id', true)
      .single()

    if (error) throw error
    if (data) {
      // Saneamiento de datos para asegurar que las propiedades existan
      if (data.config_json.home && Array.isArray(data.config_json.home.bloques)) {
        data.config_json.home.bloques = data.config_json.home.bloques.filter(b => b && typeof b === 'object');
      }
      config.value = data.config_json
    }
  } catch (error) {
    showToast('Error al cargar la configuración: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchConfiguracion)

async function handleGuardar() {
  if (!config.value) return
  try {
    saving.value = true
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('sitio_configuracion')
      .update({ 
        config_json: config.value,
        actualizado_por: user.id,
        actualizado_en: new Date().toISOString(),
      })
      .eq('id', true)
    if (error) throw error
    showToast('¡Configuración guardada con éxito!', 'success')
  } catch (error) {
    showToast('Error al guardar la configuración: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

// --- Funciones para gestionar listas dinámicas ---
function addNavItem() {
  if (!config.value.navegacion) config.value.navegacion = []
  config.value.navegacion.push({ texto: 'Nuevo Enlace', url: '/', visible: true })
}
function removeNavItem(index) {
  config.value.navegacion.splice(index, 1)
}
function addCategory() {
  if (!config.value.categorias) config.value.categorias = []
  config.value.categorias.push({ nombre: 'Nueva Categoría', slug: 'nueva-categoria', descripcion: '', imagen_destacada: '' })
}
function removeCategory(index) {
  config.value.categorias.splice(index, 1)
}
function addBlock(tipo) {
  if (!config.value.home.bloques) config.value.home.bloques = []
  
  let newBlockData = {};
  
  switch (tipo) {
    case 'hero':
      newBlockData = { titulo: 'Nuevo Título Hero', subtitulo: 'Subtítulo', imagenFondoUrl: '', cta: { texto: 'Botón', url: '/' } };
      break;
    case 'destacados':
      newBlockData = { titulo: 'Nueva Sección de Destacados', activo: true, items: [] };
      break;
    case 'banner_promo':
      newBlockData = { titulo: 'Nuevo Banner Promocional', descripcion: '', imagen_url: '', cta_texto: 'Ver más', cta_url: '/' };
      break;
    default:
      newBlockData = { titulo: 'Nuevo Bloque' };
  }

  const newBlock = {
    id: `${tipo}-${Date.now()}`,
    tipo: tipo,
    activo: true,
    ...newBlockData
  }
  config.value.home.bloques.push(newBlock)
}
function removeBlock(id) {
  config.value.home.bloques = config.value.home.bloques.filter(b => b.id !== id)
}
</script>
<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Configuración del Sitio</h1>
      <button @click="handleGuardar" :disabled="saving" class="px-6 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
        {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
      </button>
    </div>

    <!-- Modal de Edición de Bloque -->
    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <header class="p-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold">Editando Bloque: {{ bloqueAEditar.tipo }}</h2>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600">&times;</button>
        </header>
        <main class="p-6 max-h-[60vh] overflow-y-auto">
          <component :is="formComponent" v-model="bloqueAEditar" />
        </main>
        <footer class="p-4 bg-gray-50 flex justify-end gap-4">
          <button @click="cerrarModal" class="px-4 py-2 bg-gray-200 rounded-md">Cancelar</button>
          <button @click="guardarEdicionBloque" class="px-4 py-2 bg-blue-600 text-white rounded-md">Guardar Cambios</button>
        </footer>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">Cargando configuración...</div>
    
    <div v-else-if="config" class="bg-white rounded-lg shadow-md">
      <!-- Pestañas de Navegación -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex gap-6 px-6 overflow-x-auto">
          <button @click="activeTab = 'general'" :class="['py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === 'general' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500']">General</button>
          <button @click="activeTab = 'home'" :class="['py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === 'home' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500']">Página de Inicio</button>
          <button @click="activeTab = 'nosotros'" :class="['py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === 'nosotros' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500']">Nosotros</button>
          <button @click="activeTab = 'categorias'" :class="['py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === 'categorias' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500']">Categorías</button>
          <button @click="activeTab = 'contacto'" :class="['py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap', activeTab === 'contacto' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500']">Contacto y Footer</button>
        </nav>
      </div>

      <!-- Contenido de las Pestañas -->
      <div class="p-6">
        <div v-show="activeTab === 'general'">
          <div class="space-y-6">
            <section>
              <h2 class="text-xl font-semibold mb-4">Información General y Tema</h2>
              <div class="space-y-4">
                <div><label>Nombre de la Empresa</label><input type="text" v-model="config.configuracionGlobal.nombreEmpresa" class="form-input"></div>
                <div><label>Lema</label><input type="text" v-model="config.configuracionGlobal.lema" class="form-input"></div>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <div><label>Primario</label><input type="color" v-model="config.configuracionGlobal.tema.colores.primario"></div>
                  <div><label>Secundario</label><input type="color" v-model="config.configuracionGlobal.tema.colores.secundario"></div>
                  <div><label>Acento</label><input type="color" v-model="config.configuracionGlobal.tema.colores.acento"></div>
                  <div><label>Fondo</label><input type="color" v-model="config.configuracionGlobal.tema.colores.fondo"></div>
                  <div><label>Texto Principal</label><input type="color" v-model="config.configuracionGlobal.tema.colores.textoPrincipal"></div>
                </div>
              </div>
            </section>
            <section class="border-t pt-6">
              <h2 class="text-xl font-semibold mb-4">Menú de Navegación Principal</h2>
              <div class="space-y-4">
                <div v-for="(item, index) in config.navegacion" :key="index" class="flex items-center gap-4 p-3 bg-gray-50 rounded-md">
                  <div class="flex-1 grid grid-cols-2 gap-4">
                    <input type="text" v-model="item.texto" placeholder="Texto del enlace" class="form-input">
                    <input type="text" v-model="item.url" placeholder="URL (ej: /contacto)" class="form-input">
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="flex items-center">
                      <input type="checkbox" v-model="item.visible" :id="`nav-visible-${index}`" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                      <label :for="`nav-visible-${index}`" class="ml-2 text-sm text-gray-600">Visible</label>
                    </div>
                    <button @click="removeNavItem(index)" class="text-red-500 font-semibold text-sm">Eliminar</button>
                  </div>
                </div>
                <button @click="addNavItem" class="text-sm text-blue-600 font-semibold">+ Añadir enlace al menú</button>
              </div>
            </section>
          </div>
        </div>

        <div v-show="activeTab === 'home'">
          <h2 class="text-xl font-semibold mb-4">Constructor de la Página de Inicio</h2>
          <p class="text-sm text-gray-500 mb-4">Arrastra los bloques para reordenarlos. Activa o desactiva su visibilidad con el check.</p>
          <draggable v-if="config.home && config.home.bloques" v-model="config.home.bloques" item-key="id" handle=".handle" class="space-y-4">
            <template #item="{ element: bloque }">
              <div v-if="bloque && typeof bloque === 'object'" class="flex items-center gap-4 p-4 border rounded-md bg-gray-50">
                <div class="handle cursor-move text-gray-400 hover:text-gray-800">⠿</div>
                <div class="flex-1">
                  <p class="font-semibold">{{ bloque.titulo || `Bloque sin título` }}</p>
                  <p class="text-xs text-gray-500 uppercase">{{ bloque.tipo || 'Tipo desconocido' }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <input type="checkbox" v-model="bloque.activo" title="Mostrar/Ocultar bloque" class="h-5 w-5">
                  <button @click="abrirModalEdicion(bloque)" class="text-sm text-blue-600 font-semibold">Editar</button>
                  <button @click="removeBlock(bloque.id)" class="text-sm text-red-500 font-semibold">Eliminar</button>
                </div>
              </div>
            </template>
          </draggable>
          <div class="mt-6 border-t pt-4">
            <h3 class="font-semibold mb-2">Añadir Nuevo Bloque:</h3>
            <div class="flex gap-2">
              <button @click="addBlock('banner_promo')" class="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">+ Banner</button>
              <button @click="addBlock('destacados')" class="text-sm bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">+ Destacados</button>
            </div>
          </div>
        </div>

        <div v-show="activeTab === 'nosotros'">
          <h2 class="text-xl font-semibold mb-4">Página "Quiénes Somos"</h2>
          <div class="space-y-4">
            <div><label>Título</label><input type="text" v-model="config.nosotros.titulo" class="form-input"></div>
            <div><label>Subtítulo</label><input type="text" v-model="config.nosotros.subtitulo" class="form-input"></div>
            <div><label>Párrafo Principal</label><textarea v-model="config.nosotros.parrafo_principal" rows="5" class="form-input"></textarea></div>
            <div><label>Misión</label><textarea v-model="config.nosotros.mision" rows="3" class="form-input"></textarea></div>
            <div><label>Visión</label><textarea v-model="config.nosotros.vision" rows="3" class="form-input"></textarea></div>
          </div>
        </div>

        <div v-show="activeTab === 'categorias'">
          <h2 class="text-xl font-semibold mb-4">Gestión de Categorías</h2>
          <div class="space-y-6">
            <div v-for="(cat, index) in config.categorias" :key="index" class="p-4 border rounded-md space-y-4 relative">
              <button @click="removeCategory(index)" class="absolute top-2 right-2 text-red-500 text-xs font-semibold">Eliminar</button>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label>Nombre</label><input type="text" v-model="cat.nombre" class="form-input"></div>
                <div><label>Slug (URL)</label><input type="text" v-model="cat.slug" class="form-input"></div>
              </div>
              <div><label>Descripción</label><textarea v-model="cat.descripcion" rows="2" class="form-input"></textarea></div>
              <div><label>URL de Imagen Destacada</label><input type="text" v-model="cat.imagen_destacada" class="form-input"></div>
            </div>
            <button @click="addCategory" class="text-sm text-blue-600 font-semibold">+ Añadir nueva categoría</button>
          </div>
        </div>

        <div v-show="activeTab === 'contacto'">
          <div class="space-y-6">
            <section>
              <h2 class="text-xl font-semibold mb-4">Página de Contacto</h2>
              <div><label>Título</label><input type="text" v-model="config.contacto.titulo" class="form-input"></div>
              <div><label>Subtítulo</label><textarea v-model="config.contacto.subtitulo" rows="2" class="form-input"></textarea></div>
            </section>
            <section class="border-t pt-6">
              <h2 class="text-xl font-semibold mb-4">Datos de Contacto Principales</h2>
              <div><label>WhatsApp</label><input type="text" v-model="config.configuracionGlobal.contactoPrincipal.whatsapp" class="form-input"></div>
              <div><label>Email</label><input type="text" v-model="config.configuracionGlobal.contactoPrincipal.email" class="form-input"></div>
              <div><label>Dirección</label><input type="text" v-model="config.configuracionGlobal.contactoPrincipal.direccion" class="form-input"></div>
              <div><label>Horario</label><input type="text" v-model="config.configuracionGlobal.contactoPrincipal.horario" class="form-input"></div>
            </section>
            <section class="border-t pt-6">
              <h2 class="text-xl font-semibold mb-4">Footer</h2>
              <div><label>Mensaje del Pie de Página</label><input type="text" v-model="config.footer.mensaje" class="form-input"></div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.handle { font-size: 1.5rem; line-height: 1; }
.form-input { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500; }
label { @apply block text-sm font-medium text-gray-700 mb-1; }
input[type="color"] { @apply p-1 border border-gray-300 rounded-md cursor-pointer h-10 w-full; }
</style>