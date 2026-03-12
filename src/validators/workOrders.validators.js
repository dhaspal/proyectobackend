const { z } = require("zod");
const { WORK_ORDER_STATUS } = require("../constants/workOrder");

const workItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().min(0).default(0),
});

const createWorkOrderSchema = z.object({
  vehicleId: z.string().min(1),
  title: z.string().min(2).max(160),
  problemDescription: z.string().max(4000).optional(),
  clientNotes: z.string().max(4000).optional(),
  mechanicId: z.string().min(1).optional(), // admin/mecánico
});

const updateWorkOrderByMechanicSchema = z.object({
  status: z.enum(Object.values(WORK_ORDER_STATUS)).optional(),
  diagnosis: z.string().max(4000).optional(),
  internalNotes: z.string().max(4000).optional(),
  repairDescription: z.string().max(4000).optional(),
  cost: z.number().min(0).optional(),
  mileage: z.number().int().min(0).optional(),
  laborHours: z.number().min(0).optional(),
  laborRate: z.number().min(0).optional(),
  parts: z.array(workItemSchema).optional(),
  startedAt: z.string().datetime().optional(),
  finishedAt: z.string().datetime().optional(),
});

const updateWorkOrderByClientSchema = z.object({
  clientNotes: z.string().max(4000),
});

module.exports = {
  createWorkOrderSchema,
  updateWorkOrderByMechanicSchema,
  updateWorkOrderByClientSchema,
};

