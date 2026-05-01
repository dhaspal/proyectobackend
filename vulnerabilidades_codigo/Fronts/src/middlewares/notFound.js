function notFound(req, res) {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
}

module.exports = { notFound };
