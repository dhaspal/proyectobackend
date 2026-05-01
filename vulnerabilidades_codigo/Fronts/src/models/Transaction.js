const mongoose = require("mongoose");
const { TRANSACTION_TYPE } = require("../constants/finance");

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(TRANSACTION_TYPE), required: true, index: true },
    amount: { type: Number, min: 0, required: true },
    currency: { type: String, default: "USD", trim: true },
    category: { type: String, trim: true },
    description: { type: String, trim: true },
    date: { type: Date, required: true, default: () => new Date(), index: true },

    workOrder: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrder", index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mechanic: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }, // dueño lógico (si aplica)
  },
  { timestamps: true }
);

transactionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform(doc, ret) {
    ret.id = ret._id?.toString();
    delete ret._id;
    return ret;
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = { Transaction };

