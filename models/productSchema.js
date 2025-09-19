const mongoose = require("mongoose");
const { Schema } = mongoose;

// 🔹 Variant schema 
const variantSchema = new mongoose.Schema({
  ram: String,
  storage: String,
  battery: String,
  camera: String,
  screen: String,
  display: String,
  processor: String,
  gpu: String,
  os: String,
  strap: String,
  controllerType: String,
  type: String,
  connectivity: String,
  color: String,
  resolution: String,
  screenSize: String,
  smartFeatures: String,
  channels: String,
  powerOutput: String,
  lens: String,
  flightTime: String,
  range: String,
  colorPrint: String,
  size: String,
  ports: String,
  band: String,
  compatibility: String,
  capacity: String,
  interface: String,
  material: String,

  stock: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  sku: { type: String },
  description: String,
  images: [String] // array of file paths
});


// 🔹 Main Product schema
const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    brand: { type: Schema.Types.ObjectId, ref: "brands", required: true },
    category: { type: Schema.Types.ObjectId, ref: "category", required: true },

    price: { type: Number, required: true }, // base price
    salePrice: { type: Number },
    productOffer: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },

    color: { type: String }, // legacy field, still allowed
    Images: { type: [String] },

    isBlocked: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Not Listed"],
      default: "In Stock",
    },

    // 🔹 Variants
    variants: [variantSchema],
  },
  { timestamps: true }
);

const Product = mongoose.model("product", productSchema);
module.exports = Product;
