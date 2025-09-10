const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      totalPrice: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["In Cart", "Saved for Later", "Purchased"],
        default: "In Cart",
      },
      cancellationReason: {
        type: String,
        default: 'none',
      },
      addedOn: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

const Cart = mongoose.model("cart", cartSchema);
module.exports = Cart;
