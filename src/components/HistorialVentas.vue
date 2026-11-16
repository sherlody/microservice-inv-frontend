<style scoped src="./historial.css"></style>

<template>
  <div class="ventas-page">
    <!-- Encabezado idéntico a Productos -->
    <div class="page-header">
      <div>
        <h1>Historial de Ventas</h1>
        <p>Consulta los tickets generados y el detalle de productos vendidos</p>
      </div>
      <div class="header-actions">
        <button @click="cargarVentas" class="btn-refresh">
          🔄 Actualizar
        </button>
        <router-link to="/nueva-venta" class="btn-primary link-btn">
          🛒 Nueva Venta
        </router-link>
      </div>
    </div>

    <p v-if="mensajeError" class="alert-error">{{ mensajeError }}</p>

    <!-- Tabla de Historial de Ventas -->
    <div class="card">
      <div v-if="cargandoLista" class="empty-state">Cargando historial de ventas...</div>

      <div v-else-if="ventas.length === 0" class="empty-state">
        Aún no hay ventas registradas. Haz clic en <strong>"🛒 Nueva Venta"</strong> para registrar la primera.
      </div>

      <table v-else class="products-table">
        <thead>
          <tr>
            <th>Folio Ticket</th>
            <th>Fecha y Hora</th>
            <th>Artículos</th>
            <th>Total Cobrado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="venta in ventas" :key="venta.id">
            <td class="font-bold">#{{ venta.id }}</td>
            <td class="text-muted">{{ formatearFecha(venta.fecha) }}</td>
            <td>
              <span class="badge badge-ok">
                {{ contarArticulos(venta.detalles) }} uds.
              </span>
            </td>
            <td class="font-bold">${{ Number(venta.total).toFixed(2) }}</td>
            <td>
              <button @click="abrirDetalle(venta)" class="btn-edit">
                👁️ Ver Ticket
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL DE DETALLE DEL TICKET -->
    <div v-if="ventaSeleccionada" class="modal-overlay" @click.self="cerrarDetalle">
      <div class="modal-box">
        <div class="modal-header">
          <h2>🧾 Detalle del Ticket #{{ ventaSeleccionada.id }}</h2>
          <button @click="cerrarDetalle" class="btn-close">✖</button>
        </div>

        <p class="text-muted">
          <strong>Fecha de emisión:</strong> {{ formatearFecha(ventaSeleccionada.fecha) }}
        </p>

        <table class="products-table">
          <thead>
            <tr>
              <th>ID Prod.</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P. Unitario</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="det in ventaSeleccionada.detalles" :key="det.productoId">
              <td>#{{ det.productoId }}</td>
              <td class="font-bold">{{ det.productoNombre }}</td>
              <td>{{ det.cantidad }}</td>
              <td>${{ Number(det.precioUnitario).toFixed(2) }}</td>
              <td class="font-bold">${{ Number(det.subtotal).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <span>Total del Ticket:</span>
          <span class="total-amount">${{ Number(ventaSeleccionada.total).toFixed(2) }}</span>
        </div>

        <div class="modal-footer">
          <button @click="cerrarDetalle" class="btn-primary">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import apiClient from '../api/api.js';

const ventas = ref([]);
const cargandoLista = ref(false);
const mensajeError = ref('');
const ventaSeleccionada = ref(null);

const cargarVentas = async () => {
  cargandoLista.value = true;
  mensajeError.value = '';
  try {
    const response = await apiClient.get('/ventas');
    ventas.value = response.data;
  } catch (error) {
    mensajeError.value = 'Error al cargar el historial de ventas desde el servidor.';
  } finally {
    cargandoLista.value = false;
  }
};

const abrirDetalle = (venta) => {
  ventaSeleccionada.value = venta;
};

const cerrarDetalle = () => {
  ventaSeleccionada.value = null;
};

const contarArticulos = (detalles) => {
  if (!detalles) return 0;
  return detalles.reduce((sum, item) => sum + item.cantidad, 0);
};

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return '—';
  return new Date(fechaIso).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

onMounted(() => {
  cargarVentas();
});
</script>