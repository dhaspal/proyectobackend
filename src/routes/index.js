const express = require("express");

const healthRoutes = require("./health.routes");
const authRoutes = require("./auth.routes");
const vehiclesRoutes = require("./vehicles.routes");
const workOrdersRoutes = require("./workOrders.routes");
const schedulesRoutes = require("./schedules.routes");
const transactionsRoutes = require("./transactions.routes");
const usersRoutes = require("./users.routes");
const clientsRoutes = require("./clients.routes");
const appointmentsRoutes = require("./appointments.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/vehicles", vehiclesRoutes);
router.use("/work-orders", workOrdersRoutes);
router.use("/schedules", schedulesRoutes);
router.use("/finance/transactions", transactionsRoutes);
router.use("/users", usersRoutes);
router.use("/clients", clientsRoutes);
router.use("/appointments", appointmentsRoutes);

module.exports = router;

