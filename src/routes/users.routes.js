const express = require("express");
const { requireAuth, requireRole } = require("../middlewares/auth");
const { ROLES } = require("../constants/roles");
const {
  listUsers,
  getUser,
  adminCreateUser,
  adminUpdateUser,
  selfUpdate,
  deleteUser,
} = require("../controllers/users.controller");

const router = express.Router();
router.use(requireAuth);

// Admin
router.get("/", requireRole(ROLES.ADMIN), listUsers);
router.post("/", requireRole(ROLES.ADMIN), adminCreateUser);
router.patch("/:id/admin", requireRole(ROLES.ADMIN), adminUpdateUser);

// Admin o mecánico (solo clientes con relación); ver controlador
router.delete("/:id", requireRole(ROLES.ADMIN, ROLES.MECHANIC), deleteUser);

// Admin o self (ver)
router.get("/:id", getUser);
// Self (editar perfil básico)
router.patch("/:id", selfUpdate);

module.exports = router;

