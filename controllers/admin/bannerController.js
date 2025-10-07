const bannerSchema = require("../../models/bannerSchema.js");
const HTTP_STATUS = require("../../config/statusCodes");
const fs = require("fs");
const path = require("path");


// =============== Get Banner Page ===============
const getBannerPage = async (req, res) => {
  try {
    const limit = 5;
    const currentPage = req.query.page || 1;

    // Fetch all banners
    const bannerData = await bannerSchema
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((currentPage - 1) * limit)
      .exec();

    const count = await bannerSchema.countDocuments();

    res.render("Home/banner", {
      bannerData,
      currentPage,
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
      const lastBanner = await bannerSchema.findOne().sort({ order: -1 }).limit(1);
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
    const { id, title, buttonLink, startDate, endDate, isActive } = req.body;
    const banner = await bannerSchema.findById(id);

    if (!banner)
      return res.status(404).json({ success: false, message: "Banner not found" });

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

    await banner.save();

    res.json({ success: true, message: "Banner updated successfully" });
  } catch (err) {
    console.error("Error updating banner:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =============== Delete Banner ===============

module.exports = {
  getBannerPage,
  addBanner,
  // deleteBanner,
  updateBanner
};
