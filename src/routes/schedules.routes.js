const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  upsertSchedule,
  listSchedules,
  getSchedule,
  deleteSchedule,
} = require("../controllers/schedules.controller");

const router = express.Router();
router.use(requireAuth);

// Solo mecánico o admin
router.get("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), listSchedules);
router.post("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), upsertSchedule);
router.get("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), getSchedule);
router.delete("/:id", requireRole(ROLES.MECHANIC, ROLES.ADMIN), deleteSchedule);

module.exports = router;

