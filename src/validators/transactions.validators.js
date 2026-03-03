const { z } = require("zod");
const { TRANSACTION_TYPE } = require("../constants/finance");

const createTransactionSchema = z.object({
  type: z.enum(Object.values(TRANSACTION_TYPE)),
  amount: z.number().min(0.01),
  currency: z.string().min(3).max(5).optional(),
  category: z.string().max(120).optional(),
  description: z.string().max(2000).optional(),
  date: z.string().datetime().optional(),
  workOrderId: z.string().min(1).optional(),
  mechanicId: z.string().min(1).optional(), // admin puede setear dueño
});

const updateTransactionSchema = createTransactionSchema.partial();

module.exports = { createTransactionSchema, updateTransactionSchema };

