const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  createInspection,
  listInspections,
  getInspection,
  updateInspection,
  deleteInspection,
} = require("../controllers/inspections.controller");

const router = express.Router();
router.use(requireAuth);

// Cliente puede listar/leer sus inspecciones; taller puede CRUD
router.get("/", requireRole(ROLES.CLIENT, ROLES.MECHANIC, ROLES.ADMIN), listInspections);
router.get("/:id", requireRole(ROLES.CLIENT, ROLES.MECHANIC, ROLES.ADMIN), getInspection);

router.post("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), createInspection);
router.patch("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), updateInspection);
router.delete("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), deleteInspection);

module.exports = router;

