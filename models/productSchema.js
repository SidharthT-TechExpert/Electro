const mongoose = require("mongoose");
const { Schema } = mongoose;

// 🔹 Variant schema for electronics
const variantSchema = new Schema({
  color: { type: String },
  sku: { type: String },  // unique identifier
  stock: { type: Number, default: 0 },
  price: { type: Number },

  // Device-specific attributes
  storage: { type: String },       // e.g. "128GB", "1TB"
  ram: { type: String },           // e.g. "8GB", "16GB DDR5"
  processor: { type: String },     // e.g. "Intel i7", "Snapdragon 8 Gen 2"
  screenSize: { type: String },    // e.g. "15.6 inch", "6.7 inch"
  battery: { type: String },       // e.g. "5000mAh", "60Wh"
  warranty: { type: String },      // e.g. "1 Year", "2 Years"
  modelNumber: { type: String },
  features: [String],              // e.g. ["Bluetooth 5.0", "WiFi 6"]

  image: { type: String, default: "/images/product-placeholder.png" }
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
