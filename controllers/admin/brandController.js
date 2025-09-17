const brandSchema = require("../../models/brandSchema");
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getBranchPage = async (req, res) => {
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
    const brandData = await brandSchema
      .find(query)
      .sort({ name: 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Count for pagination
    const count = await brandSchema.countDocuments(query);

    res.render("Home/brand", {
      brandData,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: req.query.search || "",
      status, // ✅ pass to frontend
    });
  } catch (error) {
    console.log("Get Branch Page Error :", error);
    res.redirect("/admin/pageNotFound");
  }
};

const addBrands = async (req, res) => {
  try {
    const { name } = req.body;
    const logo = req.file;

    if (!name || !logo) {
      // ❌ delete the uploaded file since it's not needed
      fs.unlinkSync(
        path.join(__dirname, "../public/uploads/brands", logo.filename)
      );

      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Brand name and logo are required",
      });
    }

    // Fetch paginated categories
    const exist = await brandSchema.findOne({ name: name.trim() });
    if (exist) {
      fs.unlinkSync(
        path.join(__dirname, "../public/uploads/brands", logo.filename)
      );
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Brand already exists!",
      });
    }

    // ✅ Create new brand
    const newBrand = new brandSchema({
      name: name.trim(),
      logo: `/uploads/brands/${logo.filename}`,
    });

    await newBrand.save();

    res.json({
      success: true,
      message: "Brand created successfully",
      brand: newBrand,
    });
  } catch (error) {
    console.log("Get Branch Page Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server Error while adding brand",
    });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;

    const brand = await brandSchema.findByIdAndDelete(id);
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    // brand.logo looks like "/uploads/brands/filename.png"
    const filePath = path.join(__dirname, "../../public", brand.logo);

    // delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: "Brand deleted successfully!",
      id,
    });
  } catch (error) {
    console.error("Delete Brand Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const Ablock = async (req, res) => {
  try {
    const { id , status } = req.body;
    
    const update = await brandSchema.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!update) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Brand not found" });
    }

    res.json({
      success: true,
      message: `Brand ${status} successfully!`,
      status: update.status,
    });

  } catch (error) {
    console.error("Customer Block Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

module.exports = {
  getBranchPage,
  addBrands,
  deleteBrand,
  Ablock,
};
