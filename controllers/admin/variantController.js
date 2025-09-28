const productSchema = require("../../models/productSchema");
const variantSchema = require('../../models/variantSchema')
const categorieSchema = require("../../models/categorySchema");
const brandSchema = require("../../models/brandSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");


const addVariants = async (req, res) => {
  try {
    const { id } = req.params;      // product ID
    const variantData = req.body;    // data from form

    // 1️⃣ Find product by ID
    const product = await productSchema.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
   const existSku = await variantSchema.findOne({sku:variantData.sku});
   
   if(existSku){
    return res
      .status(404)
      .json({ success: false, message: "This SKU already exists , Please enter a unique SKU" });
   }
   
    // 2️⃣ Create new variant linked to this product
    const newVariant = new variantSchema({
       product_id : product._id,
      ...variantData
    });

    await newVariant.save();

    // 3️⃣ Return success response
    res.json({
      success: true,
      message: "Variant added successfully",
      variant: newVariant
    });

  } catch (err) {
    console.error("Error adding variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  addVariants,
};
