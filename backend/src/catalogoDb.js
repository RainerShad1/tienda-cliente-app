const { pool } = require("./db");

function mapearProducto(fila) {
  const producto = {
    id: fila.id,
    categoriaId: fila.categoria_id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precio: Number(fila.precio),
    icono: fila.icono,
    destacado: fila.destacado,
  };
  if (fila.precio_antes !== null && fila.precio_antes !== undefined) {
    producto.precioAntes = Number(fila.precio_antes);
  }
  return producto;
}

async function obtenerCatalogo() {
  const [categorias, productos] = await Promise.all([
    pool.query("select * from categorias order by orden asc, nombre asc"),
    pool.query("select * from productos order by categoria_id asc, nombre asc"),
  ]);

  return {
    categorias: categorias.rows.map((fila) => ({
      id: fila.id,
      nombre: fila.nombre,
      icono: fila.icono,
    })),
    productos: productos.rows.map(mapearProducto),
  };
}

module.exports = { obtenerCatalogo };
