const bannerSchema = require("../../models/bannerSchema.js");
const userSchema = require('../../models/userSchema');
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");

// =============== Get Banner Page ===============
const getBannerPage = async (req, res) => {
  try {
    const limit = 3;
    const Page = parseInt(req.query.page) || 1;
    const isActive = req.query.status || null;

    const filterStatus =
      isActive === "active"
        ? "active"
        : isActive === "inactive"
        ? "inactive"
        : isActive === "upcoming"
        ? "upcoming"
        : isActive === "expired"
        ? "expired"
        : "all";

    const status =
      isActive === "active"
        ? true
        : isActive === "inactive"
        ? false
        : isActive === "upcoming"
        ? "upcoming"
        : isActive === "expired"
        ? "expired"
        : "all";
    let query = {};

    console.log("Status Filter:", status);

    if (status === "upcoming") {
      query = { isActive: true, startDate: { $gt: new Date() } };
    } else if (status === "expired") {
      query = { isActive: true, endDate: { $lt: new Date() } };
    } else if (status === true) {
      query = { isActive: status, endDate: { $gte: new Date() } , startDate: { $lte: new Date() } };
    } else if (status === false) {
      query = { isActive: status };
    } else {
      query = {};
    }

    // Fetch all banners
    const bannerData = await bannerSchema
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((Page - 1) * limit)
      .exec();

    const count = await bannerSchema.countDocuments(query);
    const user = await userSchema.findOne({_id:req.session.adminId});

    res.render("Home/banner", {
      bannerData,
      user,
      filterStatus,
      currentPage: Page,
      totalPages: Math.ceil(count / limit),
      title: "Banner Management",
    });
  } catch (error) {
    console.error("Error loading banner page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

// =============== Add Banner ===============
const addBanner = async (req, res) => {
  try {
    const { title, buttonLink, startDate, endDate, isActive } = req.body;
    const file = req.file;

    if (!title || !startDate || !endDate || !file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Title, image, start date, and end date are required",
      });
    }
    // order
    const lastBanner = await bannerSchema
      .findOne()
      .sort({ order: -1 })
      .limit(1);
    const order = lastBanner ? lastBanner.order + 1 : 1;

    // Create new banner
    const newBanner = new bannerSchema({
      title,
      buttonLink: buttonLink || "",
      image: `/uploads/banners/${file.filename}`,
      order,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive === "true" || isActive === true,
    });

    await newBanner.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Banner added successfully",
      banner: newBanner,
    });
  } catch (error) {
    console.error("Error adding banner:", error);
    fs.unlinkSync(req.file.path); // Clean up uploaded file on error
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error",
    });
  }
};

// 🟡 Update Banner
const updateBanner = async (req, res) => {
  try {
    const { id, order, title, buttonLink, startDate, endDate, isActive } =
      req.body;

    const banner = await bannerSchema.findById(id);

    if (!banner)
      return res
        .status(404)
        .json({ success: false, message: "Banner not found" });

    // If new image uploaded → delete old one
    if (req.file) {
      const oldPath = path.join("public", banner.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      banner.image = `/uploads/banners/${req.file.filename}`;
    }

    banner.title = title;
    banner.buttonLink = buttonLink;
    banner.startDate = startDate;
    banner.endDate = endDate;
    banner.isActive = isActive === "true";
    banner.order = order;

    await banner.save();

    res.json({ success: true, message: "Banner updated successfully" });
  } catch (err) {
    console.error("Error updating banner:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============== Delete Banner ===============
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    const banner = await bannerSchema.findByIdAndDelete(id, { new: true });

    if (!banner) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Banner not found" });
    }

    // Delete image file
    const imagePath = path.join("public", banner.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

// =============== Check Banner Order ===============
const checkBannerOrder = async (req, res) => {
  try {
    const { order, id } = req.body;

    // check order is number or not
    if (isNaN(order)) {
      return res.json({
        success: false,
        message: "Order must be a number.",
      });
    } else if (order <= 0) {
      return res.json({
        success: false,
        message: "Order must be a positive number.",
      });
    }
    // Check if order already exists
    const existingBanner = await bannerSchema.findOne({ order });

    if (existingBanner && existingBanner._id.toString() !== id) {
      return res.json({
        success: false,
        message: "Order number already in use. Please choose a different one.",
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error checking banner order:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Server error while checking order number.",
    });
  }
};

// =============== Check Banner Date Validity ===============
const checkDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (!startDate || !endDate) {
      return res.json({
        valid: false,
        message: "Start and end dates are required",
      });
    }

    if (start >= end) {
      return res.json({
        valid: false,
        message: "End date must be after start date",
      });
    }

    res.json({ valid: true });
  } catch (error) {
    console.error("Check Date Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

module.exports = {
  getBannerPage,
  addBanner,
  deleteBanner,
  updateBanner,
  checkBannerOrder,
  checkDate,
};
