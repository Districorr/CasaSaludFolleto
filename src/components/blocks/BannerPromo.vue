<!-- src/components/blocks/BannerPromo.vue -->
<script setup>
defineProps({
  bloque: Object
})
</script>
<template>
  <div class="flex flex-col md:flex-row items-center gap-8">
    <div class="md:w-1/2">
      <img :src="bloque.imagen_url" class="rounded-lg shadow-lg w-full">
    </div>
    <div class="md:w-1/2">
      <h2 class="text-3xl font-bold">{{ bloque.titulo }}</h2>
      <p class="mt-4 text-gray-600">{{ bloque.descripcion }}</p>
      <RouterLink v-if="bloque.cta_url" :to="bloque.cta_url" class="mt-6 inline-block bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-6 rounded">
        {{ bloque.cta_texto }}
      </RouterLink>
    </div>
  </div>
</template>