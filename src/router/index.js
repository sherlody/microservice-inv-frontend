import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Productos from '../components/Productos.vue';
import Historial from '../components/HistorialVentas.vue';
import Ventas from '../components/Ventas.vue';

const routes = [
  {
    path: '/',
    redirect: '/productos',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true },
  },
  {
    path: '/productos',
    name: 'Productos',
    component: Productos,
  },
  {
    path: '/nueva-venta',
    name: 'NuevaVenta',
    component: Ventas,
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: Historial,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación para proteger rutas privadas
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_token');

  if (!to.meta.public && !isAuthenticated) {
    // Si la ruta requiere login y no hay sesión, redirige a /login
    next('/login');
  } else if (to.path === '/login' && isAuthenticated) {
    // Si ya inició sesión e intenta volver a /login, lo manda al dashboard
    next('/productos');
  } else {
    next();
  }
});

export default router;
