const mongoose = require("mongoose");
const { ROLES } = require("../constants/roles");
const { hashPassword } = require("../utils/password");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.CLIENT,
    },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },

    // Datos de taller/cliente (opcionales)
    mechanicProfile: {
      hourlyRate: { type: Number, min: 0 },
      specialties: [{ type: String, trim: true }],
    },
    clientProfile: {
      address: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await hashPassword(plain);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    isActive: this.isActive,
    mechanicProfile: this.mechanicProfile,
    clientProfile: this.clientProfile,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
