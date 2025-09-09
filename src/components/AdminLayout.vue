<!-- src/components/AdminLayout.vue (Versión Rediseñada) -->
<script setup>
import { computed } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const route = useRoute()

// Mapeo de nombres de ruta a títulos legibles
const pageTitles = {
  'admin-productos': 'Productos',
  'admin-productos-nuevo': 'Crear Producto',
  'admin-productos-editar': 'Editar Producto',
  'admin-productos-importar': 'Importar Productos',
  'admin-catalogos': 'Catálogos',
  'admin-catalogos-nuevo': 'Crear Catálogo',
  'admin-catalogos-editar': 'Editar Catálogo',
  'admin-configuracion': 'Configuración del Sitio',
}

// Propiedad computada para mostrar el título de la página actual
const currentPageTitle = computed(() => {
  return pageTitles[route.name] || 'Dashboard'
})

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    router.push('/login')
  } else {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100 font-sans">
    <!-- Barra Lateral -->
    <aside class="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <!-- Logo en la Barra Lateral -->
      <div class="h-16 flex items-center justify-center px-4 border-b border-gray-700">
        <img src="/logoizq.svg" alt="Logo Casa Salud" class="h-8 w-auto mr-2"/>
        <span class="text-xl font-bold">Casa Salud</span>
      </div>
      
      <nav class="flex-1 px-2 py-4 space-y-1">
        <RouterLink to="/admin/productos" class="nav-link" active-class="bg-gray-900">
          <!-- Icono Productos -->
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
          <span>Productos</span>
        </RouterLink>
        <RouterLink to="/admin/catalogos" class="nav-link" active-class="bg-gray-900">
          <!-- Icono Catálogos -->
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
          <span>Catálogos</span>
        </RouterLink>
        <RouterLink to="/admin/configuracion" class="nav-link" active-class="bg-gray-900">
          <!-- Icono Configuración -->
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          <span>Configuración</span>
        </RouterLink>
      </nav>
      
      <div class="p-4 mt-auto border-t border-gray-700">
        <button @click="handleLogout" class="w-full nav-link">
          <!-- Icono Cerrar Sesión -->
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header del Contenido -->
      <header class="bg-white shadow-sm z-10">
        <div class="container mx-auto px-6 py-4">
          <h1 class="text-2xl font-bold text-gray-800">{{ currentPageTitle }}</h1>
        </div>
      </header>
      
      <!-- Área de Contenido con Scroll -->
      <main class="flex-1 overflow-y-auto p-6">
        <div class="container mx-auto max-w-7xl">
          <!-- El slot anónimo donde se renderizará la vista actual -->
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.nav-link {
  @apply flex items-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition-colors;
}
</style>