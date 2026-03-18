const mongoose = require("mongoose");
const { User } = require("../models/User");
const { Vehicle } = require("../models/Vehicle");
const { WorkOrder } = require("../models/WorkOrder");
const { ROLES } = require("../constants/roles");
const { asyncHandler } = require("../utils/asyncHandler");
const { createClientSchema, updateClientSchema } = require("../validators/clients.validators");

function parseDob(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

const getMyClient = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: "NOT_FOUND", message: "Usuario no existe" });
  if (user.role !== ROLES.CLIENT) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo clientes" });
  }

  const vehicles = await Vehicle.find({ owner: user._id }).sort({ updatedAt: -1 });
  const workOrders = await WorkOrder.find({ client: user._id }).sort({ updatedAt: -1 }).limit(100);

  return res.json({
    client: user.toSafeJSON(),
    vehicles,
    workOrders,
  });
});

const updateMyClient = asyncHandler(async (req, res) => {
  const input = updateClientSchema.parse(req.body);

  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ error: "NOT_FOUND", message: "Usuario no existe" });
  if (user.role !== ROLES.CLIENT) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo clientes" });
  }

  if (input.name !== undefined) user.name = input.name;
  if (input.firstName !== undefined) user.firstName = input.firstName;
  if (input.lastName !== undefined) user.lastName = input.lastName;
  if (input.age !== undefined) user.age = input.age;
  if (input.dateOfBirth !== undefined) user.dateOfBirth = parseDob(input.dateOfBirth);
  if (input.username !== undefined) user.username = input.username;
  if (input.phone !== undefined) user.phone = input.phone;
  if (input.address !== undefined) {
    user.clientProfile = user.clientProfile || {};
    user.clientProfile.address = input.address;
  }
  if (!input.name && (input.firstName !== undefined || input.lastName !== undefined)) {
    const fn = user.firstName || "";
    const ln = user.lastName || "";
    const full = `${fn} ${ln}`.trim();
    if (full) user.name = full;
  }

  await user.save();

  const vehicles = await Vehicle.find({ owner: user._id }).sort({ updatedAt: -1 });
  return res.json({ client: user.toSafeJSON(), vehicles });
});

// Para taller (MECHANIC/ADMIN): crear cliente (usuario CLIENT) con password
const createClient = asyncHandler(async (req, res) => {
  const input = createClientSchema.parse(req.body);

  const existingUsername = await User.findOne({ username: input.username.toLowerCase() });
  if (existingUsername) {
    return res.status(409).json({ error: "USERNAME_TAKEN", message: "Username ya registrado" });
  }

  const user = new User({
    name: input.name || `${input.firstName} ${input.lastName}`.trim(),
    firstName: input.firstName,
    lastName: input.lastName,
    age: input.age,
    dateOfBirth: input.dateOfBirth ? parseDob(input.dateOfBirth) : undefined,
    username: input.username,
    phone: input.phone,
    role: ROLES.CLIENT,
    clientProfile: input.address ? { address: input.address } : undefined,
    isActive: true,
  });
  await user.setPassword(input.password);
  await user.save();

  return res.status(201).json({ client: user.toSafeJSON() });
});

const listClients = asyncHandler(async (req, res) => {
  const q = { role: ROLES.CLIENT };
  if (req.query.search) {
    const s = String(req.query.search).trim();
    q.$or = [
      { name: { $regex: s, $options: "i" } },
      { username: { $regex: s, $options: "i" } },
      { phone: { $regex: s, $options: "i" } },
    ];
  }
  const clients = await User.find(q).sort({ createdAt: -1 }).limit(300);
  return res.json({ clients: clients.map((u) => u.toSafeJSON()) });
});

const getClientById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  }
  const client = await User.findById(id);
  if (!client || client.role !== ROLES.CLIENT) {
    return res.status(404).json({ error: "NOT_FOUND", message: "Cliente no existe" });
  }

  const vehicles = await Vehicle.find({ owner: client._id }).sort({ updatedAt: -1 });
  const workOrders = await WorkOrder.find({ client: client._id }).sort({ updatedAt: -1 }).limit(100);
  return res.json({ client: client.toSafeJSON(), vehicles, workOrders });
});

module.exports = { getMyClient, updateMyClient, createClient, listClients, getClientById };

