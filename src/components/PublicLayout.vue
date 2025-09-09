// src/components/PublicLayout.vue -> <script setup>

import { RouterView, RouterLink } from 'vue-router'
import { useSiteConfig } from '../composables/useSiteConfig'

// CORRECCIÓN: Obtenemos TODAS las variables que el template necesita, no solo 'config'.
const { config, loading, error } = useSiteConfig()

// La llamada a fetchConfig() ya no es necesaria aquí,
// porque la guarda del router se encarga de eso.
</script>
<!-- src/components/PublicLayout.vue -->
<template>
  <div v-if="loading" class="flex items-center justify-center h-screen">
    <p class="text-gray-500">Cargando sitio...</p>
  </div>

  <div v-else-if="error" class="flex items-center justify-center h-screen p-4 text-center">
    <div>
      <h2 class="text-xl font-bold text-red-600">Error de Configuración</h2>
      <p class="text-gray-600 mt-2">No se pudo cargar la configuración del sitio. Por favor, inténtalo de nuevo más tarde.</p>
    </div>
  </div>
  
  <!-- === INICIO DE CAMBIOS === -->
  <!-- Añadimos clases de Flexbox para controlar el layout vertical -->
  <div v-else-if="config" class="flex flex-col min-h-screen">
    <!-- Header del Sitio -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <RouterLink to="/">
          <img src="/logoizq.svg" alt="Logo Casa Salud" class="h-8 w-auto">
        </RouterLink>
        <nav class="hidden md:flex items-center gap-6">
          <RouterLink v-for="link in config.navegacion" :key="link.texto" :to="link.url"
             class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
             active-class="text-blue-600">
            {{ link.texto }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <!-- Contenido Principal de la Página -->
    <!-- La clase 'flex-grow' hace que esta sección ocupe todo el espacio disponible -->
    <main class="flex-grow">
      <RouterView />
    </main>

    <!-- Footer del Sitio -->
    <footer class="bg-gray-800 text-white">
      <div class="container mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>{{ config.footer.mensaje }}</p>
      </div>
    </footer>
  </div>
  <!-- === FIN DE CAMBIOS === -->
</template>