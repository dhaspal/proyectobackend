const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  createVehicle,
  listVehicles,
  getVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicles.controller");

const router = express.Router();

router.use(requireAuth);

// Cliente/Admin pueden crear. Mecánico no.
router.post("/", requireRole(ROLES.CLIENT, ROLES.ADMIN), createVehicle);

// Todos autenticados pueden listar (filtrado por rol)
router.get("/", listVehicles);
router.get("/:id", getVehicle);

// Cliente/Admin; mecánico solo si tiene orden asignada a ese vehículo (ver controlador)
router.patch("/:id", requireRole(ROLES.CLIENT, ROLES.ADMIN, ROLES.MECHANIC), updateVehicle);
router.delete("/:id", requireRole(ROLES.CLIENT, ROLES.ADMIN), deleteVehicle);

module.exports = router;

