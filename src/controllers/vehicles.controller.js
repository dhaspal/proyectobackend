const mongoose = require("mongoose");
const { Vehicle } = require("../models/Vehicle");
const { WorkOrder } = require("../models/WorkOrder");
const { ROLES } = require("../constants/roles");
const { asyncHandler } = require("../utils/asyncHandler");
const { vehicleCreateSchema, vehicleUpdateSchema } = require("../validators/vehicles.validators");
const { publishToUser } = require("../services/realtime.service");

async function canReadVehicle({ role, userId, vehicleId }) {
  if (role === ROLES.ADMIN) return true;
  const vehicle = await Vehicle.findById(vehicleId).select("owner").lean();
  if (!vehicle) return null;
  if (role === ROLES.CLIENT) return vehicle.owner.toString() === userId;
  if (role === ROLES.MECHANIC) {
    const assigned = await WorkOrder.exists({ vehicle: vehicleId, mechanic: userId });
    return Boolean(assigned);
  }
  return false;
}

const createVehicle = asyncHandler(async (req, res) => {
  const input = vehicleCreateSchema.parse(req.body);
  const role = req.user.role;
  const userId = req.user.sub;

  const owner = role === ROLES.ADMIN && input.ownerId ? input.ownerId : userId;

  const vehicle = await Vehicle.create({
    owner,
    plate: input.plate,
    vin: input.vin,
    brand: input.brand,
    model: input.model,
    year: input.year,
    color: input.color,
    fuelType: input.fuelType ?? input.combustible,
    mileage: input.mileage,
    notes: input.notes,
    characteristics: input.characteristics,
    modifications: input.modifications,
  });

  publishToUser(owner, "vehicle.created", {
    vehicle: vehicle.toJSON(),
  });

  return res.status(201).json({ vehicle });
});

const listVehicles = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.sub;

  const q = {};
  if (req.query.plate) q.plate = String(req.query.plate).toUpperCase();

  if (role === ROLES.ADMIN) {
    if (req.query.ownerId) q.owner = String(req.query.ownerId);
    const vehicles = await Vehicle.find(q).sort({ updatedAt: -1 }).limit(200);
    return res.json({ vehicles });
  }

  if (role === ROLES.CLIENT) {
    q.owner = userId;
    const vehicles = await Vehicle.find(q).sort({ updatedAt: -1 }).limit(200);
    return res.json({ vehicles });
  }

  // MECHANIC: solo vehículos de órdenes asignadas
  const workOrders = await WorkOrder.find({ mechanic: userId })
    .select("vehicle")
    .lean();
  const vehicleIds = [...new Set(workOrders.map((w) => w.vehicle?.toString()).filter(Boolean))];
  const vehicles = await Vehicle.find({ _id: { $in: vehicleIds }, ...q })
    .sort({ updatedAt: -1 })
    .limit(200);
  return res.json({ vehicles });
});

const getVehicle = asyncHandler(async (req, res) => {
  const vehicleId = req.params.id;
  if (!mongoose.isValidObjectId(vehicleId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  }

  const allowed = await canReadVehicle({
    role: req.user.role,
    userId: req.user.sub,
    vehicleId,
  });
  if (allowed === null) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (!allowed) return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });

  const vehicle = await Vehicle.findById(vehicleId);
  return res.json({ vehicle });
});

const updateVehicle = asyncHandler(async (req, res) => {
  const vehicleId = req.params.id;
  if (!mongoose.isValidObjectId(vehicleId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  }

  const role = req.user.role;
  const userId = req.user.sub;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (role === ROLES.ADMIN) {
    // puede editar cualquier vehículo
  } else if (role === ROLES.CLIENT && vehicle.owner.toString() === userId) {
    // dueño
  } else if (role === ROLES.MECHANIC) {
    const assigned = await WorkOrder.exists({ vehicle: vehicleId, mechanic: userId });
    if (!assigned) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
    }
  } else {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const input = vehicleUpdateSchema.parse(req.body);

  if (role === ROLES.ADMIN && input.ownerId) vehicle.owner = input.ownerId;
  if (input.plate !== undefined) vehicle.plate = input.plate;
  if (input.vin !== undefined) vehicle.vin = input.vin;
  if (input.brand !== undefined) vehicle.brand = input.brand;
  if (input.model !== undefined) vehicle.model = input.model;
  if (input.year !== undefined) vehicle.year = input.year;
  if (input.color !== undefined) vehicle.color = input.color;
  if (input.fuelType !== undefined || input.combustible !== undefined) {
    vehicle.fuelType = input.fuelType ?? input.combustible;
  }
  if (input.mileage !== undefined) vehicle.mileage = input.mileage;
  if (input.notes !== undefined) vehicle.notes = input.notes;
  if (input.characteristics !== undefined) vehicle.characteristics = input.characteristics;
  if (input.modifications !== undefined) vehicle.modifications = input.modifications;

  await vehicle.save();
  publishToUser(vehicle.owner, "vehicle.updated", {
    vehicle: vehicle.toJSON(),
  });
  return res.json({ vehicle });
});

const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicleId = req.params.id;
  if (!mongoose.isValidObjectId(vehicleId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  }
  const role = req.user.role;
  const userId = req.user.sub;

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (role !== ROLES.ADMIN && vehicle.owner.toString() !== userId) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const hasOrders = await WorkOrder.exists({ vehicle: vehicleId });
  if (hasOrders) {
    return res.status(409).json({
      error: "HAS_WORK_ORDERS",
      message: "No se puede eliminar: tiene órdenes de trabajo",
    });
  }

  const payload = { vehicleId: vehicle._id.toString() };
  const owner = vehicle.owner?.toString?.();
  await vehicle.deleteOne();
  if (owner) publishToUser(owner, "vehicle.deleted", payload);
  return res.status(204).send();
});

module.exports = { createVehicle, listVehicles, getVehicle, updateVehicle, deleteVehicle };

