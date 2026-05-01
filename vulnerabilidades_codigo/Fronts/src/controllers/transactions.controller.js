const mongoose = require("mongoose");
const { Transaction } = require("../models/Transaction");
const { ROLES } = require("../constants/roles");
const { asyncHandler } = require("../utils/asyncHandler");
const { createTransactionSchema, updateTransactionSchema } = require("../validators/transactions.validators");

function getOwnerQuery(role, userId, queryMechanicId) {
  if (role === ROLES.ADMIN) {
    if (queryMechanicId) return { mechanic: queryMechanicId };
    return {};
  }
  // Mecánico: solo sus transacciones
  return { mechanic: userId };
}

const createTransaction = asyncHandler(async (req, res) => {
  const input = createTransactionSchema.parse(req.body);
  const role = req.user.role;
  const userId = req.user.sub;

  const mechanicId =
    role === ROLES.ADMIN && input.mechanicId ? input.mechanicId : userId;

  if (mechanicId && !mongoose.isValidObjectId(mechanicId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "mechanicId inválido" });
  }
  if (input.workOrderId && !mongoose.isValidObjectId(input.workOrderId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "workOrderId inválido" });
  }

  const tx = await Transaction.create({
    type: input.type,
    amount: input.amount,
    currency: input.currency || "USD",
    category: input.category,
    description: input.description,
    date: input.date ? new Date(input.date) : new Date(),
    workOrder: input.workOrderId,
    createdBy: userId,
    mechanic: mechanicId,
  });

  return res.status(201).json({ transaction: tx });
});

const listTransactions = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.sub;

  const q = getOwnerQuery(role, userId, req.query.mechanicId ? String(req.query.mechanicId) : undefined);

  if (req.query.type) q.type = String(req.query.type);
  if (req.query.from || req.query.to) {
    q.date = {};
    if (req.query.from) q.date.$gte = new Date(String(req.query.from));
    if (req.query.to) q.date.$lte = new Date(String(req.query.to));
  }

  const transactions = await Transaction.find(q).sort({ date: -1 }).limit(500);
  return res.json({ transactions });
});

const getTransaction = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });

  const tx = await Transaction.findById(id);
  if (!tx) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role !== ROLES.ADMIN && tx.mechanic?.toString() !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  return res.json({ transaction: tx });
});

const updateTransaction = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const tx = await Transaction.findById(id);
  if (!tx) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role !== ROLES.ADMIN && tx.mechanic?.toString() !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }

  const input = updateTransactionSchema.parse(req.body);
  if (input.type !== undefined) tx.type = input.type;
  if (input.amount !== undefined) tx.amount = input.amount;
  if (input.currency !== undefined) tx.currency = input.currency;
  if (input.category !== undefined) tx.category = input.category;
  if (input.description !== undefined) tx.description = input.description;
  if (input.date !== undefined) tx.date = new Date(input.date);
  if (req.user.role === ROLES.ADMIN && input.mechanicId !== undefined) tx.mechanic = input.mechanicId;
  if (input.workOrderId !== undefined) tx.workOrder = input.workOrderId;

  await tx.save();
  return res.json({ transaction: tx });
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "BAD_REQUEST", message: "ID inválido" });
  const tx = await Transaction.findById(id);
  if (!tx) return res.status(404).json({ error: "NOT_FOUND", message: "No existe" });

  if (req.user.role !== ROLES.ADMIN && tx.mechanic?.toString() !== req.user.sub) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  await tx.deleteOne();
  return res.status(204).send();
});

module.exports = {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};

