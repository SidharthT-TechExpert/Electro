const offerSchema = require("../../models/OfferSchema");
const productSchema = require("../../models/productSchema");
const userSchema = require('../../models/userSchema')
const categorieSchema = require("../../models/categorySchema");

const HTTP_STATUS = require("../../config/statusCodes");

// Load Offer Page
const loadOfferPage = async (req, res) => {
  try {
    const limit = 4;
    const page = parseInt(req.query.page) || 1;
    const isActive = req.query.status || true;
    const filter  = req.query.status ;

    const user = await userSchema.findOne({_id:req.session.adminId})

    // Fetch active offers
    const offerData = await offerSchema
      .find({ isActive })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    const count = await offerSchema.countDocuments(isActive);
    const products = await productSchema.find({ status: "In Stock" });
    const categories = await categorieSchema.find({ status: "listed" });

    res.render("Home/offersPage", {
      offerData,
      user,
      filter ,
      products,
      categories,
      title: "Offers Management",
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Load Offer Page Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

// Add Offers
const addOffer = async (req, res) => {
  try {
    const {
      name,
      code,
      discountType,
      discountValue,
      appliesTo,
      targetIds,
      startDate,
      endDate,
      isActive,
      maxAmount,
    } = req.body;

    console.log(req.body);

    // Basic validation
    if (
      !name ||
      !code ||
      !discountType ||
      !discountValue ||
      !appliesTo ||
      !isActive ||
      !startDate ||
      !endDate ||
      !targetIds ||
      targetIds.length === 0 
    ) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    // Check for existing offer code
    const existingOffer = await offerSchema.findOne({ code: code.trim() });

    if (existingOffer) {
      return res.json({ success: false, message: "Offer code already exists" });
    }
    // Validate discount value
    if (
      discountType === "Percentage" &&
      (discountValue < 1 || discountValue > 100)
    ) {
      return res.json({
        success: false,
        message: "Percentage discount must be between 1 and 100",
      });
    }

    // Validate discount value
    if (discountType === "Fixed" && discountValue <= 0) {
      return res.json({
        success: false,
        message: "Fixed discount must be greater than 0",
      });
    }

    // Validate date range
    if (new Date(startDate) >= new Date(endDate)) {
      return res.json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // Create new offer
    const newOffer = new offerSchema({
      name,
      code,
      discountType,
      discountValue,
      appliesTo,
      targetIds,
      startDate,
      endDate,
      isActive,
      maxAmount,
    });

    console.log(newOffer);

    await newOffer.save();

    res.json({
      success: true,
      message: "Offer created successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Add Offer Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

// Edit Offer
const editOffer = async (req, res) => {
  try {
    const {
      id,
      name,
      code,
      discountType,
      discountValue,
      appliesTo,
      targetIds,
      startDate,
      endDate,
      isActive,
      maxAmount,
    } = req.body;
    if (!id) {
      return res.json({ success: false, message: "Offer ID is required" });
    }
    const offer = await offerSchema.findById(id);

    if (!offer) {
      return res.json({ success: false, message: "Offer not found" });
    }
    // Check for existing offer code if it's being changed
    if (code && code.trim() !== offer.code) {
      const existingOffer = await offerSchema.findOne({ code: code.trim() });

      if (existingOffer) {
        return res.json({
          success: false,
          message: "Offer code already exists",
        });
      }

      offer.code = code.trim();
    }

    const update = await offerSchema.findByIdAndUpdate(
      id,
      {
        name,
        code,
        discountType,
        discountValue,
        appliesTo,
        targetIds,
        startDate,
        endDate,
        isActive,
        maxAmount,
      },
      { new: true }
    );

    if (!update) {
      return res.json({ success: false, message: "Offer not found" });
    }

    res.json({
      success: true,
      message: "Offer updated successfully",
      offer: update,
    });

  } catch (error) {
    console.error("Edit Offer Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

//Delete Offer
const deleteOffer = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.json({
        success: false,
        message: "Offer ID is required",
      });
    }

    const deletedOffer = await offerSchema.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res.json({
        success: false,
        message: "Offer not found",
      });
    }

    res.json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Delete Offer Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

//Validation Functions Start Here
// Check Offer Code Uniqueness
const checkOfferCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.json({ isUnique: false });
    }

    newCode = code.trim().toUpperCase();
    const existingOffer = await offerSchema.findOne({ code: code.trim() });
    console.log(existingOffer, code.trim().toUpperCase());

    if (existingOffer) {
      return res.json({ isUnique: true });
    } else {
      return res.json({ isUnique: false });
    }
  } catch (error) {
    console.error("Check Offer Code Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

// Check Date Validity
const checkDate = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.json({
        valid: false,
        message: "Start and end dates are required",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.json({
        valid: false,
        message: "End date must be after start date",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time from today's date

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0); // Remove time from startDate

    if (start < today) {
      return res.json({
        valid: false,
        message: "Start date must be today or in the future",
      });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error("Check Date Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

// Check Discount Validity
const checkDiscount = async (req, res) => {
  try {
    const { discountType, discountValue, maxAmount } = req.body;

    if (!discountType || !discountValue) {
      return res.json({
        valid: false,
        message: "Discount type and value are required",
      });
    }
    if (discountType === "Percentage") {
      if (discountValue < 1 || discountValue > 100) {
        return res.json({
          valid: false,
          message: "Percentage discount must be between 1 and 100",
        });
      }

      if (maxAmount <= 0) {
        return res.json({
          valid: false,
          message: "Maximum discount amount must be greater than 0",
        });
      }
    }

    if (discountType === "Fixed" && discountValue <= 0) {
      return res.json({
        valid: false,
        message: "Fixed discount must be greater than 0",
      });
    }

    return res.json({ valid: true });
  } catch (error) {
    console.error("Check Discount Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: "Server Error" });
  }
};

module.exports = {
  loadOfferPage,
  addOffer,
  checkOfferCode,
  checkDate,
  checkDiscount,
  deleteOffer,
  editOffer,
};
