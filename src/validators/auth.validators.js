const { z } = require("zod");
const { ROLES } = require("../constants/roles");

const registerSchema = z.object({
  // Compatibilidad: puedes enviar name o firstName/lastName
  name: z.string().min(2).max(120).optional(),
  firstName: z.string().min(2).max(80).optional(),
  lastName: z.string().min(2).max(120).optional(),
  age: z.number().int().min(0).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido"),
  email: z.string().email().optional(),
  password: z.string().min(6).max(200),
  role: z.enum([ROLES.CLIENT, ROLES.MECHANIC]).default(ROLES.CLIENT),
  phone: z.string().min(6).max(30).optional(),
}).refine((v) => Boolean(v.name || (v.firstName && v.lastName)), {
  message: "Debes enviar name o firstName+lastName",
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };
