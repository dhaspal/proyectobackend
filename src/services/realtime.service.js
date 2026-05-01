const clientsByUser = new Map();

function writeSse(res, event, data) {
  if (res.writableEnded || res.destroyed) return false;
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
  return true;
}

function addClient(userId, res) {
  const key = String(userId);
  let bucket = clientsByUser.get(key);
  if (!bucket) {
    bucket = new Set();
    clientsByUser.set(key, bucket);
  }
  bucket.add(res);
}

function removeClient(userId, res) {
  const key = String(userId);
  const bucket = clientsByUser.get(key);
  if (!bucket) return;
  bucket.delete(res);
  if (bucket.size === 0) clientsByUser.delete(key);
}

function publishToUser(userId, event, payload) {
  if (!userId) return 0;
  const bucket = clientsByUser.get(String(userId));
  if (!bucket || bucket.size === 0) return 0;
  let sent = 0;
  for (const res of bucket) {
    const ok = writeSse(res, event, payload);
    if (ok) sent += 1;
  }
  return sent;
}

function publishToUsers(userIds, event, payload) {
  let total = 0;
  for (const userId of userIds || []) {
    total += publishToUser(userId, event, payload);
  }
  return total;
}

function startSse(req, res, user) {
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  addClient(user.sub, res);
  writeSse(res, "connected", {
    ok: true,
    userId: user.sub,
    now: new Date().toISOString(),
  });

  const heartbeat = setInterval(() => {
    if (res.writableEnded || res.destroyed) return;
    // Comentario SSE para mantener viva la conexión en proxies intermedios.
    res.write(`: heartbeat ${Date.now()}\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    removeClient(user.sub, res);
  });
}

module.exports = {
  startSse,
  publishToUser,
  publishToUsers,
};
