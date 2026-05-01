const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  createTransaction,
  listTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactions.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), listTransactions);
router.post("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), createTransaction);
router.get("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), getTransaction);
router.patch("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), updateTransaction);
router.delete("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), deleteTransaction);

module.exports = router;

