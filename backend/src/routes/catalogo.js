const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const RUTA_CATALOGO = path.join(__dirname, "..", "..", "data", "catalogo.json");

router.get("/", (req, res) => {
  try {
    const contenido = fs.readFileSync(RUTA_CATALOGO, "utf-8");
    res.json(JSON.parse(contenido));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "No se pudo cargar el catálogo." });
  }
});

module.exports = router;
