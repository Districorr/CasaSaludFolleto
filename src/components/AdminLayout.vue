<!-- src/components/AdminLayout.vue -->
<script setup>
import { RouterView, RouterLink, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()

async function handleLogout() {
  const { error } = await supabase.auth.signOut()
  if (!error) {
    // Si el logout es exitoso, redirigimos al login
    router.push('/login')
  } else {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Barra Lateral -->
    <aside class="w-64 flex-shrink-0 bg-gray-800 text-white flex flex-col">
      <div class="h-16 flex items-center justify-center text-xl font-bold">
        Casa Salud
      </div>
      <nav class="flex-1 px-2 py-4 space-y-2">
        <RouterLink
          to="/admin/productos"
          class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700"
          active-class="bg-gray-900"
        >
          Productos
        </RouterLink>
        <RouterLink
          to="/admin/catalogos"
          class="flex items-center px-4 py-2 rounded-md hover:bg-gray-700"
          active-class="bg-gray-900"
        >
          Catálogos
        </RouterLink>
      </nav>
      <div class="p-4">
        <button
          @click="handleLogout"
          class="w-full px-4 py-2 text-left rounded-md hover:bg-gray-700"
        >
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main class="flex-1 p-6 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>