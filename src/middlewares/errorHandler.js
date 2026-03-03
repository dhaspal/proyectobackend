function errorHandler(err, req, res, next) {
  const status = Number(err.status || err.statusCode || 500);

  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Datos inválidos",
      issues: err.issues,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "MONGOOSE_VALIDATION_ERROR",
      message: err.message,
      details: err.errors,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "DUPLICATE_KEY",
      message: "Ya existe un registro con un campo único",
      keyValue: err.keyValue,
    });
  }

  const message =
    status >= 500
      ? "Error interno del servidor"
      : err.message || "Error";

  // eslint-disable-next-line no-console
  if (status >= 500) console.error(err);

  return res.status(status).json({
    error: err.error || "ERROR",
    message,
  });
}

module.exports = { errorHandler };
