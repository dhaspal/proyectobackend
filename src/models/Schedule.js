const mongoose = require("mongoose");

const scheduleEntrySchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "09:00"
    end: { type: String, required: true }, // "10:30"
    workOrder: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrder" },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle" },
    note: { type: String, trim: true },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true }, // normalizado al inicio del día
    entries: { type: [scheduleEntrySchema], default: [] },
  },
  { timestamps: true }
);

scheduleSchema.index({ mechanic: 1, date: 1 }, { unique: true });

const Schedule = mongoose.model("Schedule", scheduleSchema);

module.exports = { Schedule };

