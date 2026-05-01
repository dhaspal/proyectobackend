const { Notification } = require("../models/Notification");

async function notifyUser({ userId, type, title, message, data }) {
  if (!userId) return null;
  return Notification.create({
    user: userId,
    type,
    title,
    message,
    data,
    readAt: null,
  });
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
  return Notification.insertMany(docs, { ordered: false });
}

module.exports = { notifyUser, notifyUsers };

