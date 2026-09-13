const { Pool } = require("pg");

// Supabase (y la mayoria de proveedores de Postgres en la nube) requieren
// SSL. En local (tu propia maquina o un Postgres de pruebas) normalmente no
// hace falta, asi que lo activamos solo si la URL no apunta a localhost.
const esLocal = (process.env.DATABASE_URL || "").includes("localhost");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: esLocal ? false : { rejectUnauthorized: false },
});

function mapearCliente(fila) {
  if (!fila) return null;
  return {
    id: fila.cedula,
    cedula: fila.cedula,
    nombre: fila.nombre,
    telefono: fila.telefono,
    pinHash: fila.pin_hash,
    ubicacion: fila.ubicacion || null,
    creadoEn: fila.creado_en,
  };
}

async function buscarPorCedula(cedula) {
  const { rows } = await pool.query("select * from clientes where cedula = $1", [cedula]);
  return mapearCliente(rows[0]);
}

async function crearCliente(cliente) {
  const { rows } = await pool.query(
    `insert into clientes (cedula, nombre, telefono, pin_hash, creado_en)
     values ($1, $2, $3, $4, $5)
     returning *`,
    [cliente.cedula, cliente.nombre, cliente.telefono, cliente.pinHash, cliente.creadoEn]
  );
  return mapearCliente(rows[0]);
}

async function actualizarCliente(cedula, cambios) {
  // Por ahora el unico campo que se actualiza despues de creado el cliente
  // es la ubicacion. Si en el futuro se agregan mas campos editables
  // (nombre, telefono), se puede generalizar esta funcion.
  if (cambios.ubicacion !== undefined) {
    const { rows } = await pool.query(
      "update clientes set ubicacion = $2 where cedula = $1 returning *",
      [cedula, cambios.ubicacion]
    );
    return mapearCliente(rows[0]);
  }
  return buscarPorCedula(cedula);
}

module.exports = { pool, buscarPorCedula, crearCliente, actualizarCliente };
