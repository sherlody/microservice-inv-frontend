<style scoped src="./ventas.css"></style>

<template>
  <div class="nueva-venta-page">
    <!-- Encabezado con el mismo estilo de Productos -->
    <div class="page-header">
      <div>
        <h1>Nueva Venta</h1>
        <p>Selecciona los productos del inventario para generar un ticket</p>
      </div>
      <div class="header-actions">
        <button @click="cargarProductos" class="btn-refresh">
          🔄 Actualizar Stock
        </button>
      </div>
    </div>

    <p v-if="mensajeError" class="alert-error">{{ mensajeError }}</p>

    <div class="pos-grid">
      <!-- Panel Izquierdo: Selector de Producto -->
      <div class="card">
        <h2>➕ Seleccionar producto</h2>

        <div class="form-group">
          <label>Producto disponible *</label>
          <select v-model="productoSeleccionadoId" class="form-select">
            <option :value="null" disabled>-- Selecciona un producto --</option>
            <option
              v-for="prod in productosDisponibles"
              :key="prod.id"
              :value="prod.id"
            >
              {{ prod.nombre }} — ${{ Number(prod.precio).toFixed(2) }} ({{ prod.stock }} disponibles)
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Cantidad *</label>
          <input
            v-model.number="cantidad"
            type="number"
            min="1"
            :max="stockMaximoSeleccionado"
            placeholder="1"
          />
          <small v-if="productoActual" class="text-muted">
            Stock disponible: <strong>{{ productoActual.stock }} uds.</strong>
          </small>
        </div>

        <button
          @click="agregarAlCarrito"
          class="btn-primary btn-full"
          :disabled="!productoSeleccionadoId || cantidad < 1"
        >
          🛒 Agregar al carrito
        </button>
      </div>

      <!-- Panel Derecho: Resumen del Ticket / Carrito -->
      <div class="card">
        <div class="table-header">
          <h2>🧾 Carrito de venta ({{ carrito.length }})</h2>
          <button
            v-if="carrito.length > 0"
            @click="vaciarCarrito"
            class="btn-delete"
          >
            Vaciar
          </button>
        </div>

        <div v-if="carrito.length === 0" class="empty-state">
          El carrito está vacío. Agrega productos desde el panel izquierdo.
        </div>

        <div v-else>
          <table class="products-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cant.</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in carrito" :key="item.productoId">
                <td class="font-bold">{{ item.nombre }}</td>
                <td>${{ Number(item.precio).toFixed(2) }}</td>
                <td>
                  <span class="badge badge-ok">{{ item.cantidad }}</span>
                </td>
                <td class="font-bold">${{ (item.precio * item.cantidad).toFixed(2) }}</td>
                <td>
                  <button @click="quitarDelCarrito(index)" class="btn-delete">
                    ✖
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="total-box">
            <span>Total a Pagar:</span>
            <span class="total-amount">${{ totalVenta.toFixed(2) }}</span>
          </div>

          <button
            @click="procesarVenta"
            class="btn-success btn-full"
            :disabled="procesando"
          >
            {{ procesando ? 'Procesando venta...' : '✅ Confirmar y generar venta' }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE TICKET GENERADO -->
    <div v-if="ticketGenerado" class="modal-overlay" @click.self="cerrarTicket">
      <div class="modal-box">
        <div class="modal-header">
          <h2>✅ ¡Venta Registrada! — Ticket #{{ ticketGenerado.id }}</h2>
          <button @click="cerrarTicket" class="btn-close">✖</button>
        </div>

        <p class="text-muted">
          <strong>Fecha:</strong> {{ formatearFecha(ticketGenerado.fecha) }}
        </p>

        <table class="products-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P. Unit.</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="det in ticketGenerado.detalles" :key="det.productoId">
              <td class="font-bold">{{ det.productoNombre }}</td>
              <td>{{ det.cantidad }}</td>
              <td>${{ Number(det.precioUnitario).toFixed(2) }}</td>
              <td class="font-bold">${{ Number(det.subtotal).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <span>Total Cobrado:</span>
          <span class="total-amount">${{ Number(ticketGenerado.total).toFixed(2) }}</span>
        </div>

        <div class="modal-footer">
          <button @click="irAHistorial" class="btn-secondary">
            Ver Historial de Ventas
          </button>
          <button @click="cerrarTicket" class="btn-primary">
            Nueva Venta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../api/api.js';

const router = useRouter();
const productos = ref([]);
const carrito = ref([]);
const productoSeleccionadoId = ref(null);
const cantidad = ref(1);
const procesando = ref(false);
const mensajeError = ref('');
const ticketGenerado = ref(null);

// Solo muestra productos con stock mayor a 0
const productosDisponibles = computed(() =>
  productos.value.filter((p) => p.stock > 0)
);

const productoActual = computed(() =>
  productos.value.find((p) => p.id === productoSeleccionadoId.value)
);

const stockMaximoSeleccionado = computed(() =>
  productoActual.value ? productoActual.value.stock : 1
);

const totalVenta = computed(() =>
  carrito.value.reduce((acc, item) => acc + item.precio * item.cantidad, 0)
);

const cargarProductos = async () => {
  try {
    const response = await apiClient.get('/productos');
    productos.value = response.data;
  } catch (error) {
    mensajeError.value = 'Error al cargar el catálogo de productos.';
  }
};

const agregarAlCarrito = () => {
  mensajeError.value = '';
  const prod = productoActual.value;
  if (!prod) return;

  const existente = carrito.value.find((item) => item.productoId === prod.id);
  const cantidadTotal = (existente ? existente.cantidad : 0) + cantidad.value;

  if (cantidadTotal > prod.stock) {
    mensajeError.value = `Stock insuficiente para "${prod.nombre}". Solo hay ${prod.stock} unidades disponibles.`;
    return;
  }

  if (existente) {
    existente.cantidad += cantidad.value;
  } else {
    carrito.value.push({
      productoId: prod.id,
      nombre: prod.nombre,
      precio: prod.precio,
      cantidad: cantidad.value,
    });
  }

  productoSeleccionadoId.value = null;
  cantidad.value = 1;
};

const quitarDelCarrito = (index) => {
  carrito.value.splice(index, 1);
};

const vaciarCarrito = () => {
  carrito.value = [];
  mensajeError.value = '';
};

const procesarVenta = async () => {
  procesando.value = true;
  mensajeError.value = '';

  const payload = {
    detalles: carrito.value.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
    })),
  };

  try {
    const response = await apiClient.post('/ventas', payload);
    ticketGenerado.value = response.data;
    carrito.value = [];
    await cargarProductos(); // Refresca el stock descontado
  } catch (error) {
    mensajeError.value =
      error.response?.data?.message || 'Ocurrió un error al registrar la venta.';
  } finally {
    procesando.value = false;
  }
};

const cerrarTicket = () => {
  ticketGenerado.value = null;
};

const irAHistorial = () => {
  ticketGenerado.value = null;
  router.push('/ventas');
};

const formatearFecha = (fechaIso) => {
  if (!fechaIso) return '—';
  return new Date(fechaIso).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

onMounted(() => {
  cargarProductos();
});
</script>