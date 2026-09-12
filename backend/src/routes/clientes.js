const express = require("express");

const requerirToken = require("../middleware/auth");
const { buscarPorCedula, actualizarCliente } = require("../db");

const router = express.Router();

// Caja delimitadora aproximada de Republica Dominicana, para descartar
// coordenadas claramente equivocadas (ej. un error del navegador o un
// intento de guardar una direccion fuera del pais). Ajusta estos numeros
// si en el futuro entregas tambien en otro territorio.
const LIMITES_RD = { latMin: 17.4, latMax: 20.1, lngMin: -72.1, lngMax: -68.2 };

function clientePublico(cliente) {
  const { pinHash, ...resto } = cliente;
  return resto;
}

router.put("/ubicacion", requerirToken, (req, res) => {
  const { lat, lng, direccion, referencia, etiqueta } = req.body || {};

  if (typeof lat !== "number" || typeof lng !== "number" || Number.isNaN(lat) || Number.isNaN(lng)) {
    return res.status(400).json({ error: "Coordenadas inválidas." });
  }

  const dentroDeRD =
    lat >= LIMITES_RD.latMin && lat <= LIMITES_RD.latMax && lng >= LIMITES_RD.lngMin && lng <= LIMITES_RD.lngMax;

  if (!dentroDeRD) {
    return res.status(400).json({ error: "La ubicación debe estar dentro de República Dominicana." });
  }

  if (!direccion || direccion.trim().length < 5) {
    return res.status(400).json({ error: "Escribe o confirma una dirección válida." });
  }

  const cliente = buscarPorCedula(req.cliente.cedula);
  if (!cliente) {
    return res.status(404).json({ error: "Cliente no encontrado." });
  }

  const clienteActualizado = actualizarCliente(cliente.cedula, {
    ubicacion: {
      lat,
      lng,
      direccion: direccion.trim(),
      referencia: (referencia || "").trim(),
      etiqueta: etiqueta || "Casa",
      actualizadaEn: new Date().toISOString(),
    },
  });

  res.json({ cliente: clientePublico(clienteActualizado) });
});

module.exports = router;
