const { z } = require("zod");

const createServiceSchema = z.object({
  name: z.string().min(2).max(160),
  description: z.string().max(4000).optional(),
  category: z.string().max(120).optional(),
  basePrice: z.number().min(0).optional(),
  durationMin: z.number().int().min(5).max(8 * 60).optional(),
  isActive: z.boolean().optional(),
});

const updateServiceSchema = createServiceSchema.partial();

module.exports = { createServiceSchema, updateServiceSchema };

