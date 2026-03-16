const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, trim: true, index: true }, // ej: APPOINTMENT_ACCEPTED
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    data: { type: Object }, // { entityType, entityId, ... }
    readAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = { Notification };

