<!-- src/views/LoginView.vue (Versión Final y Mejorada) -->
<script setup>
import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

const email = ref('')
const password = ref('')
const errorMessage = ref(null)
const loading = ref(false)

async function handleLogin() {
  try {
    loading.value = true
    errorMessage.value = null
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    // La redirección se maneja globalmente en App.vue
  } catch (error) {
    errorMessage.value = 'Email o contraseña incorrectos. Por favor, verifica tus datos.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 px-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="flex justify-center mb-6">
        <img src="/logoizq.svg" alt="Logo Casa Salud" class="h-12 w-auto">
      </div>

      <div class="bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold text-center text-gray-900">Iniciar Sesión</h2>
        <p class="text-center text-gray-600 mt-2">Acceso al Panel de Administración</p>
        
        <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Mensaje de Error -->
          <div v-if="errorMessage" class="p-3 text-sm text-red-800 bg-red-100 rounded-md text-center">
            {{ errorMessage }}
          </div>
          
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center items-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              <!-- Spinner de Carga -->
              <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ loading ? 'Ingresando...' : 'Ingresar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>