const mongoose = require("mongoose");
const { Schema } = mongoose;

const variantSchema = new Schema(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Base common fields
    color: { type: String },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    sale_price: { type: Number },
    sku: { type: String, unique: true },
    product_image: [{ type: String }], // Array of image URLs
    quantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["listed", "unlisted"],
      default: "unlisted",
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: null,
    },
    activeDiscountValue: { type: Number, min: 0, default: 0 },

    offer_id: { type: Schema.Types.ObjectId, ref: "Offer" },

    isDeleted: { type: Boolean, default: false },

    /**
     * Dynamic category-specific fields
     * Example: { ram: "8GB", storage: "128GB", battery: "5000mAh" }
     */
    specifications: {
      type: Map,
      of: Schema.Types.Mixed, // allows String/Number/Boolean etc.
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Variants", variantSchema);
