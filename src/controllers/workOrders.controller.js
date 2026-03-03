const mongoose = require("mongoose");
const { WorkOrder } = require("../models/WorkOrder");
const { Vehicle } = require("../models/Vehicle");
const { ROLES } = require("../constants/roles");
const { WORK_ORDER_STATUS } = require("../constants/workOrder");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  createWorkOrderSchema,
  updateWorkOrderByMechanicSchema,
  updateWorkOrderByClientSchema,
} = require("../validators/workOrders.validators");

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

async function getWorkOrderOr404(id) {
  const wo = await WorkOrder.findById(id);
  return wo;
}

function canReadWorkOrder({ role, userId, wo }) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.CLIENT) return wo.client.toString() === userId;
  if (role === ROLES.MECHANIC) return wo.mechanic?.toString() === userId;
  return false;
}

function canEditWorkOrderAsMechanic({ role, userId, wo }) {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.MECHANIC) return wo.mechanic?.toString() === userId;
  return false;
}

const createWorkOrder = asyncHandler(async (req, res) => {
  const input = createWorkOrderSchema.parse(req.body);
  const role = req.user.role;
  const userId = req.user.sub;

  if (!isValidId(input.vehicleId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "vehicleId inválido" });
  }
  if (input.mechanicId && !isValidId(input.mechanicId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "mechanicId inválido" });
  }

  const vehicle = await Vehicle.findById(input.vehicleId).select("owner").lean();
  if (!vehicle) return res.status(404).json({ error: "NOT_FOUND", message: "Vehículo no existe" });

  // Cliente solo puede crear para su vehículo y queda como REQUESTED
  let clientId = vehicle.owner.toString();
  let mechanicId = input.mechanicId;
  let status = WORK_ORDER_STATUS.OPEN;

  if (role === ROLES.CLIENT) {
    if (vehicle.owner.toString() !== userId) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Ese vehículo no es tuyo" });
    }
    clientId = userId;
    mechanicId = undefined;
    status = WORK_ORDER_STATUS.REQUESTED;
  }

  if (role === ROLES.MECHANIC) {
    // Mecánico crea asignándose a sí mismo, salvo que admin asigne
    mechanicId = mechanicId || userId;
    status = WORK_ORDER_STATUS.OPEN;
  }

  const wo = await WorkOrder.create({
    vehicle: input.vehicleId,
    client: clientId,
    mechanic: mechanicId,
    status,
    title: input.title,
    problemDescription: input.problemDescription,
    clientNotes: input.clientNotes,
  });

  return res.status(201).json({ workOrder: wo });
});

const listWorkOrders = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.sub;

  const q = {};
  if (req.query.status) q.status = String(req.query.status);
  if (req.query.vehicleId) q.vehicle = String(req.query.vehicleId);

  if (role === ROLES.ADMIN) {
    const workOrders = await WorkOrder.find(q).sort({ updatedAt: -1 }).limit(200);
    return res.json({ workOrders });
  }
  if (role === ROLES.CLIENT) {
    q.client = userId;
    const workOrders = await WorkOrder.find(q).sort({ updatedAt: -1 }).limit(200);
    return res.json({ workOrders });
  }
  // MECHANIC
  q.mechanic = userId;
  const workOrders = await WorkOrder.find(q).sort({ updatedAt: -1 }).limit(200);
  return res.json({ workOrders });
});

const getWorkOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const wo = await getWorkOrderOr404(id);
  if (!wo) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (!canReadWorkOrder({ role: req.user.role, userId: req.user.sub, wo })) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  return res.json({ workOrder: wo });
});

const updateWorkOrderByMechanic = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const wo = await getWorkOrderOr404(id);
  if (!wo) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (!canEditWorkOrderAsMechanic({ role: req.user.role, userId: req.user.sub, wo })) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const input = updateWorkOrderByMechanicSchema.parse(req.body);

  if (input.status) {
    wo.status = input.status;
    if (input.status === WORK_ORDER_STATUS.IN_PROGRESS && !wo.startedAt) wo.startedAt = new Date();
    if (
      (input.status === WORK_ORDER_STATUS.DONE ||
        input.status === WORK_ORDER_STATUS.DELIVERED ||
        input.status === WORK_ORDER_STATUS.CANCELLED) &&
      !wo.finishedAt
    ) {
      wo.finishedAt = new Date();
    }
  }
  if (input.diagnosis !== undefined) wo.diagnosis = input.diagnosis;
  if (input.internalNotes !== undefined) wo.internalNotes = input.internalNotes;
  if (input.laborHours !== undefined) wo.laborHours = input.laborHours;
  if (input.laborRate !== undefined) wo.laborRate = input.laborRate;
  if (input.parts !== undefined) wo.parts = input.parts;
  if (input.startedAt !== undefined) wo.startedAt = new Date(input.startedAt);
  if (input.finishedAt !== undefined) wo.finishedAt = new Date(input.finishedAt);

  await wo.save();
  return res.json({ workOrder: wo });
});

const updateWorkOrderByClient = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const wo = await getWorkOrderOr404(id);
  if (!wo) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (req.user.role !== ROLES.CLIENT || wo.client.toString() !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const input = updateWorkOrderByClientSchema.parse(req.body);
  wo.clientNotes = input.clientNotes;
  await wo.save();
  return res.json({ workOrder: wo });
});

const claimWorkOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  if (req.user.role !== ROLES.MECHANIC && req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const wo = await getWorkOrderOr404(id);
  if (!wo) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (wo.mechanic && req.user.role !== ROLES.ADMIN) {
    return res.status(409).json({ error: "ALREADY_ASSIGNED", message: "Ya tiene mecánico asignado" });
  }

  wo.mechanic = req.user.role === ROLES.ADMIN && req.body?.mechanicId ? req.body.mechanicId : req.user.sub;
  if (wo.status === WORK_ORDER_STATUS.REQUESTED) wo.status = WORK_ORDER_STATUS.OPEN;
  await wo.save();
  return res.json({ workOrder: wo });
});

const deleteWorkOrder = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  if (req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo admin" });
  }
  const wo = await getWorkOrderOr404(id);
  if (!wo) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  await wo.deleteOne();
  return res.status(204).send();
});

module.exports = {
  createWorkOrder,
  listWorkOrders,
  getWorkOrder,
  updateWorkOrderByMechanic,
  updateWorkOrderByClient,
  claimWorkOrder,
  deleteWorkOrder,
};

