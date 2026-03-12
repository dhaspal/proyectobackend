const mongoose = require("mongoose");
const { WORK_ORDER_STATUS } = require("../constants/workOrder");

const workItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, min: 1, default: 1 },
    unitPrice: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const workOrderSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    status: {
      type: String,
      enum: Object.values(WORK_ORDER_STATUS),
      default: WORK_ORDER_STATUS.OPEN,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    problemDescription: { type: String, trim: true },
    diagnosis: { type: String, trim: true },
    clientNotes: { type: String, trim: true },
    internalNotes: { type: String, trim: true },

    // Resultado final para historial del cliente
    repairDescription: { type: String, trim: true },
    cost: { type: Number, min: 0 },
    mileage: { type: Number, min: 0 },

    laborHours: { type: Number, min: 0, default: 0 },
    laborRate: { type: Number, min: 0, default: 0 },
    parts: { type: [workItemSchema], default: [] },

    startedAt: { type: Date },
    finishedAt: { type: Date },
  },
  { timestamps: true }
);

workOrderSchema.virtual("partsTotal").get(function partsTotal() {
  return (this.parts || []).reduce((sum, p) => sum + (p.quantity || 0) * (p.unitPrice || 0), 0);
});

workOrderSchema.virtual("laborTotal").get(function laborTotal() {
  return (this.laborHours || 0) * (this.laborRate || 0);
});

workOrderSchema.virtual("total").get(function total() {
  return this.partsTotal + this.laborTotal;
});

workOrderSchema.set("toJSON", { virtuals: true });
workOrderSchema.set("toObject", { virtuals: true });

workOrderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

const WorkOrder = mongoose.model("WorkOrder", workOrderSchema);

module.exports = { WorkOrder };

