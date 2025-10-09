const bcrypt = require("bcrypt");
const HTTP_STATUS = require("../../config/statusCodes");
const userSchema = require("../../models/userSchema.js");
require("dotenv").config();
const twilio = require("twilio");

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Send OTP using Twilio
async function sendOTP(phone, otp) {
  try {
    const message = await client.messages.create({
      body: `Your verification code is ${otp}`,
      from: process.env.TWILIO_PHONE,
      to: `+91${phone}`, // Indian numbers start with +91
    });
    console.log("OTP sent:", message.sid);
    return true;
  } catch (err) {
    console.error("Twilio error:", err);
    return false;
  }
}

// Check user session and fetch user
const checkSession = async (id) => {
  try {
    return id ? await userSchema.findById(id) : null;
  } catch (error) {
    console.error("Session check error:", error);
    return null;
  }
};

// Hash password
const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error;
  }
};

// Get profile page
const Profile = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send("User not logged in");
    }

    res.status(HTTP_STATUS.OK).render("home/myProfile", {
      user,
      cartCount: req.cartCount || null,
    });
  } catch (error) {
    console.error("Error loading profile page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// Update Name
const UpdateName = async (req, res) => {
  try {
    const id = req.session.userId;
    const { name } = req.body;

    if (!id) {
      return res.json({ success: false, message: "Session expired." });
    }

    const update = await userSchema.findByIdAndUpdate(id, { name });
    if (!update) {
      return res.json({ success: false, message: "User not found!" });
    }

    res.json({ success: true, message: "Name updated successfully" });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update Password
const updatePass = async (req, res) => {
  try {
    const { newPassword, cPassword } = req.body;
    const id = req.session.userId;

    if (!id) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Session expired. Please retry." });
    }

    const user = await userSchema.findById(id);
    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(cPassword, user.password);
    if (!isMatch) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ success: false, message: "Current password is incorrect." });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    const hashPass = await securePassword(newPassword);
    user.password = hashPass;
    await user.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

// Send OTP
const send_otp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.json({ success: false, message: "Phone number required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
    console.log(`OTP for ${phone}: ${otp}`);

    const sent = await sendOTP(phone, otp);
    if (!sent) {
      return res.json({ success: false, message: "Failed to send OTP" });
    }

    req.session.otp = otp;
    req.session.otpPhone = phone;

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Verify OTP and update phone
const verify_Otp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.json({ success: false, message: "Missing data" });
    }

    const storedOtp = req.session.otp;
    const storedPhone = req.session.otpPhone;

    if (storedOtp && storedPhone === phone && parseInt(otp) === storedOtp) {
      // Clear session OTP
      req.session.otp = null;
      req.session.otpPhone = null;

      const id = req.session.userId;
      if (!id) {
        return res.json({ success: false, message: "Session expired" });
      }

      const updated = await userSchema.findByIdAndUpdate(id, { phone });
      if (!updated) {
        return res.json({ success: false, message: "User not found" });
      }

      return res.json({ success: true, message: "Phone updated successfully" });
    }

    res.json({ success: false, message: "Invalid or expired OTP" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  Profile,
  UpdateName,
  updatePass,
  send_otp,
  verify_Otp,
};
