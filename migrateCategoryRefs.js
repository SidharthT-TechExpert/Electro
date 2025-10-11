// migrateCategoryRefs.js
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Product = require("./models/productSchema");
const Category = require("./models/categorySchema");

(async () => {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    const products = await Product.find();

    for (const product of products) {
      // If product.category is a string (old data)
      if (typeof product.category === "string") {
        const cat = await Category.findOne({ name: product.category });

        if (cat) {
          product.category = cat._id;
          await product.save();
          console.log(`🔄 Updated: ${product.name} → ${cat.name}`);
        } else {
          console.warn(`⚠️ No category found for "${product.category}"`);
        }
      }
    }

    console.log("🎉 Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
})();
