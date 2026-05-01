const { z } = require("zod");

const itemSchema = z.object({
  key: z.string().min(1).max(80),
  label: z.string().min(1).max(160),
  status: z.enum(["OK", "WARN", "FAIL", "NA"]).optional(),
  note: z.string().max(2000).optional(),
});

const createInspectionSchema = z.object({
  vehicleId: z.string().min(1),
  clientId: z.string().min(1), // taller
  mechanicId: z.string().min(1).optional(), // admin
  appointmentId: z.string().min(1).optional(),
  workOrderId: z.string().min(1).optional(),
  inspectedAt: z.string().datetime().optional(),
  mileage: z.number().int().min(0).optional(),
  summary: z.string().max(4000).optional(),
  recommendations: z.string().max(4000).optional(),
  items: z.array(itemSchema).default([]),
  attachments: z.array(z.string().min(1)).optional(),
});

const updateInspectionSchema = z.object({
  inspectedAt: z.string().datetime().optional(),
  mileage: z.number().int().min(0).optional(),
  summary: z.string().max(4000).optional(),
  recommendations: z.string().max(4000).optional(),
  items: z.array(itemSchema).optional(),
  attachments: z.array(z.string().min(1)).optional(),
}).partial();

module.exports = { createInspectionSchema, updateInspectionSchema };

