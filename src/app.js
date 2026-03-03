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

  app.use(helmet());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));

  const allowedOrigins = parseOrigins(process.env.FRONTEND_ORIGINS);
  app.use(
    cors({
      origin(origin, cb) {
        // Permite requests server-to-server o herramientas (sin Origin)
        if (!origin) return cb(null, true);
        if (allowedOrigins.length === 0) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error("CORS: origen no permitido"));
      },
      credentials: true,
    })
  );

  app.use("/api", apiLimiter, apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
