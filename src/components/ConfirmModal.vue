<!-- src/components/ConfirmModal.vue -->
<script setup>
defineProps({
  titulo: String,
  mensaje: String,
})
const emit = defineEmits(['confirmar', 'cancelar'])
</script>

<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
      <h3 class="text-lg font-medium leading-6 text-gray-900">{{ titulo }}</h3>
      <div class="mt-2">
        <p class="text-sm text-gray-500">{{ mensaje }}</p>
      </div>
      <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button @click="emit('confirmar')" type="button" class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">
          Confirmar
        </button>
        <button @click="emit('cancelar')" type="button" class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>