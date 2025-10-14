const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "products",
          required: true,
        },
        variant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variants",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        added_On: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    total: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
