const { z } = require("zod");
const { ROLES } = require("../constants/roles");

const adminCreateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  age: z.number().int().min(0).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido"),
  password: z.string().min(6).max(200),
  role: z.enum([ROLES.ADMIN, ROLES.MECHANIC, ROLES.CLIENT]),
  phone: z.string().min(6).max(30).optional(),
  isActive: z.boolean().optional(),
}).refine((v) => Boolean(v.name || (v.firstName && v.lastName)), {
  message: "Debes enviar name o firstName+lastName",
});

const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  age: z.number().int().min(0).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido").optional(),
  phone: z.string().min(6).max(30).optional(),
  role: z.enum([ROLES.ADMIN, ROLES.MECHANIC, ROLES.CLIENT]).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).max(200).optional(),
});

const selfUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  age: z.number().int().min(0).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido").optional(),
  phone: z.string().min(6).max(30).optional(),
  password: z.string().min(6).max(200).optional(),
});

module.exports = { adminCreateUserSchema, adminUpdateUserSchema, selfUpdateSchema };

