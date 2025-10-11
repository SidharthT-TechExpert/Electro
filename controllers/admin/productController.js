const variantSchema = require("../../models/variantSchema");
const productSchema = require("../../models/productSchema");
const categorieSchema = require("../../models/categorySchema");
const userSchema = require('../../models/userSchema')
const brandSchema = require("../../models/brandSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const categoryFieldsMap = require("../../helpers/variant");

const updateCategoryProductCounts = async () => {
  try {
    // 🟦 Update category product counts
    const categories = await categorieSchema.find();

    for (const category of categories) {
      const count = await productSchema.countDocuments({
        category: category._id,
      });
      await categorieSchema.updateOne(
        { _id: category._id },
        { $set: { productCount: count } }
      );
      console.log(`✅ Category '${category.name}' count updated: ${count}`);
    }

    // 🟧 Update brand product counts
    const brands = await brandSchema.find();

    for (const brand of brands) {
      const count = await productSchema.countDocuments({ brand: brand._id });
      await brandSchema.updateOne(
        { _id: brand._id },
        { $set: { productCount: count } }
      );
      console.log(`✅ Brand '${brand.name}' count updated: ${count}`);
    }

    console.log("🎉 All category and brand counts updated successfully!");
  } catch (error) {
    console.error("❌ Error updating category/brand product counts:", error);
  }
};

const getProductsPage = async (req, res) => {
  try {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const status = req.query.status || "all";

    const matchStage = {};

    // Status filter
    if (status !== "all") matchStage.status = status;

    // Aggregation pipeline
    const pipeline = [
      // Match status first
      { $match: matchStage },

      // Join category
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" }, // flatten the category array

      // Apply search on name, description, or category.name
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { "category.name": { $regex: search, $options: "i" } }
          ]
        }
      },

      // Sort, paginate
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },

      // Join brand
      {
        $lookup: {
          from: "brands",
          localField: "brand",
          foreignField: "_id",
          as: "brand"
        }
      },
      { $unwind: "$brand" }
    ];

    const products = await productSchema.aggregate(pipeline);

    // Count total documents (for pagination)
    const countPipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category"
        }
      },
      { $unwind: "$category" },
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { "category.name": { $regex: search, $options: "i" } }
          ]
        }
      },
      { $count: "total" }
    ];

    const countResult = await productSchema.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    const categories = await categorieSchema.find({});
    const brands = await brandSchema.find({});
    const user = await userSchema.findOne({ _id: req.session.adminId });

    res.render("Home/products", {
      productData: products,
      categories,
      brands,
      user,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      search,
      status
    });
  } catch (error) {
    console.log("Get Products Page Error:", error);
    res.status(500).send("Server Error");
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
    await updateCategoryProductCounts();

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


const loadProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1️⃣ Fetch product with brand & category populated
    const product = await productSchema
      .findById(id)
      .populate("brand", "name logo")
      .populate("category", "name")
      .exec();

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // 2️⃣ Fetch variants linked to this product
    const variants = await variantSchema.find({ product_id: id }).exec();

    // 4️⃣ Get allowed variant fields based on category
    const variantField = categoryFieldsMap[product.category.name] || [];

    const brands = await brandSchema.find({});
    const categories = await categorieSchema.find({});
    const user = await userSchema.findOne({_id:req.session.adminId})

    // 5️⃣ Render view
    res.render("Home/productsDetails", {
      product,
      brands,
      user,
      categories,
      variants, // all variants for this product
      variantField, // dynamic fields (e.g. ram, size, etc.)
      activePage: "products", // Set active page for sidebar
    });
  } catch (error) {
    console.error("Products Details Page Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const toggleStatus = async (req, res) => {
  try {
    const { id, isBlocked } = req.body;
    const update = await productSchema.findByIdAndUpdate(
      id,
      { $set: { isBlocked } },
      { new: true }
    );

    if (!update) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Product status updated successfully",
      isBlocked: update.isBlocked,
    });
  } catch (error) {
    console.error("Toggle Status Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body;
    const product = await productSchema.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Product not found" });
    }

    await updateCategoryProductCounts();

    res.json({
      success: true,
      message: "Product Deleted successfully",
    });
  } catch (error) {
    console.error("Product Delete Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, status } = req.body;

    const update = await productSchema.findByIdAndUpdate(
      id,
      {
        $set: { name, brand, category, status }
      },
      { new: true }
    );

    if (!update) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    
    await updateCategoryProductCounts();

    res.json({
      success: true,
      message: "Product edited successfully",
      product: update, // send updated product
    });
  } catch (error) {
    console.error("Edit Product Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  getProductsPage,
  addProduct,
  loadProductDetails,
  toggleStatus,
  deleteProduct,
  editProduct,
};
