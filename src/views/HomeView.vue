// src/views/HomeView.vue

<script setup>
import { computed } from 'vue' // Ya no necesitamos shallowRef
import { useSiteConfig } from '../composables/useSiteConfig'

// Importamos todos los componentes de bloque que podemos renderizar
import HeroSection from '../components/blocks/HeroSection.vue'
import FeaturedItems from '../components/blocks/FeaturedItems.vue'
import BannerPromo from '../components/blocks/BannerPromo.vue'

const { config } = useSiteConfig()

// --- CORRECCIÓN AQUÍ ---
// Simplemente creamos un objeto plano. No necesitamos 'shallowRef'.
const blockMap = {
  hero: HeroSection,
  destacados: FeaturedItems,
  banner_promo: BannerPromo,
}
// -----------------------

const bloquesActivos = computed(() => {
  if (!config.value?.home?.bloques) return []
  return config.value.home.bloques.filter(bloque => bloque.activo)
})
</script>
<template>
  <div v-if="config">
    <!-- Recorremos el array de bloques activos -->
    <div v-for="(bloque, index) in bloquesActivos" :key="bloque.id">
      <!-- Usamos el componente dinámico de Vue -->
      <!-- :is="blockMap[bloque.tipo]" buscará en nuestro mapa el componente correcto -->
      <!-- y lo renderizará, pasándole los datos del bloque como prop. -->
      <component 
        :is="blockMap[bloque.tipo]" 
        :bloque="bloque"
        :class="{ 'md:flex-row-reverse': bloque.tipo === 'banner_promo' && index % 2 !== 0 }"
      />
    </div>
  </div>
</template>