const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  createAppointment,
  listAppointments,
  listInbox,
  getAppointment,
  acceptAppointment,
  rejectAppointment,
  proposeReschedule,
  confirmProposal,
  cancelAppointment,
  markComplete,
  markIncomplete,
} = require("../controllers/appointments.controller");

const router = express.Router();
router.use(requireAuth);

// Crear cita (cliente) o (taller para un vehículo de cliente)
router.post("/", requireRole(ROLES.CLIENT, ROLES.MECHANIC, ROLES.ADMIN), createAppointment);

// Listado (cliente: sus citas, mecánico: las suyas, admin: todas)
router.get("/", listAppointments);

// Inbox del taller (solicitudes pendientes)
router.get("/inbox", requireRole(ROLES.MECHANIC, ROLES.ADMIN), listInbox);

router.get("/:id", getAppointment);

// Acciones del taller
router.post("/:id/accept", requireRole(ROLES.MECHANIC, ROLES.ADMIN), acceptAppointment);
router.post("/:id/reject", requireRole(ROLES.MECHANIC, ROLES.ADMIN), rejectAppointment);
router.post("/:id/propose-reschedule", requireRole(ROLES.MECHANIC, ROLES.ADMIN), proposeReschedule);

// Confirmación del cliente (cuando hay propuesta)
router.post("/:id/confirm-proposal", requireRole(ROLES.CLIENT), confirmProposal);

// Cancelar (cliente dueño o taller)
router.post("/:id/cancel", requireRole(ROLES.CLIENT, ROLES.MECHANIC, ROLES.ADMIN), cancelAppointment);

// Historial (marcar completa/incompleta)
router.post("/:id/complete", requireRole(ROLES.MECHANIC, ROLES.ADMIN), markComplete);
router.post("/:id/incomplete", requireRole(ROLES.MECHANIC, ROLES.ADMIN), markIncomplete);

module.exports = router;

