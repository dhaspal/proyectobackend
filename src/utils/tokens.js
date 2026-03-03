const jwt = require("jsonwebtoken");
const { getEnv, getEnvOptional } = require("../config/env");

function signAccessToken(payload) {
  const secret = getEnv("JWT_SECRET");
  const expiresIn = getEnvOptional("JWT_EXPIRES_IN", "7d");
  return jwt.sign(payload, secret, { expiresIn });
}

function verifyAccessToken(token) {
  const secret = getEnv("JWT_SECRET");
  return jwt.verify(token, secret);
}

module.exports = { signAccessToken, verifyAccessToken };
