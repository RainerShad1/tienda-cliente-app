require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const clientesRoutes = require("./src/routes/clientes");
const catalogoRoutes = require("./src/routes/catalogo");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/salud", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/catalogo", catalogoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use(errorHandler);

const PUERTO = process.env.PUERTO || 4000;
app.listen(PUERTO, () => {
  console.log(`API de clientes escuchando en http://localhost:${PUERTO}`);
});
