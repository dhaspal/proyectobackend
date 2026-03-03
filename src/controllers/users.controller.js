const mongoose = require("mongoose");
const { User } = require("../models/User");
const { ROLES } = require("../constants/roles");
const { asyncHandler } = require("../utils/asyncHandler");
const { adminCreateUserSchema, adminUpdateUserSchema, selfUpdateSchema } = require("../validators/users.validators");

const listUsers = asyncHandler(async (req, res) => {
  const q = {};
  if (req.query.role) q.role = String(req.query.role);
  const users = await User.find(q).sort({ createdAt: -1 }).limit(300);
  return res.json({ users: users.map((u) => u.toSafeJSON()) });
});

const getUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });

  if (req.user.role !== ROLES.ADMIN && req.user.sub !== id) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  return res.json({ user: user.toSafeJSON() });
});

const adminCreateUser = asyncHandler(async (req, res) => {
  const input = adminCreateUserSchema.parse(req.body);

  const existingUsername = await User.findOne({ username: input.username.toLowerCase() });
  if (existingUsername) {
    return res.status(409).json({ error: "USERNAME_TAKEN", message: "Username ya registrado" });
  }
  if (input.email) {
    const existingEmail = await User.findOne({ email: input.email.toLowerCase() });
    if (existingEmail) return res.status(409).json({ error: "EMAIL_TAKEN", message: "Email ya registrado" });
  }

  const user = new User({
    name: input.name,
    username: input.username,
    email: input.email,
    role: input.role,
    phone: input.phone,
    isActive: input.isActive ?? true,
  });
  await user.setPassword(input.password);
  await user.save();
  return res.status(201).json({ user: user.toSafeJSON() });
});

const adminUpdateUser = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  const input = adminUpdateUserSchema.parse(req.body);
  if (input.name !== undefined) user.name = input.name;
  if (input.username !== undefined) user.username = input.username;
  if (input.email !== undefined) user.email = input.email;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.role !== undefined) user.role = input.role;
  if (input.isActive !== undefined) user.isActive = input.isActive;
  if (input.password !== undefined) await user.setPassword(input.password);
  await user.save();
  return res.json({ user: user.toSafeJSON() });
});

const selfUpdate = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (req.user.sub !== id) return res.status(403).json({ error: "FORBIDDEN", message: "Solo tu perfil" });

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  const input = selfUpdateSchema.parse(req.body);

  if (input.name !== undefined) user.name = input.name;
  if (input.username !== undefined) user.username = input.username;
  if (input.email !== undefined) user.email = input.email;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.password !== undefined) await user.setPassword(input.password);
  await user.save();
  return res.json({ user: user.toSafeJSON() });
});

module.exports = { listUsers, getUser, adminCreateUser, adminUpdateUser, selfUpdate };

