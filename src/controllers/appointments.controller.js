const mongoose = require("mongoose");
const { Appointment } = require("../models/Appointment");
const { WorkOrder } = require("../models/WorkOrder");
const { Vehicle } = require("../models/Vehicle");
const { ROLES } = require("../constants/roles");
const { APPOINTMENT_STATUS } = require("../constants/appointments");
const { WORK_ORDER_STATUS } = require("../constants/workOrder");
const { asyncHandler } = require("../utils/asyncHandler");
const {
  createAppointmentSchema,
  acceptAppointmentSchema,
  rejectAppointmentSchema,
  proposeRescheduleSchema,
  confirmProposalSchema,
  markCompleteSchema,
  markIncompleteSchema,
} = require("../validators/appointments.validators");
const { upsertAppointmentEntry, removeAppointmentEntry } = require("../services/schedule.service");

function isValidId(id) {
  return mongoose.isValidObjectId(id);
}

async function loadAppointmentOr404(id) {
  const appt = await Appointment.findById(id);
  return appt;
}

function requireClientOwner(req, appt) {
  return req.user.role === ROLES.CLIENT && String(appt.client) === req.user.sub;
}

function isWorkshop(req) {
  return req.user.role === ROLES.MECHANIC || req.user.role === ROLES.ADMIN;
}

const createAppointment = asyncHandler(async (req, res) => {
  const input = createAppointmentSchema.parse(req.body);
  if (!isValidId(input.vehicleId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "vehicleId inválido" });
  }

  const vehicle = await Vehicle.findById(input.vehicleId).select("owner").lean();
  if (!vehicle) return res.status(404).json({ error: "NOT_FOUND", message: "Vehículo no existe" });

  // Cliente solo puede pedir citas para sus vehículos
  if (req.user.role === ROLES.CLIENT && String(vehicle.owner) !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Ese vehículo no es tuyo" });
  }

  const clientId = req.user.role === ROLES.CLIENT ? req.user.sub : String(vehicle.owner);

  const appt = await Appointment.create({
    client: clientId,
    vehicle: input.vehicleId,
    requestedAt: new Date(input.requestedAt),
    durationMin: input.durationMin ?? 60,
    title: input.title,
    description: input.description,
    clientNote: input.clientNote,
    status: APPOINTMENT_STATUS.REQUESTED,
    createdBy: req.user.sub,
  });

  return res.status(201).json({ appointment: appt });
});

const listAppointments = asyncHandler(async (req, res) => {
  const q = {};
  const role = req.user.role;
  const userId = req.user.sub;

  if (req.query.status) q.status = String(req.query.status);
  if (req.query.vehicleId) q.vehicle = String(req.query.vehicleId);
  if (req.query.clientId && role === ROLES.ADMIN) q.client = String(req.query.clientId);

  if (role === ROLES.CLIENT) q.client = userId;
  if (role === ROLES.MECHANIC) q.mechanic = userId;

  const appointments = await Appointment.find(q).sort({ updatedAt: -1 }).limit(200);
  return res.json({ appointments });
});

const listInbox = asyncHandler(async (req, res) => {
  // Taller: "Órdenes" de citas pendientes para gestionar
  const q = { status: APPOINTMENT_STATUS.REQUESTED };
  const appointments = await Appointment.find(q).sort({ requestedAt: 1 }).limit(200);
  return res.json({ appointments });
});

const getAppointment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role === ROLES.CLIENT && String(appt.client) !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  if (req.user.role === ROLES.MECHANIC && String(appt.mechanic || "") !== req.user.sub) {
    // Mecánico puede ver solo las asignadas + también las REQUESTED del inbox si quiere
    if (appt.status !== APPOINTMENT_STATUS.REQUESTED) {
      return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
    }
  }

  return res.json({ appointment: appt });
});

const acceptAppointment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const input = acceptAppointmentSchema.parse(req.body);

  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (!isWorkshop(req)) return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });

  // Solo permitir aceptar desde REQUESTED o RESCHEDULE_PROPOSED/CONFIRMED
  if (![APPOINTMENT_STATUS.REQUESTED, APPOINTMENT_STATUS.CONFIRMED, APPOINTMENT_STATUS.RESCHEDULE_PROPOSED].includes(appt.status)) {
    return res.status(409).json({ error: "INVALID_STATE", message: "No se puede aceptar en este estado" });
  }

  const mechanicId = req.user.role === ROLES.ADMIN && input.mechanicId ? input.mechanicId : req.user.sub;
  if (!isValidId(mechanicId)) return res.status(400).json({ error: "BAD_REQUEST", message: "mechanicId inválido" });

  appt.mechanic = mechanicId;
  appt.scheduledAt = new Date(input.scheduledAt);
  appt.durationMin = input.durationMin ?? appt.durationMin ?? 60;
  appt.workshopNote = input.workshopNote ?? appt.workshopNote;
  appt.proposedAt = undefined;
  appt.status = APPOINTMENT_STATUS.ACCEPTED;

  await appt.save();

  await upsertAppointmentEntry({
    mechanicId,
    scheduledAt: appt.scheduledAt,
    durationMin: appt.durationMin,
    appointmentId: appt._id,
    vehicleId: appt.vehicle,
    note: appt.title,
  });

  return res.json({ appointment: appt });
});

const rejectAppointment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const input = rejectAppointmentSchema.parse(req.body);

  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (!isWorkshop(req)) return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });

  // Si estaba agendado, limpiar agenda
  if (appt.mechanic && appt.scheduledAt) {
    await removeAppointmentEntry({ mechanicId: appt.mechanic, scheduledAt: appt.scheduledAt, appointmentId: appt._id });
  }

  appt.status = APPOINTMENT_STATUS.REJECTED;
  appt.workshopNote = input.workshopNote ?? appt.workshopNote;
  appt.proposedAt = undefined;
  appt.scheduledAt = undefined;
  await appt.save();

  return res.json({ appointment: appt });
});

