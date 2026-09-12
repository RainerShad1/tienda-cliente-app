// Almacenamiento simple en un archivo JSON.
// Suficiente para arrancar y probar el flujo completo; para produccion real
// con muchos clientes concurrentes, cambia esto por Postgres/MySQL/SQLite.

const fs = require("fs");
const path = require("path");

const RUTA_DB = path.join(__dirname, "..", "data", "clients.json");

function asegurarArchivo() {
  if (!fs.existsSync(RUTA_DB)) {
    fs.mkdirSync(path.dirname(RUTA_DB), { recursive: true });
    fs.writeFileSync(RUTA_DB, "[]", "utf-8");
  }
}

function leerClientes() {
  asegurarArchivo();
  const contenido = fs.readFileSync(RUTA_DB, "utf-8");
  try {
    return JSON.parse(contenido);
  } catch {
    return [];
  }
}

function escribirClientes(clientes) {
  asegurarArchivo();
  fs.writeFileSync(RUTA_DB, JSON.stringify(clientes, null, 2), "utf-8");
}

function buscarPorCedula(cedula) {
  return leerClientes().find((c) => c.cedula === cedula) || null;
}

function crearCliente(cliente) {
  const clientes = leerClientes();
  clientes.push(cliente);
  escribirClientes(clientes);
  return cliente;
}

function actualizarCliente(cedula, cambios) {
  const clientes = leerClientes();
  const indice = clientes.findIndex((c) => c.cedula === cedula);
  if (indice === -1) return null;

  clientes[indice] = { ...clientes[indice], ...cambios };
  escribirClientes(clientes);
  return clientes[indice];
}

module.exports = { leerClientes, escribirClientes, buscarPorCedula, crearCliente, actualizarCliente };
