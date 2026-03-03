const mongoose = require("mongoose");
const { Schedule } = require("../models/Schedule");
const { ROLES } = require("../constants/roles");
const { asyncHandler } = require("../utils/asyncHandler");
const { upsertScheduleSchema } = require("../validators/schedules.validators");

function parseDay(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  // Mes 0-based
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

const upsertSchedule = asyncHandler(async (req, res) => {
  const input = upsertScheduleSchema.parse(req.body);
  const role = req.user.role;
  const userId = req.user.sub;

  const mechanicId = role === ROLES.ADMIN && input.mechanicId ? input.mechanicId : userId;
  if (!mongoose.isValidObjectId(mechanicId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "mechanicId inválido" });
  }
  if (role === ROLES.MECHANIC && mechanicId !== userId) {
    return res.status(403).json({ error: "FORBIDDEN", message: "No puedes editar otro mecánico" });
  }

  const day = parseDay(input.date);
  const schedule = await Schedule.findOneAndUpdate(
    { mechanic: mechanicId, date: day },
    {
      $set: {
        mechanic: mechanicId,
        date: day,
        entries: (input.entries || []).map((e) => ({
          start: e.start,
          end: e.end,
          workOrder: e.workOrderId,
          vehicle: e.vehicleId,
          note: e.note,
        })),
      },
    },
    { new: true, upsert: true }
  );

  return res.json({ schedule });
});

const listSchedules = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.sub;

  const q = {};
  if (role === ROLES.MECHANIC) q.mechanic = userId;
  if (role === ROLES.ADMIN && req.query.mechanicId) q.mechanic = String(req.query.mechanicId);

  if (req.query.from || req.query.to) {
    q.date = {};
    if (req.query.from) q.date.$gte = parseDay(String(req.query.from));
    if (req.query.to) q.date.$lte = parseDay(String(req.query.to));
  }

  const schedules = await Schedule.find(q).sort({ date: -1 }).limit(200);
  return res.json({ schedules });
});

const getSchedule = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  }
  const schedule = await Schedule.findById(id);
  if (!schedule) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role === ROLES.MECHANIC && schedule.mechanic.toString() !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  return res.json({ schedule });
});

const deleteSchedule = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  }
  const schedule = await Schedule.findById(id);
  if (!schedule) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role === ROLES.MECHANIC && schedule.mechanic.toString() !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  await schedule.deleteOne();
  return res.status(204).send();
});

module.exports = { upsertSchedule, listSchedules, getSchedule, deleteSchedule };

