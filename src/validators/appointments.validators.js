const { z } = require("zod");

const createAppointmentSchema = z.object({
  vehicleId: z.string().min(1),
  requestedAt: z.string().datetime(),
  durationMin: z.number().int().min(5).max(8 * 60).optional(),
  title: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  clientNote: z.string().max(2000).optional(),
});

const acceptAppointmentSchema = z.object({
  scheduledAt: z.string().datetime(),
  mechanicId: z.string().min(1).optional(),
  durationMin: z.number().int().min(5).max(8 * 60).optional(),
  workshopNote: z.string().max(2000).optional(),
});

const rejectAppointmentSchema = z.object({
  workshopNote: z.string().max(2000).optional(),
});

const proposeRescheduleSchema = z.object({
  proposedAt: z.string().datetime(),
  mechanicId: z.string().min(1).optional(),
  durationMin: z.number().int().min(5).max(8 * 60).optional(),
  workshopNote: z.string().max(2000).optional(),
});

const confirmProposalSchema = z.object({
  confirm: z.boolean().default(true),
  clientNote: z.string().max(2000).optional(),
});

const markCompleteSchema = z.object({
  repairDescription: z.string().min(2).max(4000),
  cost: z.number().min(0),
  mileage: z.number().int().min(0).optional(),
  workshopNote: z.string().max(2000).optional(),
});

const markIncompleteSchema = z.object({
  reason: z.string().min(2).max(2000),
  workshopNote: z.string().max(2000).optional(),
});

const cancelAppointmentSchema = z.object({
  clientNote: z.string().max(2000).optional(),
});

module.exports = {
  createAppointmentSchema,
  acceptAppointmentSchema,
  rejectAppointmentSchema,
  proposeRescheduleSchema,
  confirmProposalSchema,
  markCompleteSchema,
  markIncompleteSchema,
  cancelAppointmentSchema,
};

