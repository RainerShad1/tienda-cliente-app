const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-cambiar-en-produccion";

function requerirToken(req, res, next) {
  const encabezado = req.headers.authorization || "";
  const [tipo, token] = encabezado.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "No autorizado." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.cliente = payload; // { id, cedula }
    next();
  } catch {
    return res.status(401).json({ error: "Tu sesión expiró. Inicia sesión de nuevo." });
  }
}

module.exports = requerirToken;
