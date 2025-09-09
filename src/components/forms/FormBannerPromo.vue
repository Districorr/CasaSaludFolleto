<!-- src/components/forms/FormBannerPromo.vue -->
<script setup>
const model = defineModel()
</script>
<template>
  <div class="space-y-4">
    <div><label>Título</label><input type="text" v-model="model.titulo" class="form-input"></div>
    <div><label>Descripción</label><textarea v-model="model.descripcion" rows="3" class="form-input"></textarea></div>
    <div><label>URL de Imagen</label><input type="text" v-model="model.imagen_url" class="form-input"></div>
    <div><label>Texto del Botón</label><input type="text" v-model="model.cta_texto" class="form-input"></div>
    <div><label>URL del Botón</label><input type="text" v-model="model.cta_url" class="form-input"></div>
  </div>
</template>
<style scoped> .form-input { @apply mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md; } label { @apply block text-sm font-medium text-gray-700; } </style>