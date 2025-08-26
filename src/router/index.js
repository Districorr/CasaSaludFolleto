// src/router/index.js (Versión Final y Completa)

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

// --- 1. IMPORTACIÓN DE TODOS LOS COMPONENTES DE VISTAS ---
// Vistas Generales y Públicas
import LoginView from '../views/LoginView.vue'
import CatalogoPublicoView from '../views/CatalogoPublicoView.vue'

// Layout del Panel de Administración
import AdminLayout from '../components/AdminLayout.vue'

// Vistas de Gestión de Productos
import ProductosView from '../views/ProductosView.vue'
import CrearProductoView from '../views/CrearProductoView.vue'
import EditarProductoView from '../views/EditarProductoView.vue'
import ImportarProductosView from '../views/ImportarProductosView.vue'

// Vistas de Gestión de Catálogos
import CatalogosView from '../views/CatalogosView.vue'
import CrearCatalogoView from '../views/CrearCatalogoView.vue'
import EditarCatalogoView from '../views/EditarCatalogoView.vue'


// --- 2. DEFINICIÓN DE LAS RUTAS ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Ruta raíz, redirige al login por defecto
    {
      path: '/',
      redirect: '/login'
    },
    
    // --- RUTAS PÚBLICAS (accesibles sin iniciar sesión) ---
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/c/:slug', // Ruta dinámica para los catálogos públicos
      name: 'catalogo-publico',
      component: CatalogoPublicoView
    },

    // --- RUTAS PRIVADAS (requieren iniciar sesión) ---
    {
      path: '/admin',
      component: AdminLayout, // Usan el layout con el menú lateral
      children: [
        // Redirección por defecto del panel de admin
        { path: '', redirect: '/admin/productos' },

        // Rutas de Productos
        { path: 'productos', name: 'admin-productos', component: ProductosView },
        { path: 'productos/nuevo', name: 'admin-productos-nuevo', component: CrearProductoView },
        { path: 'productos/editar/:id', name: 'admin-productos-editar', component: EditarProductoView },
        { path: 'productos/importar', name: 'admin-productos-importar', component: ImportarProductosView },

        // Rutas de Catálogos
        { path: 'catalogos', name: 'admin-catalogos', component: CatalogosView },
        { path: 'catalogos/nuevo', name: 'admin-catalogos-nuevo', component: CrearCatalogoView },
        { path: 'catalogos/editar/:id', name: 'admin-catalogos-editar', component: EditarCatalogoView }
      ]
    }
  ]
})


// --- 3. GUARDIA DE NAVEGACIÓN GLOBAL (SEGURIDAD) ---
// Este código se ejecuta antes de cada cambio de página.
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  // Si el usuario intenta ir a una ruta que empieza con '/admin' Y no tiene una sesión activa...
  if (to.path.startsWith('/admin') && !session) {
    // ...lo redirigimos a la página de login.
    next('/login')
  } else {
    // En cualquier otro caso (va a una ruta pública, o va a /admin y SÍ tiene sesión), lo dejamos pasar.
    next()
  }
})


// --- 4. EXPORTACIÓN DEL ROUTER ---
export default router