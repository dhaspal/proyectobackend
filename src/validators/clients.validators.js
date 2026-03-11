const { z } = require("zod");

const createClientSchema = z.object({
  name: z.string().min(2).max(120),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido"),
  password: z.string().min(6).max(200),
  phone: z.string().min(6).max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
});

const updateClientSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9._-]+$/, "Username inválido").optional(),
  phone: z.string().min(6).max(30).optional(),
  email: z.string().email().optional(),
  address: z.string().max(200).optional(),
});

module.exports = { createClientSchema, updateClientSchema };

