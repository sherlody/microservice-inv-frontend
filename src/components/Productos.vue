<style scoped src="./productos.css"></style>

<template>
  <div class="productos-page">
    <!-- Encabezado con el botón principal para abrir la modal de creación -->
    <div class="page-header">
      <div>
        <h1>Catálogo de Productos</h1>
        <p>Gestiona el inventario disponible para ventas</p>
      </div>
      <div class="header-actions">
        <button @click="cargarProductos" class="btn-refresh" title="Recargar lista">
          🔄 Actualizar
        </button>
        <button @click="abrirModalCrear" class="btn-primary">
          ➕ Agregar Producto
        </button>
      </div>
    </div>

    <!-- Mensajes de notificación globales -->
    <p v-if="mensajeError && !mostrarModal" class="alert-error">{{ mensajeError }}</p>
    <p v-if="mensajeExito" class="alert-success">{{ mensajeExito }}</p>

    <!-- Tabla principal de productos -->
    <div class="card table-card">
      <div v-if="cargandoLista" class="empty-state">Cargando productos...</div>

      <div v-else-if="productos.length === 0" class="empty-state">
        No hay productos registrados todavía. Haz clic en <strong>"➕ Agregar Producto"</strong> para crear el primero.
      </div>

      <table v-else class="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="prod in productos" :key="prod.id">
            <td>#{{ prod.id }}</td>
            <td class="font-bold">{{ prod.nombre }}</td>
            <td class="text-muted">{{ prod.descripcion || '—' }}</td>
            <td class="font-bold">${{ Number(prod.precio).toFixed(2) }}</td>
            <td>
              <span :class="['badge', prod.stock > 5 ? 'badge-ok' : prod.stock > 0 ? 'badge-low' : 'badge-out']">
                {{ prod.stock }} uds.
              </span>
            </td>
            <td class="actions-cell">
              <button @click="abrirModalEditar(prod)" class="btn-edit">
                ✏️ Editar
              </button>
              <button @click="eliminarProducto(prod)" class="btn-delete">
                🗑️ Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- VENTANA MODAL PARA CREAR / EDITAR PRODUCTO -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-box">
        <div class="modal-header">
          <h2>{{ editandoId ? '✏️ Editar Producto' : '➕ Agregar Nuevo Producto' }}</h2>
          <button @click="cerrarModal" class="btn-close">✖</button>
        </div>

        <form @submit.prevent="guardarProducto" class="modal-form">
          <div class="form-group">
            <label>Nombre del Producto *</label>
            <input
              v-model="formulario.nombre"
              type="text"
              placeholder="Ej. Teclado Mecánico RGB"
              minlength="2"
              maxlength="100"
              required
            />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea
              v-model="formulario.descripcion"
              rows="2"
              placeholder="Breve descripción del producto (opcional)"
              maxlength="250"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio ($) *</label>
              <input
                v-model.number="formulario.precio"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ej. 1250.50"
                required
              />
            </div>

            <div class="form-group">
              <label>Stock *</label>
              <input
                v-model.number="formulario.stock"
                type="number"
                min="0"
                placeholder="Ej. 15"
                required
              />
            </div>
          </div>

          <p v-if="mensajeError" class="alert-error">{{ mensajeError }}</p>

          <div class="modal-footer">
            <button type="button" @click="cerrarModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="cargando">
              {{ cargando ? 'Guardando...' : editandoId ? 'Actualizar Cambios' : 'Guardar Producto' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/api.js';

const productos = ref([]);
const cargandoLista = ref(false);
const cargando = ref(false);
const mostrarModal = ref(false);
const editandoId = ref(null);
const mensajeError = ref('');
const mensajeExito = ref('');

const formulario = ref({
  nombre: '',
  descripcion: '',
  precio: null,
  stock: null,
});

// Obtener todos los productos
const cargarProductos = async () => {
  cargandoLista.value = true;
  mensajeError.value = '';
  try {
    const response = await apiClient.get('/productos');
    productos.value = response.data;
  } catch (error) {
    mensajeError.value = 'Error al conectar con el servidor. Verifica que Spring Boot esté encendido en el puerto 8000.';
  } finally {
    cargandoLista.value = false;
  }
};

// Abrir modal en modo creación
const abrirModalCrear = () => {
  editandoId.value = null;
  mensajeError.value = '';
  mensajeExito.value = '';
  formulario.value = {
    nombre: '',
    descripcion: '',
    precio: null,
    stock: null,
  };
  mostrarModal.value = true;
};

// Abrir modal en modo edición con los datos del producto seleccionado
const abrirModalEditar = (producto) => {
  editandoId.value = producto.id;
  mensajeError.value = '';
  mensajeExito.value = '';
  formulario.value = {
    nombre: producto.nombre,
    descripcion: producto.descripcion || '',
    precio: producto.precio,
    stock: producto.stock,
  };
  mostrarModal.value = true;
};

const cerrarModal = () => {
  mostrarModal.value = false;
  editandoId.value = null;
  mensajeError.value = '';
};

// Guardar (POST) o Actualizar (PUT)
const guardarProducto = async () => {
  cargando.value = true;
  mensajeError.value = '';
  mensajeExito.value = '';

  const payload = {
    nombre: formulario.value.nombre.trim(),
    descripcion: formulario.value.descripcion?.trim() || null,
    precio: formulario.value.precio,
    stock: formulario.value.stock,
  };

  try {
    if (editandoId.value) {
      await apiClient.put(`/productos/${editandoId.value}`, payload);
      mensajeExito.value = 'Producto actualizado correctamente.';
    } else {
      await apiClient.post('/productos', payload);
      mensajeExito.value = 'Producto registrado correctamente.';
    }

    cerrarModal();
    await cargarProductos();
  } catch (error) {
    mensajeError.value =
      error.response?.data?.message ||
      'Ocurrió un error al guardar el producto. Revisa los datos ingresados.';
  } finally {
    cargando.value = false;
  }
};

// Eliminar producto (DELETE)
const eliminarProducto = async (producto) => {
  const confirmado = confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`);
  if (!confirmado) return;

  mensajeError.value = '';
  mensajeExito.value = '';

  try {
    await apiClient.delete(`/productos/${producto.id}`);
    mensajeExito.value = `Producto "${producto.nombre}" eliminado.`;
    await cargarProductos();
  } catch (error) {
    mensajeError.value =
      'No se pudo eliminar el producto (puede que ya esté asociado a una venta registrada).';
  }
};

onMounted(() => {
  cargarProductos();
});
</script>

