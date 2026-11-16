<style scoped src="./login.css"></style>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1>Venta de Productos</h1>
      <p class="subtitle">Inicia sesión para gestionar productos y ventas</p>

      <form @submit.prevent="iniciarSesion">
        <div class="form-group">
          <label for="usuario">Usuario</label>
          <input
            id="usuario"
            v-model="usuario"
            type="text"
            placeholder="Ej. admin"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="btn-primary">Ingresar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const usuario = ref('');
const password = ref('');
const errorMsg = ref('');

const iniciarSesion = () => {
  errorMsg.value = '';

  // Validación con las credenciales de tu Spring Boot
  if (usuario.value === 'admin' && password.value === 'admin123_cambiame') {
    // Guardamos un token básico en localStorage
    const authToken = btoa(`${usuario.value}:${password.value}`);
    localStorage.setItem('auth_token', authToken);
    localStorage.setItem('usuario_nombre', usuario.value);

    // Redirigimos al Dashboard (vista de productos)
    router.push('/productos');
  } else {
    errorMsg.value = 'Usuario o contraseña incorrectos.';
  }
};
</script>