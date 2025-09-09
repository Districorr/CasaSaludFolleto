// src/router/index.js (Versión Restaurada y Funcional)

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useSiteConfig } from '../composables/useSiteConfig'

// --- 1. IMPORTACIONES ---

// Layouts Principales
import PublicLayout from '../components/PublicLayout.vue'
import AdminLayout from '../components/AdminLayout.vue'

// Vistas Públicas (Sitio Principal y Catálogos)
import HomeView from '../views/HomeView.vue'
import NosotrosView from '../views/NosotrosView.vue'
import ContactoView from '../views/ContactoView.vue'
import CategoriasView from '../views/CategoriasView.vue'
import ProductosPorCategoriaView from '../views/ProductosPorCategoriaView.vue'
import ProductoDetalleView from '../views/ProductoDetalleView.vue'
import CatalogoPublicoView from '../views/CatalogoPublicoView.vue'

// Vistas "Standalone"
import LoginView from '../views/LoginView.vue'

// Vistas de Administración
import ConfiguracionSitioView from '../views/ConfiguracionSitioView.vue'
import ProductosView from '../views/ProductosView.vue'
import CrearProductoView from '../views/CrearProductoView.vue'
import EditarProductoView from '../views/EditarProductoView.vue'
import ImportarProductosView from '../views/ImportarProductosView.vue'
import CatalogosView from '../views/CatalogosView.vue'
import CrearCatalogoView from '../views/CrearCatalogoView.vue'
import EditarCatalogoView from '../views/EditarCatalogoView.vue'


// --- 2. DEFINICIÓN DE LAS RUTAS ---
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- A) RUTAS DEL SITIO PÚBLICO (usan PublicLayout) ---
    {
      path: '/',
      component: PublicLayout,
      beforeEnter: async (to, from, next) => {
        const { config, fetchConfig } = useSiteConfig()
        if (!config.value) {
          await fetchConfig()
        }
        next()
      },
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'nosotros', name: 'nosotros', component: NosotrosView },
        { path: 'contacto', name: 'contacto', component: ContactoView },
        { path: 'categorias', name: 'categorias', component: CategoriasView },
        { 
          path: 'categorias/:slug', 
          name: 'productos-por-categoria', 
          component: ProductosPorCategoriaView 
        },
        {
          path: 'producto/:slug',
          name: 'producto-detalle',
          component: ProductoDetalleView
        },
        {
          path: 'c/:slug',
          name: 'catalogo-publico',
          component: CatalogoPublicoView
        }
      ]
    },

    // --- B) RUTA DE LOGIN (standalone) ---
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },

    // --- C) RUTAS DE ADMINISTRACIÓN (usan AdminLayout) ---
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        { path: '', redirect: '/admin/productos' },
        { path: 'configuracion', name: 'admin-configuracion', component: ConfiguracionSitioView },
        { path: 'productos', name: 'admin-productos', component: ProductosView },
        { path: 'productos/nuevo', name: 'admin-productos-nuevo', component: CrearProductoView },
        { path: 'productos/editar/:id', name: 'admin-productos-editar', component: EditarProductoView },
        { path: 'productos/importar', name: 'admin-productos-importar', component: ImportarProductosView },
        { path: 'catalogos', name: 'admin-catalogos', component: CatalogosView },
        { path: 'catalogos/nuevo', name: 'admin-catalogos-nuevo', component: CrearCatalogoView },
        { path: 'catalogos/editar/:id', name: 'admin-catalogos-editar', component: EditarCatalogoView }
      ]
    }
  ]
})


// --- 3. GUARDIA DE NAVEGACIÓN SIMPLE Y ORIGINAL ---
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  // La única responsabilidad de esta guarda es proteger las rutas de admin.
  if (to.path.startsWith('/admin') && !session) {
    next('/login')
  } else {
    next()
  }
})


// --- 4. EXPORTACIÓN DEL ROUTER ---
export default router