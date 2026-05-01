const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true, index: true },
    basePrice: { type: Number, min: 0, default: 0 },
    durationMin: { type: Number, min: 5, max: 8 * 60, default: 60 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

serviceSchema.index({ name: 1 }, { unique: true });

serviceSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = { Service };

