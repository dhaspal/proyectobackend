const { z } = require("zod");

const scheduleEntrySchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  workOrderId: z.string().min(1).optional(),
  vehicleId: z.string().min(1).optional(),
  note: z.string().max(2000).optional(),
});

const upsertScheduleSchema = z.object({
  mechanicId: z.string().min(1).optional(), // admin
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  entries: z.array(scheduleEntrySchema).default([]),
});

module.exports = { upsertScheduleSchema };

