const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require("../controllers/services.controller");

const router = express.Router();
router.use(requireAuth);

// Todos autenticados pueden ver el catálogo
router.get("/", listServices);
router.get("/:id", getService);

// Solo taller/admin pueden administrar
router.post("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), createService);
router.patch("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), updateService);
router.delete("/:id", requireRole(ROLES.ADMIN), deleteService);

module.exports = router;

