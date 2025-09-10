const mongoose = require("mongoose");
const { Schema } = mongoose;

const couponSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  createdOn: {
    type: Date,
    default: Date.now,
    required: true,
  },
  expireOn: {
    type: Date,
    required: true,
  },
  discountType: {
    type: String,
    enum: ["Percentage", "Fixed Amount"],
    required: true,
  },
  offerPrice: {
    type: Number,
    required: true,
  },
  minmumPrice: {
    type: Number,
    required: true,
  },
  maxDiscountAmount: {
    type: Number,
    required: function () {
      return this.discountType === "Percentage";
    },
    default: function () {
      return this.discountType === "Percentage" ? 0 : null;
    },
  },
  usageLimit: {
    type: Number,
    required: true,
    default: 1,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  userId: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Coupon = mongoose.model("coupon", couponSchema);
module.exports = Coupon;
