const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  listMyNotifications,
  markRead,
  createNotification,
} = require("../controllers/notifications.controller");

const router = express.Router();
router.use(requireAuth);

router.get("/", listMyNotifications);
router.post("/mark-read", markRead);

// Taller/admin puede crear notificación a un usuario
router.post("/", requireRole(ROLES.MECHANIC, ROLES.ADMIN), createNotification);

module.exports = router;

