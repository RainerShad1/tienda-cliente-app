// Carga las categorias y productos iniciales en la base de datos.
// Se corre una sola vez (o cada vez que quieras resetear el catalogo a estos
// valores de partida): node scripts/seed.js

require("dotenv").config();
const { pool } = require("../src/db");

const categorias = [
  { id: "empanadas", nombre: "Empanadas", icono: "🥟", orden: 1 },
  { id: "bebidas", nombre: "Bebidas", icono: "🥤", orden: 2 },
  { id: "combos", nombre: "Combos", icono: "🍽️", orden: 3 },
];

const productos = [
  {
    id: "res-queso",
    categoriaId: "empanadas",
    nombre: "Res con queso",
    descripcion: "Carne de res guisada con queso derretido.",
    precio: 75,
    icono: "🥟",
    destacado: true,
  },
  {
    id: "pollo",
    categoriaId: "empanadas",
    nombre: "Pollo",
    descripcion: "Pollo guisado, bien sazonado.",
    precio: 65,
    icono: "🥟",
    destacado: true,
  },
  {
    id: "jamon-queso",
    categoriaId: "empanadas",
    nombre: "Jamón y queso",
    descripcion: "Jamón y queso derretido.",
    precio: 65,
    icono: "🥟",
    destacado: false,
  },
  {
    id: "vegetariana",
    categoriaId: "empanadas",
    nombre: "Vegetariana",
    descripcion: "Vegetales salteados con queso.",
    precio: 60,
    icono: "🥟",
    destacado: false,
  },
  {
    id: "coca-cola",
    categoriaId: "bebidas",
    nombre: "Coca-Cola",
    descripcion: "Lata fría de 12oz.",
    precio: 50,
    icono: "🥤",
    destacado: false,
  },
  {
    id: "jugo-natural",
    categoriaId: "bebidas",
    nombre: "Jugo natural",
    descripcion: "Jugo del día, pregunta el sabor disponible.",
    precio: 70,
    icono: "🧃",
    destacado: false,
  },
  {
    id: "agua",
    categoriaId: "bebidas",
    nombre: "Agua",
    descripcion: "Botella de agua fría.",
    precio: 35,
    icono: "💧",
    destacado: false,
  },
  {
    id: "combo-3",
    categoriaId: "combos",
    nombre: "Combo 3 empanadas",
    descripcion: "3 empanadas a elegir + refresco.",
    precio: 199,
    precioAntes: 250,
    icono: "🍽️",
    destacado: false,
  },
  {
    id: "combo-familiar",
    categoriaId: "combos",
    nombre: "Combo familiar",
    descripcion: "6 empanadas a elegir + 2 refrescos.",
    precio: 399,
    precioAntes: 500,
    icono: "🍽️",
    destacado: false,
  },
];

async function sembrar() {
  for (const categoria of categorias) {
    await pool.query(
      `insert into categorias (id, nombre, icono, orden) values ($1, $2, $3, $4)
       on conflict (id) do update set nombre = excluded.nombre, icono = excluded.icono, orden = excluded.orden`,
      [categoria.id, categoria.nombre, categoria.icono, categoria.orden]
    );
  }
  console.log(`Categorías cargadas: ${categorias.length}`);

  for (const producto of productos) {
    await pool.query(
      `insert into productos (id, categoria_id, nombre, descripcion, precio, precio_antes, icono, destacado)
       values ($1, $2, $3, $4, $5, $6, $7, $8)
       on conflict (id) do update set
         categoria_id = excluded.categoria_id,
         nombre = excluded.nombre,
         descripcion = excluded.descripcion,
         precio = excluded.precio,
         precio_antes = excluded.precio_antes,
         icono = excluded.icono,
         destacado = excluded.destacado`,
      [
        producto.id,
        producto.categoriaId,
        producto.nombre,
        producto.descripcion,
        producto.precio,
        producto.precioAntes || null,
        producto.icono,
        producto.destacado,
      ]
    );
  }
  console.log(`Productos cargados: ${productos.length}`);

  await pool.end();
}

sembrar().catch((err) => {
  console.error("Error al sembrar la base de datos:", err);
  process.exit(1);
});
