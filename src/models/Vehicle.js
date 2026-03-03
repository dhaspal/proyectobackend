const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    plate: { type: String, trim: true, uppercase: true, index: true },
    vin: { type: String, trim: true, uppercase: true, index: true },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, min: 1900, max: 2100 },
    color: { type: String, trim: true },

    mileage: { type: Number, min: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

vehicleSchema.index(
  { owner: 1, plate: 1 },
  { unique: false }
);

const Vehicle = mongoose.model("Vehicle", vehicleSchema);

module.exports = { Vehicle };

