const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  getMyClient,
  updateMyClient,
  createClient,
  listClients,
  getClientById,
} = require("../controllers/clients.controller");

const router = express.Router();
router.use(requireAuth);

// Cliente (su propia info)
router.get("/me", requireRole(ROLES.CLIENT), getMyClient);
router.patch("/me", requireRole(ROLES.CLIENT), updateMyClient);

// Taller/Admin: administrar clientes
router.get("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), listClients);
router.get("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), getClientById);
router.post("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), createClient);

module.exports = router;

