const HTTP_STATUS = require("../../config/statusCodes");
const categorieSchema = require("../../models/categorySchema");
const userSchema = require('../../models/userSchema');

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const categories = async (req, res) => {
  try {
    const limit = 6;
    const page = parseInt(req.query.page) || 1;
    const search = escapeRegex(req.query.search || "");
    const status = req.query.status || "all";

    const user = await userSchema.findOne({_id:req.session.adminId});

    // Base query
    let query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ],
    };

    // Apply status filter
    if (status === "listed") query.status = "listed";
    if (status === "unlisted") query.status = "unlisted";

    // Fetch paginated categories
    const categories = await categorieSchema
      .find(query)
      .sort({ name: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Count for pagination
    const count = await categorieSchema.countDocuments(query);
    
    res.render("Home/category", {
      categories,
      user,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: req.query.search || "",
      status, // ✅ pass to frontend
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const unList = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const update = await categorieSchema.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!update) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Category not found" });
    }

    res.json({
      success: true,
      message: `Category ${status} successfully!`,
      status: update.status,
    });
  } catch (error) {
    console.error("Customer Block Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const addCategorie = async (req, res) => {
  try {
    const { name, description } = req.body;
    const exist = categorieSchema.findOne({ name });

    if (!name || !description) {
      return res.json({ success: false, message: "All fields are required" });
    }

    // Check if category already exists
    const exists = await categorieSchema.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (exists) {
      return res.json({ success: false, message: "Category already exists!" });
    }

    const newCategory = new categorieSchema({
      name,
      description,
    });

    await newCategory.save();

    res.json({ success: true, message: "Category added successfully!" });
  } catch (error) {
    console.error("Customer Block Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await categorieSchema.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully!",
      id,
    });
  } catch (error) {
    console.error("Delete Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category already exists
    const exists = await categorieSchema.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });

    if (exists) {
      return res.json({ success: false, message: "Category already exists!" });
    }

    const update = await categorieSchema.findByIdAndUpdate(
      id,
      { $set: { name, description } },
      { new: true, runValidators: true } // return updated doc + validate
    );

    if (!update) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category updated successfully!",
      category: update,
    });
  } catch (error) {
    console.error("Update Category Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  categories,
  addCategorie,
  unList,
  deleteCategorie,
  updateCategory,
};
