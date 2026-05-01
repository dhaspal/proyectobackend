const mongoose = require("mongoose");
const { Notification } = require("../models/Notification");
const { asyncHandler } = require("../utils/asyncHandler");
const { createNotificationSchema, markReadSchema } = require("../validators/notifications.validators");
const { ROLES } = require("../constants/roles");
const { notifyUser } = require("../services/notifications.service");
const { publishToUser } = require("../services/realtime.service");

const listMyNotifications = asyncHandler(async (req, res) => {
  const q = { user: req.user.sub };
  if (req.query.unread === "true") q.readAt = null;
  const notifications = await Notification.find(q).sort({ createdAt: -1 }).limit(200);
  return res.json({
    notifications: notifications.map((n) => ({
      ...n.toJSON(),
      userId: n.user?.toString?.() ?? req.user.sub,
      read: Boolean(n.readAt),
    })),
  });
});

const markRead = asyncHandler(async (req, res) => {
  const input = markReadSchema.parse(req.body);
  const ids = input.ids.filter((id) => mongoose.isValidObjectId(id));
  const result = await Notification.updateMany(
    { _id: { $in: ids }, user: req.user.sub, readAt: null },
    { $set: { readAt: new Date() } }
  );
  publishToUser(req.user.sub, "notification.read", { ids });
  return res.json({ ok: true, updated: result.modifiedCount ?? result.nModified ?? 0 });
});

const createNotification = asyncHandler(async (req, res) => {
  if (![ROLES.MECHANIC, ROLES.ADMIN].includes(req.user.role)) {
    return res.status(403).json({ error: "FORBIDDEN", message: "Sin permisos" });
  }
  const input = createNotificationSchema.parse(req.body);
  if (!mongoose.isValidObjectId(input.userId)) {
    return res.status(400).json({ error: "BAD_REQUEST", message: "userId inválido" });
  }
  const notification = await notifyUser({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    data: input.data,
  });
  return res.status(201).json({
    notification: { ...notification.toJSON(), userId: input.userId, read: false },
  });
});

module.exports = { listMyNotifications, markRead, createNotification };

