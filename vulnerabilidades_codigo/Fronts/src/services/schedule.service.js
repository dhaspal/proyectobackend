const { Schedule } = require("../models/Schedule");

function parseDay(date) {
  const d = new Date(date);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

function addMinutesHHMM(hhmm, minutesToAdd) {
  const [hh, mm] = hhmm.split(":").map(Number);
  const total = hh * 60 + mm + minutesToAdd;
  const h = Math.floor((total % (24 * 60)) / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function dateToHHMM(date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

async function upsertAppointmentEntry({ mechanicId, scheduledAt, durationMin, appointmentId, vehicleId, note }) {
  const day = parseDay(scheduledAt);
  const start = dateToHHMM(scheduledAt);
  const end = addMinutesHHMM(start, durationMin);

  const schedule = await Schedule.findOne({ mechanic: mechanicId, date: day });
  const entries = schedule?.entries ? [...schedule.entries] : [];

  // Remueve cualquier entry previa para esta cita
  const filtered = entries.filter((e) => String(e.appointment || "") !== String(appointmentId));
  filtered.push({
    start,
    end,
    appointment: appointmentId,
    vehicle: vehicleId,
    note,
  });

  const updated = await Schedule.findOneAndUpdate(
    { mechanic: mechanicId, date: day },
    { $set: { mechanic: mechanicId, date: day, entries: filtered } },
    { new: true, upsert: true }
  );

  return updated;
}

async function removeAppointmentEntry({ mechanicId, scheduledAt, appointmentId }) {
  const day = parseDay(scheduledAt);
  const schedule = await Schedule.findOne({ mechanic: mechanicId, date: day });
  if (!schedule) return null;

  schedule.entries = (schedule.entries || []).filter(
    (e) => String(e.appointment || "") !== String(appointmentId)
  );
  await schedule.save();
  return schedule;
}

module.exports = { upsertAppointmentEntry, removeAppointmentEntry };

