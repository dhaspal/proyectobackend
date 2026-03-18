const mongoose = require("mongoose");
const { ROLES } = require("../constants/roles");
const { hashPassword } = require("../utils/password");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    // Preferido: fecha de nacimiento. age queda por compatibilidad (front/back existentes)
    dateOfBirth: { type: Date },
    age: { type: Number, min: 0, max: 120 },
    username: { type: String, required: true, lowercase: true, trim: true },
    // Para cuentas Google puede ser null/undefined
    passwordHash: { type: String },
    // authProviders Google eliminado (no se usa)
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

userSchema.index({ username: 1 }, { unique: true });

userSchema.methods.setPassword = async function setPassword(plain) {
  this.passwordHash = await hashPassword(plain);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const derivedFirstName =
    this.firstName ||
    (this.name ? String(this.name).trim().split(/\s+/).slice(0, 1).join(" ") : undefined);
  const derivedLastName =
    this.lastName ||
    (this.name ? String(this.name).trim().split(/\s+/).slice(1).join(" ") : undefined);

  const dob = this.dateOfBirth instanceof Date && !Number.isNaN(this.dateOfBirth.getTime())
    ? this.dateOfBirth
    : null;
  const derivedAge =
    this.age ??
    (dob
      ? Math.max(
          0,
          Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        )
      : undefined);

  return {
    id: this._id.toString(),
    name: this.name,
    firstName: derivedFirstName,
    lastName: derivedLastName,
    dateOfBirth: dob ? dob.toISOString() : undefined,
    age: derivedAge,
    username: this.username,
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
