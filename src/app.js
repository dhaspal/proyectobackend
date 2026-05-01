const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { apiLimiter } = require("./middlewares/rateLimit");
const { notFound } = require("./middlewares/notFound");
const { errorHandler } = require("./middlewares/errorHandler");
const apiRoutes = require("./routes");

function parseOrigins(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function createApp() {
  const app = express();
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  const allowedOrigins = parseOrigins(process.env.FRONTEND_ORIGINS);
  const isDev = process.env.NODE_ENV !== "production";
  const localhostOrigin = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;
  const capacitorOrigin = /^(capacitor|ionic):\/\/localhost$/i;
  const customSchemeOrigin = /^[a-z][a-z0-9+\-.]*:\/\/localhost$/i;
  app.use(
    cors({
      origin(origin, cb) {
        // Permite requests server-to-server o herramientas (sin Origin)
        if (!origin) return cb(null, true);
        // En desarrollo, permitir cualquier localhost para evitar "Failed to fetch"
        // cuando el front corre en otro puerto (ej. Vite preview 4173).
        if (isDev && localhostOrigin.test(origin)) return cb(null, true);
        if (capacitorOrigin.test(origin)) return cb(null, true);
        // Apps móviles/híbridas pueden usar esquemas personalizados.
        if (isDev && customSchemeOrigin.test(origin)) return cb(null, true);
        if (allowedOrigins.length === 0) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("CORS: origen no permitido"));
      },
      credentials: true,
    })
  );

  app.use("/api", (req, res, next) => {
    // Evita respuestas cacheadas en webviews/proxies durante operación móvil.
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  app.use("/api", apiLimiter, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
