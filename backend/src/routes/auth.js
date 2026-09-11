const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { buscarPorCedula, crearCliente } = require("../db");
const { validarCedula, limpiarCedula } = require("../utils/cedula");
const { validarTelefono, limpiarTelefono } = require("../utils/telefono");

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-cambiar-en-produccion";
const MAX_INTENTOS = 5;
const BLOQUEO_MS = 60_000;

// Contador de intentos fallidos en memoria (por cedula). Se reinicia si se
// reinicia el servidor; para produccion real conviene guardarlo en la DB.
const intentosFallidos = new Map();

function generarToken(cliente) {
  return jwt.sign({ id: cliente.id, cedula: cliente.cedula }, JWT_SECRET, {
    expiresIn: "12h",
  });
}

function clientePublico(cliente) {
  const { pinHash, ...resto } = cliente;
  return resto;
}

router.post("/registro", async (req, res) => {
  const { cedula, nombre, telefono, pin, confirmarPin } = req.body || {};

  if (!validarCedula(cedula)) {
    return res.status(400).json({ error: "La cedula no es valida." });
  }
  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({ error: "Escribe tu nombre completo." });
  }
  if (!validarTelefono(telefono)) {
    return res.status(400).json({
      error: "El numero de telefono no es valido (usa un numero dominicano de 10 digitos).",
    });
  }
  if (!/^\d{4}$/.test(pin || "")) {
    return res.status(400).json({ error: "El PIN debe tener exactamente 4 digitos." });
  }
  if (pin !== confirmarPin) {
    return res.status(400).json({ error: "Los dos PIN que escribiste no coinciden." });
  }

  const cedulaLimpia = limpiarCedula(cedula);

  if (buscarPorCedula(cedulaLimpia)) {
    return res.status(409).json({ error: "Ya existe una cuenta registrada con esta cedula." });
  }

  const pinHash = await bcrypt.hash(pin, 10);

  const cliente = {
    id: cedulaLimpia,
    cedula: cedulaLimpia,
    nombre: nombre.trim(),
    telefono: limpiarTelefono(telefono),
    pinHash,
    creadoEn: new Date().toISOString(),
  };

  crearCliente(cliente);

  const token = generarToken(cliente);
  res.status(201).json({ token, cliente: clientePublico(cliente) });
});

router.post("/login", async (req, res) => {
  const { cedula, pin } = req.body || {};
  const cedulaLimpia = limpiarCedula(cedula);

  const registro = intentosFallidos.get(cedulaLimpia);
  if (registro && registro.bloqueadoHasta && registro.bloqueadoHasta > Date.now()) {
    const segundos = Math.ceil((registro.bloqueadoHasta - Date.now()) / 1000);
    return res.status(429).json({
      error: `Demasiados intentos fallidos. Intenta de nuevo en ${segundos} segundos.`,
    });
  }

  if (!validarCedula(cedula) || !/^\d{4}$/.test(pin || "")) {
    return res.status(400).json({ error: "Cedula o PIN invalido." });
  }

  const cliente = buscarPorCedula(cedulaLimpia);
  if (!cliente) {
    return res.status(401).json({ error: "No encontramos una cuenta con esa cedula." });
  }

  const coincide = await bcrypt.compare(pin, cliente.pinHash);
  if (!coincide) {
    const actual = intentosFallidos.get(cedulaLimpia) || { count: 0 };
    actual.count += 1;
    if (actual.count >= MAX_INTENTOS) {
      actual.bloqueadoHasta = Date.now() + BLOQUEO_MS;
      actual.count = 0;
    }
    intentosFallidos.set(cedulaLimpia, actual);
    return res.status(401).json({ error: "El PIN es incorrecto." });
  }

  intentosFallidos.delete(cedulaLimpia);
  const token = generarToken(cliente);
  res.json({ token, cliente: clientePublico(cliente) });
});

module.exports = router;
