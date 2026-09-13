const express = require("express");

const requerirToken = require("../middleware/auth");
const { buscarPorCedula } = require("../db");
const { obtenerProductosPorIds } = require("../catalogoDb");
const { crearPedido, listarPedidosDeCliente } = require("../pedidosDb");

const router = express.Router();

// Por ahora solo aceptamos efectivo. "tarjeta" queda reservado para cuando
// el repartidor lleve un Verifone — el backend ya sabe rechazarlo con un
// mensaje claro en vez de fallar feo, para cuando se active el frontend.
const METODOS_ACEPTADOS_HOY = ["efectivo"];
const METODOS_CONOCIDOS = ["efectivo", "tarjeta"];

router.post("/", requerirToken, async (req, res) => {
  const { items, metodoPago, notas } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El pedido no puede estar vacío." });
  }

  const metodo = metodoPago || "efectivo";
  if (!METODOS_CONOCIDOS.includes(metodo)) {
    return res.status(400).json({ error: "Método de pago inválido." });
  }
  if (!METODOS_ACEPTADOS_HOY.includes(metodo)) {
    return res.status(400).json({ error: "Ese método de pago todavía no está disponible. Usa efectivo por ahora." });
  }

  const cliente = await buscarPorCedula(req.cliente.cedula);
  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado." });
  }
  if (!cliente.ubicacion) {
    return res.status(400).json({ error: "Agrega tu ubicación de entrega antes de hacer un pedido." });
  }

  const idsPedidos = items.map((item) => item.productoId);
  const productosEncontrados = await obtenerProductosPorIds(idsPedidos);
  const productosPorId = {};
  productosEncontrados.forEach((p) => (productosPorId[p.id] = p));

  const itemsConDetalle = [];
  let total = 0;

  for (const item of items) {
    const producto = productosPorId[item.productoId];
    const cantidad = Number(item.cantidad);

    if (!producto) {
      return res.status(400).json({ error: `Un producto del pedido ya no está disponible.` });
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) {
      return res.status(400).json({ error: "Cantidad inválida en el pedido." });
    }

    itemsConDetalle.push({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
    });
    total += producto.precio * cantidad;
  }

  const pedido = await crearPedido({
    clienteCedula: cliente.cedula,
    items: itemsConDetalle,
    total,
    metodoPago: metodo,
    notas: (notas || "").toString().trim().slice(0, 300),
    direccion: cliente.ubicacion,
  });

  res.status(201).json({ pedido });
});

router.get("/", requerirToken, async (req, res) => {
  const pedidos = await listarPedidosDeCliente(req.cliente.cedula);
  res.json({ pedidos });
});

module.exports = router;
