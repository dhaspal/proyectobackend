const mongoose = require("mongoose");
const { APPOINTMENT_STATUS, APPOINTMENT_HISTORY_BUCKET } = require("../constants/appointments");

const appointmentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },

    // Taller puede asignar un mecánico (opcional)
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    // Reparación generada al finalizar (para historial)
    workOrder: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrder", index: true },

    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.REQUESTED,
      index: true,
    },

    // Fecha/hora solicitada por cliente
    requestedAt: { type: Date, required: true, index: true },
    // Fecha/hora final aceptada (cuando se agenda)
    scheduledAt: { type: Date, index: true },
    durationMin: { type: Number, min: 5, max: 8 * 60, default: 60 },

    // Reprogramación propuesta por taller (requiere confirmación cliente)
    proposedAt: { type: Date },

    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    // Mensajes/razones
    workshopNote: { type: String, trim: true },
    clientNote: { type: String, trim: true },

    // Resolución
    completedAt: { type: Date },
    incompleteReason: { type: String, trim: true },

    // Auditoría básica
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

appointmentSchema.virtual("historyBucket").get(function historyBucket() {
  if (this.status === APPOINTMENT_STATUS.COMPLETED) return APPOINTMENT_HISTORY_BUCKET.COMPLETE;
  if (this.status === APPOINTMENT_STATUS.INCOMPLETE) return APPOINTMENT_HISTORY_BUCKET.INCOMPLETE;
  if (this.status === APPOINTMENT_STATUS.REJECTED) return APPOINTMENT_HISTORY_BUCKET.INCOMPLETE;
  if (this.status === APPOINTMENT_STATUS.CANCELLED) return APPOINTMENT_HISTORY_BUCKET.INCOMPLETE;
  return APPOINTMENT_HISTORY_BUCKET.PENDING;
});

appointmentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});
appointmentSchema.set("toObject", { virtuals: true });

const Appointment = mongoose.model("Appointment", appointmentSchema);

module.exports = { Appointment };

