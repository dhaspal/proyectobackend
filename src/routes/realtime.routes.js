const express = require("express");
const { verifyAccessToken } = require("../utils/tokens");
const { startSse } = require("../services/realtime.service");

function getToken(req) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");
  if (type === "Bearer" && token) return token;
  return req.query?.token ? String(req.query.token) : null;
}

const router = express.Router();

router.get("/stream", (req, res) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Sin token" });
  }
  try {
    const payload = verifyAccessToken(token);
    startSse(req, res, payload);
    return undefined;
  } catch {
    return res.status(401).json({ error: "UNAUTHORIZED", message: "Token inválido" });
  }
});

module.exports = router;
