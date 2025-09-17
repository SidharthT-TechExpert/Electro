const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    brand: {
      type: Schema.Types.ObjectId,
      ref:'brands',
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock:{
      type:Number,
      require:false,
      default:0
    },
    salePrice: {
      type: Number,
      required: false,
    },
    productOffer: {
      type: Number,
      default: 0,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    color: {
      type: String,
      required: false,
    },
    Images: {
      type: [String],
      required: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Not Listed"],
      required: true,
      default: "In Stock",
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);
module.exports = Product;
