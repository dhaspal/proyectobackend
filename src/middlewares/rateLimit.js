const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  // SSE reconecta muchas veces con GET largos; no debe consumir cuota ni bloquearse con 429.
  skip: (req) => req.originalUrl.includes("/realtime/stream"),
});

module.exports = { apiLimiter };
