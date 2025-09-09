<!-- src/components/forms/FormDestacados.vue -->
<script setup>
const model = defineModel()
</script>
<template>
  <div class="space-y-4">
    <div><label>Título de la Sección</label><input type="text" v-model="model.titulo" class="form-input"></div>
    <p class="text-sm text-gray-500">La selección de productos y catálogos destacados se gestionará en una futura versión.</p>
  </div>
</template>
<style scoped> .form-input { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md; } label { @apply block text-sm font-medium text-gray-700; } </style>