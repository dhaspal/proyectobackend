const { z } = require("zod");
const { ROLES } = require("../constants/roles");

const registerSchema = z.object({
  name: z.string().min(2).max(120).optional(), // compatibilidad
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(120),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "dateOfBirth debe ser YYYY-MM-DD").optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido"),
  password: z.string().min(6).max(200),
  role: z.enum([ROLES.CLIENT, ROLES.MECHANIC]).default(ROLES.CLIENT),
  phone: z.string().min(6).max(30).optional(),
});

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});
module.exports = { registerSchema, loginSchema };
