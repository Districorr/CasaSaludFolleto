<!-- src/views/ContactoView.vue (Corregido) -->
<script setup>
import { useSiteConfig } from '../composables/useSiteConfig'
const { config } = useSiteConfig()
</script>

<template>
  <div v-if="config" class="py-12">
    <div class="container mx-auto px-4">
      <div class="max-w-2xl mx-auto text-center">
        <h1 class="text-4xl font-extrabold tracking-tight">{{ config.contacto.titulo }}</h1>
        <p class="mt-4 text-lg text-gray-600">{{ config.contacto.subtitulo }}</p>
      </div>

      <div class="mt-12 max-w-lg mx-auto grid grid-cols-1 gap-8">
        <a :href="`https://wa.me/${config.configuracionGlobal.contactoPrincipal.whatsapp}`" target="_blank" class="bg-white p-6 rounded-lg shadow-md flex items-center gap-4 transition-shadow hover:shadow-lg">
          <div class="flex-shrink-0 bg-green-100 text-green-600 p-3 rounded-full">
            <!-- Icono de WhatsApp CORREGIDO -->
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.273-.099-.471-.148-.67.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.67-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.523.074-.797.372-.273.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"></path></svg>
          </div>
          <div>
            <h3 class="font-semibold">WhatsApp</h3>
            <p class="text-blue-600 hover:underline">{{ config.configuracionGlobal.contactoPrincipal.whatsapp }}</p>
          </div>
        </a>
        <a :href="`mailto:${config.configuracionGlobal.contactoPrincipal.email}`" class="bg-white p-6 rounded-lg shadow-md flex items-center gap-4 transition-shadow hover:shadow-lg">
          <div class="flex-shrink-0 bg-blue-100 text-blue-600 p-3 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <h3 class="font-semibold">Email</h3>
            <p class="text-blue-600 hover:underline">{{ config.configuracionGlobal.contactoPrincipal.email }}</p>
          </div>
        </a>
        <div class="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
          <div class="flex-shrink-0 bg-gray-100 text-gray-600 p-3 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          </div>
          <div>
            <h3 class="font-semibold">Dirección</h3>
            <p>{{ config.configuracionGlobal.contactoPrincipal.direccion }}</p>
            <p class="text-sm text-gray-500">{{ config.configuracionGlobal.contactoPrincipal.horario }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>