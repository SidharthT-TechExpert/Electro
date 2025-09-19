const productSchema = require("../../models/productSchema");
const categorieSchema = require("../../models/categorySchema");
const brandSchema = require("../../models/brandSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");


function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getProductsPage = async (req, res) => {
  try {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const search = escapeRegex(req.query.search || "");
    const status = req.query.status || "all";

    // Base query
    let query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    // Apply status filter
    if (status === "In Stock") query.status = "In Stock";
    if (status === "Out of Stock") query.status = "Out of Stock";
    if (status === "Not Listed") query.status = "Not Listed";

    // Fetch paginated categories
    const products = await productSchema
      .find(query)
      .populate("brand", "name logo")
      .populate("category", "name")
      .sort({ createAt: -1 })
      .limit(limit) 
      .skip((page - 1) * limit)
      .exec();

    // Count for pagination
    const count = await productSchema.countDocuments(query);
    const categories = await categorieSchema.find({});
    const brands = await brandSchema.find({});

    res.render("Home/products", {
      productData:products,
      categories,
      brands,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: req.query.search || "",
      status, // ✅ pass to frontend
    });
  } catch (error) {
    console.log("Get Products Page Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const addProduct = async (req, res) => {
  try {
    const { name, brand, category, status, price } = req.body;

    if (!name || !brand || !category || !status || !price) {
      return res.json({
        success: false,
        message: "Product name,logo,category,status & price are required",
      });
    }

    // Fetch paginated categories
    const exist = await productSchema.findOne({ name: name.trim() });

    if (exist) {
      return res.json({
        success: false,
        message: "This Product already exists!",
      });
    }

    const newProduct = new productSchema({
      name,
      brand,
      category,
      status,
      price,
    });

    await newProduct.save();

    res.json({
      success: true,
      message: "Brand created successfully",
      brand: newProduct,
    });
  } catch (error) {
    console.log("Add Product Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};
const categoryFieldsMap = require('../../helpers/variant');

const loadProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch single product with brand & category populated
    const product = await productSchema
      .findById(id)
      .populate("brand", "name logo")
      .populate("category", "name")
      .exec();

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Get categories & brands for dropdowns
    const categories = await categorieSchema.find({});
    const brands = await brandSchema.find({});
    const variantField = categoryFieldsMap[product.category.name];
    // Render product details page
    res.render("Home/productsDetails", {
      variantField,
      product,
      categories,
      brands,
    });
  } catch (error) {
    console.log("Products Details Page Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const addVariants = async (req, res) => {
  try {
    const { id } = req.params;
    const variantData = req.body;
console.log(id)
    // Find product by ID
    const product = await productSchema.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Push new variant into product
    product.variants.push(variantData);

    // Save product with new variant
    await product.save();

    res.json({
      success: true,
      message: "Variant added successfully",
      variant: product.variants[product.variants.length - 1],
    });
  } catch (err) {
    console.error("Error adding variant:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}


module.exports = {
  getProductsPage,
  addProduct,
  loadProductDetails,
  addVariants
};
