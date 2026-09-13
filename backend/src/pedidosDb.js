const { pool } = require("./db");

function mapearPedido(fila) {
  return {
    id: fila.id,
    clienteCedula: fila.cliente_cedula,
    items: fila.items,
    total: Number(fila.total),
    metodoPago: fila.metodo_pago,
    notas: fila.notas,
    direccion: fila.direccion,
    estado: fila.estado,
    creadoEn: fila.creado_en,
    actualizadoEn: fila.actualizado_en,
  };
}

async function crearPedido({ clienteCedula, items, total, metodoPago, notas, direccion }) {
  const { rows } = await pool.query(
    `insert into pedidos (cliente_cedula, items, total, metodo_pago, notas, direccion)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [clienteCedula, JSON.stringify(items), total, metodoPago, notas || null, JSON.stringify(direccion)]
  );
  return mapearPedido(rows[0]);
}

async function listarPedidosDeCliente(cedula) {
  const { rows } = await pool.query(
    "select * from pedidos where cliente_cedula = $1 order by creado_en desc",
    [cedula]
  );
  return rows.map(mapearPedido);
}

module.exports = { crearPedido, listarPedidosDeCliente };
