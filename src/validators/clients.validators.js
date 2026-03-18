const { z } = require("zod");

const createClientSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  age: z.number().int().min(0).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido"),
  password: z.string().min(6).max(200),
  phone: z.string().min(6).max(30).optional(),
  address: z.string().max(200).optional(),
}).refine((v) => Boolean(v.name || (v.firstName && v.lastName)), {
  message: "Debes enviar name o firstName+lastName",
});

const updateClientSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  age: z.number().int().min(0).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido").optional(),
  phone: z.string().min(6).max(30).optional(),
  address: z.string().max(200).optional(),
});

module.exports = { createClientSchema, updateClientSchema };

