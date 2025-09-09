<!-- src/components/forms/FormHero.vue -->
<script setup>
const model = defineModel() // Forma moderna de v-model en Vue 3.4+
</script>
<template>
  <div class="space-y-4">
    <div><label>Título</label><input type="text" v-model="model.titulo" class="form-input"></div>
    <div><label>Subtítulo</label><textarea v-model="model.subtitulo" rows="3" class="form-input"></textarea></div>
    <div><label>URL Imagen de Fondo</label><input type="text" v-model="model.imagenFondoUrl" class="form-input"></div>
    <div><label>Texto del Botón</label><input type="text" v-model="model.cta.texto" class="form-input"></div>
    <div><label>URL del Botón</label><input type="text" v-model="model.cta.url" class="form-input"></div>
  </div>
</template>
<style scoped> .form-input { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md; } label { @apply block text-sm font-medium text-gray-700; } </style>