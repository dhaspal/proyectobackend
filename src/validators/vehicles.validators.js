const { z } = require("zod");

const longVehicleText = z.string().max(50000).optional();

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
  notes: longVehicleText,
  characteristics: longVehicleText,
  modifications: longVehicleText,
});

const vehicleUpdateSchema = vehicleCreateSchema.partial();

module.exports = { vehicleCreateSchema, vehicleUpdateSchema };

