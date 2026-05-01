const mongoose = require("mongoose");
const { Inspection } = require("../models/Inspection");
const { Vehicle } = require("../models/Vehicle");
const { WorkOrder } = require("../models/WorkOrder");
const { Appointment } = require("../models/Appointment");
const { asyncHandler } = require("../utils/asyncHandler");
const { createInspectionSchema, updateInspectionSchema } = require("../validators/inspections.validators");
const { ROLES } = require("../constants/roles");

function isWorkshop(role) {
  return role === ROLES.MECHANIC || role === ROLES.ADMIN;
}

const createInspection = asyncHandler(async (req, res) => {
  if (!isWorkshop(req.user.role)) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo taller" });
  }
  const input = createInspectionSchema.parse(req.body);

  if (!mongoose.isValidObjectId(input.vehicleId) || !mongoose.isValidObjectId(input.clientId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "IDs inválidos" });
  }
  if (input.workOrderId && !mongoose.isValidObjectId(input.workOrderId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "workOrderId inválido" });
  }
  if (input.appointmentId && !mongoose.isValidObjectId(input.appointmentId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "appointmentId inválido" });
  }

  const vehicle = await Vehicle.findById(input.vehicleId).select("owner").lean();
  if (!vehicle) return res.status(404).json({ error: "NOT_FOUND", message: "Vehículo no existe" });

  // Asegura coherencia: el vehículo debe pertenecer al cliente indicado
  if (String(vehicle.owner) !== String(input.clientId)) {
    return res.status(409).json({ error: "MISMATCH", message: "El vehículo no pertenece a ese cliente" });
  }

  if (input.workOrderId) {
    const wo = await WorkOrder.findById(input.workOrderId).select("vehicle client").lean();
    if (!wo) return res.status(404).json({ error: "NOT_FOUND", message: "WorkOrder no existe" });
    if (String(wo.vehicle) !== String(input.vehicleId) || String(wo.client) !== String(input.clientId)) {
      return res.status(409).json({ error: "MISMATCH", message: "WorkOrder no corresponde a vehículo/cliente" });
    }
  }

  if (input.appointmentId) {
    const appt = await Appointment.findById(input.appointmentId).select("vehicle client").lean();
    if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "Appointment no existe" });
    if (String(appt.vehicle) !== String(input.vehicleId) || String(appt.client) !== String(input.clientId)) {
      return res.status(409).json({ error: "MISMATCH", message: "Appointment no corresponde a vehículo/cliente" });
    }
  }

  const mechanicId =
    req.user.role === ROLES.ADMIN && input.mechanicId ? input.mechanicId : req.user.sub;
  if (!mongoose.isValidObjectId(mechanicId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "mechanicId inválido" });
  }

  const inspection = await Inspection.create({
    vehicle: input.vehicleId,
    client: input.clientId,
    mechanic: mechanicId,
    appointment: input.appointmentId,
    workOrder: input.workOrderId,
    inspectedAt: input.inspectedAt ? new Date(input.inspectedAt) : new Date(),
    mileage: input.mileage,
    summary: input.summary,
    recommendations: input.recommendations,
    items: input.items,
    attachments: input.attachments ?? [],
    createdBy: req.user.sub,
  });

  return res.status(201).json({ inspection });
});

const listInspections = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const q = {};

  if (req.query.vehicleId) q.vehicle = String(req.query.vehicleId);
  if (req.query.workOrderId) q.workOrder = String(req.query.workOrderId);
  if (req.query.appointmentId) q.appointment = String(req.query.appointmentId);

  if (role === ROLES.ADMIN) {
    if (req.query.clientId) q.client = String(req.query.clientId);
    if (req.query.mechanicId) q.mechanic = String(req.query.mechanicId);
    const inspections = await Inspection.find(q).sort({ inspectedAt: -1 }).limit(200);
    return res.json({ inspections });
  }

  if (role === ROLES.CLIENT) {
    q.client = req.user.sub;
    const inspections = await Inspection.find(q).sort({ inspectedAt: -1 }).limit(200);
    return res.json({ inspections });
  }

  // MECHANIC: solo las suyas
  q.mechanic = req.user.sub;
  const inspections = await Inspection.find(q).sort({ inspectedAt: -1 }).limit(200);
  return res.json({ inspections });
});

const getInspection = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });

  const inspection = await Inspection.findById(id);
  if (!inspection) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role === ROLES.ADMIN) return res.json({ inspection });
  if (req.user.role === ROLES.CLIENT && String(inspection.client) === req.user.sub) return res.json({ inspection });
  if (req.user.role === ROLES.MECHANIC && String(inspection.mechanic || "") === req.user.sub) return res.json({ inspection });

  return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
});

const updateInspection = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  if (!isWorkshop(req.user.role)) return res.status(403).json({ error: "FORBIDDEN", message: "Solo taller" });

  const inspection = await Inspection.findById(id);
  if (!inspection) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (req.user.role === ROLES.MECHANIC && String(inspection.mechanic || "") !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo el mecánico creador" });
  }

  const input = updateInspectionSchema.parse(req.body);
  if (input.inspectedAt !== undefined) inspection.inspectedAt = new Date(input.inspectedAt);
  if (input.mileage !== undefined) inspection.mileage = input.mileage;
  if (input.summary !== undefined) inspection.summary = input.summary;
  if (input.recommendations !== undefined) inspection.recommendations = input.recommendations;
  if (input.items !== undefined) inspection.items = input.items;
  if (input.attachments !== undefined) inspection.attachments = input.attachments;

  await inspection.save();
  return res.json({ inspection });
});

const deleteInspection = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  if (!isWorkshop(req.user.role)) return res.status(403).json({ error: "FORBIDDEN", message: "Solo taller" });

  const inspection = await Inspection.findById(id);
  if (!inspection) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (req.user.role === ROLES.MECHANIC && String(inspection.mechanic || "") !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo el mecánico creador" });
  }

  await inspection.deleteOne();
  return res.status(204).send();
});

module.exports = { createInspection, listInspections, getInspection, updateInspection, deleteInspection };

