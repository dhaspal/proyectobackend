const { z } = require("zod");

const createNotificationSchema = z.object({
  userId: z.string().min(1),
  type: z.string().min(2).max(80),
  title: z.string().min(2).max(160),
  message: z.string().min(2).max(2000),
  data: z.record(z.unknown()).optional(),
});

const markReadSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

module.exports = { createNotificationSchema, markReadSchema };

