const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    brand: { type: Schema.Types.ObjectId, ref: "brands", required: true },
    category: { type: Schema.Types.ObjectId, ref: "category", required: true },

    // Base product-level pricing/stock
    price: { type: Number, required: true },
    salePrice: { type: Number },
    productOffer: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },

    color: { type: String }, // legacy field
    Images: { type: [String] },

    isBlocked: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Not Listed"],
      default: "In Stock",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Products", productSchema);
