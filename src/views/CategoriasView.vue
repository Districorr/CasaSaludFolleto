<!-- src/views/CategoriasView.vue -->
<script setup>
import { useSiteConfig } from '../composables/useSiteConfig'
const { config } = useSiteConfig()
</script>

<template>
  <div v-if="config" class="py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto text-center mb-12">
        <h1 class="text-4xl font-extrabold tracking-tight">Nuestras Categorías</h1>
        <p class="mt-4 text-lg text-gray-600">Explora nuestra amplia gama de soluciones en salud y bienestar.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <RouterLink v-for="categoria in config.categorias" :key="categoria.slug" 
                    :to="`/categorias/${categoria.slug}`" 
                    class="block bg-white rounded-lg shadow-md overflow-hidden group transition-shadow hover:shadow-xl">
          <div class="aspect-video overflow-hidden">
            <img :src="categoria.imagen_destacada" :alt="categoria.nombre" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110">
          </div>
          <div class="p-6">
            <h2 class="text-xl font-bold">{{ categoria.nombre }}</h2>
            <p class="mt-2 text-sm text-gray-600">{{ categoria.descripcion }}</p>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>