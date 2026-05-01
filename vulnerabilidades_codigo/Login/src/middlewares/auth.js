const { verifyAccessToken } = require("../utils/tokens");

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) return null;
  return token;
}

function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Sin token" });
  }
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token inválido" });
  }
}

function requireRole(...roles) {
  return function roleGuard(req, res, next) {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ error: "UNAUTHORIZED", message: "No autenticado" });
    }
    if (!roles.includes(role)) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };
