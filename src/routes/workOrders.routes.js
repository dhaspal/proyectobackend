const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  createWorkOrder,
  listWorkOrders,
  getWorkOrder,
  updateWorkOrderByMechanic,
  updateWorkOrderByClient,
  claimWorkOrder,
  deleteWorkOrder,
} = require("../controllers/workOrders.controller");

const router = express.Router();
router.use(requireAuth);

// Cliente también puede crear solicitudes (REQUESTED)
router.post("/", requireRole(ROLES.CLIENT, ROLES.MECHANIC, ROLES.ADMIN), createWorkOrder);
router.get("/", listWorkOrders);
router.get("/:id", getWorkOrder);

router.patch("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), updateWorkOrderByMechanic);
router.patch("/:id/client", requireRole(ROLES.CLIENT), updateWorkOrderByClient);

router.post("/:id/claim", requireRole(ROLES.MECHANIC, ROLES.ADMIN), claimWorkOrder);

router.delete("/:id", requireRole(ROLES.ADMIN), deleteWorkOrder);

module.exports = router;

