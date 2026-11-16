<style scoped src="./barra.css"></style>

<template>
  <div class="app-layout">
    <!-- Barra lateral izquierda visible solo cuando hay sesión activa -->
    <aside v-if="mostrarSidebar" class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand">Ventas de Productos
        </div>
        <span class="user-badge">👤 {{ nombreUsuario }}</span>
      </div>

      <nav class="sidebar-links">
        <router-link to="/productos" active-class="active">
          📦 Productos
        </router-link>
        <router-link to="/nueva-venta" active-class="active">
          🛒 Nueva Venta
        </router-link>
        <router-link to="/ventas" active-class="active">
          🧾 Historial Ventas
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <button @click="cerrarSesion" class="btn-logout">
          Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Área de contenido principal a la derecha -->
    <main :class="mostrarSidebar ? 'main-content' : 'full-content'">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Oculta la barra lateral en la vista de Login
const mostrarSidebar = computed(() => route.path !== '/login');

// Muestra el nombre del usuario guardado en localStorage
const nombreUsuario = computed(() => localStorage.getItem('usuario_nombre') || 'Admin');

const cerrarSesion = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('usuario_nombre');
  router.push('/login');
};
</script>