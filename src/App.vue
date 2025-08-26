<!-- src/App.vue -->
<script setup>
// Importamos los componentes necesarios de Vue y de nuestro proyecto.
import { RouterView } from 'vue-router'
import ToastNotification from './components/ToastNotification.vue'
</script>

<template>
  <!-- 
    Este es el contenedor principal de toda la aplicación.
    Dentro de él se renderizará todo lo demás.
  -->
  <div id="app-container">
    <!-- 
      RouterView es el corazón de la navegación. Vue reemplazará esta etiqueta
      con el componente de la página correspondiente a la URL actual.
      (Ej: /login -> LoginView.vue, /admin/productos -> ProductosView.vue)
    -->
    <RouterView />

    <!-- 
      Colocamos nuestro componente de notificaciones aquí, fuera del RouterView.
      Esto asegura que pueda mostrarse por encima de cualquier página,
      sin importar en qué ruta nos encontremos.
    -->
    <ToastNotification />
  </div>
</template>

<style>
/* 
  Importamos una fuente moderna desde Google Fonts para mejorar la tipografía
  general de la aplicación.
*/
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/*
  Aplicamos estilos base a toda la aplicación para una apariencia consistente.
  Usamos las clases de TailwindCSS para mayor facilidad.
*/
body {
  font-family: 'Inter', sans-serif; /* Establecemos la fuente por defecto */
  @apply bg-gray-50 text-gray-800; /* Color de fondo y texto por defecto */
}
</style>