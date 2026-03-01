const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeDescription: {
      type: String,
      default: "",
    },
    storeLogo: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
    },
    CommisionRate: {
      type: Number,
      default: 10,
    },
    totalSales: {
      type: Number,
      default: 0,
    },
    ratingAverage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("seller", sellerSchema);
