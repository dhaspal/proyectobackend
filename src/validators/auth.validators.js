const { z } = require("zod");
const { ROLES } = require("../constants/roles");

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(200),
  role: z.enum([ROLES.CLIENT, ROLES.MECHANIC]).default(ROLES.CLIENT),
  phone: z.string().min(6).max(30).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = { registerSchema, loginSchema };
