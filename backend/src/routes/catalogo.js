const express = require("express");

const { obtenerCatalogo } = require("../catalogoDb");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const catalogo = await obtenerCatalogo();
    res.json(catalogo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar el catálogo." });
  }
});

module.exports = router;
