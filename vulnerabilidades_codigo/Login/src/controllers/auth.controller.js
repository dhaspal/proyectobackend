const { User } = require("../models/User");
const { verifyPassword } = require("../utils/password");
const { signAccessToken } = require("../utils/tokens");
const { registerSchema, loginSchema } = require("../validators/auth.validators");
const { asyncHandler } = require("../utils/asyncHandler");

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function parseDob(dateStr) {
  // YYYY-MM-DD
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

const register = asyncHandler(async (req, res) => {
  const input = registerSchema.parse(req.body);

  const username = normalizeUsername(input.username);
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    return res.status(409).json({ error: "USERNAME_TAKEN", message: "Usuario ya registrado" });
  }

  const user = new User({
    name: input.name || `${input.firstName} ${input.lastName}`.trim(),
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth ? parseDob(input.dateOfBirth) : undefined,
    username,
    role: input.role,
    phone: input.phone,
  });
  await user.setPassword(input.password);
  await user.save();

  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  return res.status(201).json({ token, user: user.toSafeJSON() });
});

const login = asyncHandler(async (req, res) => {
  const input = loginSchema.parse(req.body);
  const username = normalizeUsername(input.username);
  const user = await User.findOne({ username });

  if (!user || !user.isActive) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Credenciales inválidas" });
  }
  if (!user.passwordHash) return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Credenciales inválidas" });
  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Credenciales inválidas" });
  }
  const token = signAccessToken({ sub: user._id.toString(), role: user.role });
  return res.json({ token, user: user.toSafeJSON() });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: "NOT_FOUND", message: "Usuario no encontrado" });
  return res.json({ user: user.toSafeJSON() });
});

module.exports = { register, login, me };

