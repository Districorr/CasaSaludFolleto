// src/composables/useListaCotizacion.js

import { ref, computed } from 'vue'

// --- Estado Reactivo ---
// Usamos 'ref' para crear una variable reactiva que contendrá los IDs de los productos.
// Al estar fuera de la función 'export', actúa como un 'singleton' (un único estado para toda la app).
const listaIds = ref(new Set())

export function useListaCotizacion() {
  
  // --- Propiedades Computadas ---

  // Un contador reactivo del número de productos en la lista.
  const totalProductos = computed(() => listaIds.value.size)

  // Devuelve la lista de IDs como un array simple.
  const listaComoArray = computed(() => Array.from(listaIds.value))

  // --- Funciones (Acciones) ---

  /**
   * Añade un producto a la lista de cotización.
   * @param {string} productoId - El ID del producto a añadir.
   */
  function anadirProducto(productoId) {
    listaIds.value.add(productoId)
  }

  /**
   * Quita un producto de la lista de cotización.
   * @param {string} productoId - El ID del producto a quitar.
   */
  function quitarProducto(productoId) {
    listaIds.value.delete(productoId)
  }

  /**
   * Comprueba si un producto ya está en la lista.
   * @param {string} productoId - El ID del producto a comprobar.
   * @returns {boolean} - True si el producto está en la lista.
   */
  function estaEnLista(productoId) {
    return listaIds.value.has(productoId)
  }

  /**
   * Alterna la presencia de un producto en la lista.
   * Si está, lo quita. Si no está, lo añade.
   * @param {string} productoId - El ID del producto a alternar.
   */
  function alternarProducto(productoId) {
    if (estaEnLista(productoId)) {
      quitarProducto(productoId)
    } else {
      anadirProducto(productoId)
    }
  }

  /**
   * Vacía completamente la lista de cotización.
   */
  function limpiarLista() {
    listaIds.value.clear()
  }

  // Exponemos el estado y las funciones para que puedan ser usados por los componentes.
  return {
    totalProductos,
    listaComoArray,
    anadirProducto,
    quitarProducto,
    estaEnLista,
    alternarProducto,
    limpiarLista,
  }
}