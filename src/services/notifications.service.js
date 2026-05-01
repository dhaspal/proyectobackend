const { Notification } = require("../models/Notification");
const { publishToUser, publishToUsers } = require("./realtime.service");

async function notifyUser({ userId, type, title, message, data }) {
  if (!userId) return null;
  const notification = await Notification.create({
    user: userId,
    type,
    title,
    message,
    data,
    readAt: null,
  });
  publishToUser(userId, "notification.created", {
    notification: {
      ...notification.toJSON(),
      userId: userId.toString(),
      read: false,
    },
  });
  return notification;
}

async function notifyUsers({ userIds, type, title, message, data }) {
  const ids = (userIds || []).filter(Boolean);
  if (ids.length === 0) return [];
  const docs = ids.map((uid) => ({
    user: uid,
    type,
    title,
    message,
    data,
    readAt: null,
  }));
  const notifications = await Notification.insertMany(docs, { ordered: false });
  const notificationsByUser = new Map();
  for (const n of notifications) {
    const uid = n.user?.toString?.();
    if (!uid) continue;
    if (!notificationsByUser.has(uid)) notificationsByUser.set(uid, []);
    notificationsByUser.get(uid).push({
      ...n.toJSON(),
      userId: uid,
      read: false,
    });
  }
  for (const [uid, list] of notificationsByUser.entries()) {
    publishToUsers([uid], "notification.created_many", { notifications: list });
  }
  return notifications;
}

module.exports = { notifyUser, notifyUsers };

