<!-- src/components/HeroSection.vue -->
<script setup>
defineProps({
  bloque: Object // Antes se llamaba 'config'
})
</script>
<template>
  <div class="relative bg-gray-800 text-white text-center py-20 md:py-32 overflow-hidden">
    <img :src="bloque.imagenFondoUrl" class="absolute top-0 left-0 w-full h-full object-cover opacity-30" alt="Fondo">
    <div class="relative container mx-auto px-4">
      <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight">{{ bloque.titulo }}</h1>
      <p class="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">{{ bloque.subtitulo }}</p>
      <RouterLink :to="bloque.cta.url" class="mt-8 inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full">
        {{ bloque.cta.texto }}
      </RouterLink>
    </div>
  </div>
</template>