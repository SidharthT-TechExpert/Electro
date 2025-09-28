const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product", // linked to Product collection
      required: true,
    },
    material: { type: String },
    color: { type: String, required: true },
    size: { type: String, enum: ["S", "M", "L"], required: false },
    description: { type: String },

    price: { type: Number, required: true },
    sale_price: { type: Number, required: false },

    sku: { type: String, unique: true },
    product_image: [{ type: String }], // Array of image URLs
    quantity: { type: Number, default: 0 },

    status: { type: String, enum: ["listed", "unlisted"], default: "unlisted" },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: null,
    },
    activeDiscountValue: { type: Number, min: 0, default: 0 },

    offer_id: { type: Schema.Types.ObjectId, ref: "Offer" },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Variant", variantSchema);