const proposeReschedule = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const input = proposeRescheduleSchema.parse(req.body);

  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });
  if (!isWorkshop(req)) return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });

  // Si ya estaba aceptada/agendada, limpiar agenda anterior
  if (appt.mechanic && appt.scheduledAt) {
    await removeAppointmentEntry({ mechanicId: appt.mechanic, scheduledAt: appt.scheduledAt, appointmentId: appt._id });
  }

  const mechanicId = req.user.role === ROLES.ADMIN && input.mechanicId ? input.mechanicId : req.user.sub;
  if (!isValidId(mechanicId)) return res.status(400).json({ error: "BAD_REQUEST", message: "mechanicId inválido" });

  appt.mechanic = mechanicId;
  appt.proposedAt = new Date(input.proposedAt);
  appt.durationMin = input.durationMin ?? appt.durationMin ?? 60;
  appt.workshopNote = input.workshopNote ?? appt.workshopNote;
  appt.status = APPOINTMENT_STATUS.RESCHEDULE_PROPOSED;
  appt.scheduledAt = undefined;
  await appt.save();

  return res.json({ appointment: appt });
});

const confirmProposal = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const input = confirmProposalSchema.parse(req.body);
  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (!requireClientOwner(req, appt)) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo el cliente dueño puede confirmar" });
  }

  if (appt.status !== APPOINTMENT_STATUS.RESCHEDULE_PROPOSED) {
    return res.status(409).json({ error: "INVALID_STATE", message: "No hay propuesta para confirmar" });
  }

  appt.clientNote = input.clientNote ?? appt.clientNote;

  if (input.confirm === false) {
    appt.status = APPOINTMENT_STATUS.CANCELLED;
    await appt.save();
    return res.json({ appointment: appt });
  }

  // Cliente confirma: se agenda automáticamente a la fecha propuesta
  if (!appt.proposedAt) {
    return res.status(409).json({ error: "INVALID_STATE", message: "Falta proposedAt" });
  }
  if (!appt.mechanic) {
    return res.status(409).json({ error: "INVALID_STATE", message: "Falta mecánico asignado" });
  }

  appt.status = APPOINTMENT_STATUS.CONFIRMED;
  appt.scheduledAt = appt.proposedAt;
  appt.proposedAt = undefined;
  await appt.save();

  await upsertAppointmentEntry({
    mechanicId: appt.mechanic,
    scheduledAt: appt.scheduledAt,
    durationMin: appt.durationMin ?? 60,
    appointmentId: appt._id,
    vehicleId: appt.vehicle,
    note: appt.title,
  });

  return res.json({ appointment: appt });
});

const cancelAppointment = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  const isClient = req.user.role === ROLES.CLIENT;
  if (isClient && String(appt.client) !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  if (!isClient && !isWorkshop(req)) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  if (appt.mechanic && appt.scheduledAt) {
    await removeAppointmentEntry({ mechanicId: appt.mechanic, scheduledAt: appt.scheduledAt, appointmentId: appt._id });
  }

  appt.status = APPOINTMENT_STATUS.CANCELLED;
  await appt.save();
  return res.json({ appointment: appt });
});

const markComplete = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const input = markCompleteSchema.parse(req.body);
  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (!isWorkshop(req)) return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  if (req.user.role === ROLES.MECHANIC && String(appt.mechanic || "") !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo el mecánico asignado" });
  }

  appt.status = APPOINTMENT_STATUS.COMPLETED;
  appt.completedAt = new Date();
  appt.workshopNote = input.workshopNote ?? appt.workshopNote;

  // Crear/actualizar reparación para historial del cliente
  const baseWo = {
    vehicle: appt.vehicle,
    client: appt.client,
    mechanic: appt.mechanic,
    status: WORK_ORDER_STATUS.DONE,
    title: appt.title,
    problemDescription: appt.description,
    repairDescription: input.repairDescription,
    cost: input.cost,
    mileage: input.mileage,
    finishedAt: new Date(),
    startedAt: appt.scheduledAt ?? appt.requestedAt,
  };

  if (appt.workOrder) {
    const wo = await WorkOrder.findById(appt.workOrder);
    if (wo) {
      Object.assign(wo, baseWo);
      await wo.save();
    } else {
      const created = await WorkOrder.create(baseWo);
      appt.workOrder = created._id;
    }
  } else {
    const created = await WorkOrder.create(baseWo);
    appt.workOrder = created._id;
  }

  await appt.save();
  return res.json({ appointment: appt });
});

const markIncomplete = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!isValidId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const input = markIncompleteSchema.parse(req.body);
  const appt = await loadAppointmentOr404(id);
  if (!appt) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (!isWorkshop(req)) return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  if (req.user.role === ROLES.MECHANIC && String(appt.mechanic || "") !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Solo el mecánico asignado" });
  }

  appt.status = APPOINTMENT_STATUS.INCOMPLETE;
  appt.incompleteReason = input.reason;
  appt.workshopNote = input.workshopNote ?? appt.workshopNote;
  await appt.save();
  return res.json({ appointment: appt });
});

module.exports = {
  createAppointment,
  listAppointments,
  listInbox,
  getAppointment,
  acceptAppointment,
  rejectAppointment,
  proposeReschedule,
  confirmProposal,
  cancelAppointment,
  markComplete,
  markIncomplete,
};

