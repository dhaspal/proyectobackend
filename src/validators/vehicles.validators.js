const { z } = require("zod");

const vehicleCreateSchema = z.object({
  ownerId: z.string().min(1).optional(), // solo admin
  plate: z.string().min(3).max(20).optional(),
  vin: z.string().min(6).max(40).optional(),
  brand: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  year: z.number().int().min(1900).max(2100).optional(),
  color: z.string().min(1).max(60).optional(),
  fuelType: z.string().min(2).max(40).optional(),
  combustible: z.string().min(2).max(40).optional(), // compatibilidad con front
  mileage: z.number().int().min(0).optional(),
  notes: z.string().max(2000).optional(),
});

const vehicleUpdateSchema = vehicleCreateSchema.partial();

module.exports = { vehicleCreateSchema, vehicleUpdateSchema };

