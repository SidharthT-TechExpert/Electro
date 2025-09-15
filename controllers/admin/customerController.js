const HTTP_STATUS = require("../../config/statusCodes");
const userSchema = require("../../models/userSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const checkSession = async (_id) => {
  return _id ? await userSchema.findById(_id) : null;
};

function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const customer = async (req, res) => {
  try {
    const limit = 10;
    const page = parseInt(req.query.page) || 1;
    const search = escapeRegex(req.query.search) || "";

    const query = {
      isAdmin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    };

    // Fetch paginated customers
    const customers = await userSchema
      .find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    // Count total documents for pagination
    const count = await userSchema.countDocuments(query);

    res.render("Home/customersList", {
      customers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search,
    });
  } catch (error) {
    console.error(error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

const customerBlock = async (req, res) => {
  try {
    const { _id, isBlocked } = req.query;
   const user = await userSchema.findByIdAndUpdate(
      { _id },
      { $set: { isBlocked: isBlocked === "true" } }
    );

     if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: user.isBlocked ? "User blocked" : "User unblocked",
      isBlocked: user.isBlocked,
    });

    user.save();
  } catch (error) {
    console.error("Customer Block Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Server Error");
  }
};

module.exports = {
  customer,
  customerBlock,
};
