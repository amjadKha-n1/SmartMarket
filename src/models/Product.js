const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "seller",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
    },
    description: { type: String, default: "" },
    price: { type: Number, default: 0 },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: { type: [String], default: null },
    isDeleted: { type: Boolean, required: true },
    isActive: { type: Boolean, required: true },
    isApproved: { type: Boolean, required: true },
    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
