// src/App.vue -> <script setup>

import { onMounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import { supabase } from './lib/supabaseClient'
import ToastNotification from './components/ToastNotification.vue'

const router = useRouter()

onMounted(() => {
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event)

    // --- LÓGICA CORREGIDA ---
    // Ahora solo redirigimos si el usuario acaba de iniciar sesión DESDE la página de login.
    if (event === 'SIGNED_IN' && router.currentRoute.value.path === '/login') {
      router.push('/admin')
    }
    
    // La lógica de cierre de sesión sigue siendo correcta.
    if (event === 'SIGNED_OUT') {
      router.push('/login')
    }
  })
})
</script>

<template>
  <!-- 
    Este es el contenedor raíz de toda la aplicación.
    Es muy simple a propósito. Su principal trabajo es:
    1. Renderizar la vista actual que determina el router.
    2. Proveer un lugar para componentes globales como las notificaciones.
  -->
  <div id="app-container">
    <!-- 
      RouterView es el componente especial de Vue Router. Actúa como un marcador de posición
      donde se inyectará dinámicamente el componente de la página correspondiente a la URL actual.
    -->
    <RouterView />

    <!-- 
      Colocamos nuestro componente de notificaciones aquí, en el nivel más alto.
      Esto asegura que pueda mostrarse por encima de cualquier otra página o modal,
      sin importar en qué ruta nos encontremos.
    -->
    <ToastNotification />
  </div>
</template>

<style>
/* 
  Importamos una fuente moderna y legible desde Google Fonts para mejorar la tipografía
  general de toda la aplicación, dándole un aspecto más profesional.
*/
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/*
  Aplicamos estilos base a la etiqueta <body> para una apariencia consistente.
  Usamos las clases de utilidad de TailwindCSS para mayor facilidad y mantenimiento.
*/
body {
  font-family: 'Inter', sans-serif; /* Establecemos la fuente por defecto para todo el texto */
  @apply bg-gray-50 text-gray-800; /* Definimos un color de fondo gris claro y un color de texto oscuro por defecto */
}
</style>