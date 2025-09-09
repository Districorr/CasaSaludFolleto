<!-- src/views/NosotrosView.vue -->
<script setup>
import { useSiteConfig } from '../composables/useSiteConfig'
const { config } = useSiteConfig()
</script>

<template>
  <div v-if="config">
    <div class="bg-white py-12">
      <div class="container mx-auto px-4">
        <div class="max-w-3xl mx-auto text-center">
          <h1 class="text-4xl font-extrabold tracking-tight" :style="{ color: config.configuracionGlobal.tema.colores.textoPrincipal }">
            {{ config.nosotros.titulo }}
          </h1>
          <p class="mt-4 text-lg" :style="{ color: config.configuracionGlobal.tema.colores.textoSecundario }">
            {{ config.nosotros.subtitulo }}
          </p>
        </div>

        <div class="max-w-3xl mx-auto mt-10 prose prose-lg text-gray-600">
          <p>{{ config.nosotros.parrafo_principal }}</p>
        </div>
      </div>
    </div>

    <div class="py-12" :style="{ backgroundColor: config.configuracionGlobal.tema.colores.fondo }">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 class="text-2xl font-bold mb-4">Nuestra Misión</h2>
            <p class="text-gray-600">{{ config.nosotros.mision }}</p>
          </div>
          <div>
            <h2 class="text-2xl font-bold mb-4">Nuestra Visión</h2>
            <p class="text-gray-600">{{ config.nosotros.vision }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white py-12">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">Nuestros Valores</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div v-for="valor in config.nosotros.valores" :key="valor.valor" class="text-center">
            <h3 class="text-xl font-semibold" :style="{ color: config.configuracionGlobal.tema.colores.primario }">{{ valor.valor }}</h3>
            <p class="mt-2 text-sm text-gray-500">{{ valor.descripcion }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>