const productSchema = require("../../models/productSchema");
const categorieSchema = require("../../models/categorySchema");
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
    if (status === "active") query.status = "active";
    if (status === "blocked") query.status = "blocked";

    // Fetch paginated categories
    const productData  = await productSchema
      .find(query)
      .sort({ name: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Count for pagination
    const count = await productSchema.countDocuments(query);
    const categories = await categorieSchema.find({});
    res.render("Home/products", {
      productData,
      categories ,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: req.query.search || "",
      status, // ✅ pass to frontend
    });
  } catch (error) {
    console.log("Get Products Page Error :", error);
    res.redirect("/admin/pageNotFound");
  }
};

module.exports = {
  getProductsPage,
};
