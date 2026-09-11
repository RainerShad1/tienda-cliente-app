function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: "Ocurrio un error inesperado en el servidor." });
}

module.exports = errorHandler;
