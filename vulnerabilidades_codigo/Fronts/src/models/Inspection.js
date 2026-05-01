const mongoose = require("mongoose");

const inspectionItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true }, // ej: "brakes"
    label: { type: String, required: true, trim: true }, // ej: "Frenos"
    status: { type: String, enum: ["OK", "WARN", "FAIL", "NA"], default: "OK" },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const inspectionSchema = new mongoose.Schema(
  {
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", required: true, index: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", index: true },
    workOrder: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrder", index: true },

    inspectedAt: { type: Date, required: true, default: () => new Date(), index: true },
    mileage: { type: Number, min: 0 },

    summary: { type: String, trim: true },
    recommendations: { type: String, trim: true },
    items: { type: [inspectionItemSchema], default: [] },

    attachments: [{ type: String, trim: true }], // urls/paths
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  },
  { timestamps: true }
);

inspectionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

const Inspection = mongoose.model("Inspection", inspectionSchema);

module.exports = { Inspection };

