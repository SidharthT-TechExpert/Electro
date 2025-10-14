const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const mongoose = require("mongoose");
require("dotenv").config();
const HTTP_STATUS = require("../../config/statusCodes.js");
const userSchema = require("../../models/userSchema.js");
const fs = require("fs");
const { GridFSBucket, ObjectId } = require("mongodb");
const { IncomingForm } = require("formidable");
const User = require("../../models/userSchema.js");

// Initialize GridFS after DB connection
let gfs;
mongoose.connection.once("open", () => {
  gfs = new GridFSBucket(mongoose.connection.db, {
    bucketName: "profilePhotos",
  });
  console.log("✅ GridFS initialized for profile photos");
});

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

// OTP Generater
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email through OTP Send
const sendVerificationEmail = async (email, OTP) => {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail", // or "hotmail", "yahoo", etc.
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    // ✅ Verify connection before sending
    await transport.verify();
    console.log("✅ SMTP server verified. Ready to send emails.");

    // ✅ Email content (both plain text & HTML)
    const mailOptions = {
      from: `"Electro Verification" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "Your Electro verification code",
      text: `Hi,

Your OTP code is ${OTP}. 
It’s valid for 10 minutes.

If you didn’t request this, just ignore this message.

– The Electro Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 15px;
                    border: 1px solid #e0e0e0; border-radius: 8px; background: #ffffff;">
          <p style="font-size: 16px;">Hi,</p>
          <p style="font-size: 15px;">Your <strong>Electro verification code</strong> is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #2b2b2b;">${OTP}</p>
          <p style="font-size: 14px;">This code is valid for <strong>10 minutes</strong>.</p>
          <p style="font-size: 13px; color: #555;">
            If you didn’t request this, please ignore this email.
          </p>
          <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
          <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} Electro. All rights reserved.</p>
        </div>
      `,
      headers: {
        "X-Mailer": "ElectroMailer",
        "List-Unsubscribe": "<mailto:support@electroshop.com>",
      },
    };

    // ✅ Send email
    const info = await transport.sendMail(mailOptions);

    console.log(`📩 OTP email sent to ${email}: ${info.response}`);
    return info.accepted.length > 0;
  } catch (error) {
    console.error("❌ sendVerificationEmail Error:", error);
    return false;
  }
};

// Check user session and fetch user
const checkSession = async (_id) => {
  if (!_id) return null;

  const objectId = new mongoose.Types.ObjectId(_id);

  const result = await userSchema.aggregate([
    { $match: { _id: objectId } },
    {
      $lookup: {
        from: "wishlists", // collection name in MongoDB
        localField: "_id", // field in userSchema
        foreignField: "userId", // field in wishlistSchema
        as: "wishlists", // the array field to store results
      },
    },
    {
      $lookup: {
        from: "carts", // collection name in MongoDB
        localField: "_id", // field in userSchema
        foreignField: "userId", // field in wishlistSchema
        as: "cart", // the array field to store results
      },
    },
    { $unwind: { path: "$cart", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$wishlists", preserveNullAndEmptyArrays: true } },
  ]);

  return result.length ? result[0] : null;
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
const MY_Profile = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);
    const page = "profile";

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).send("User not logged in");
    }

    res.status(HTTP_STATUS.OK).render("home/myProfile", {
      user,
      page,
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
    const { id, name } = req.body;

    // Validate inputs
    if (!id || !name || name.trim().length < 3) {
      return res.json({ success: false, message: "Invalid user ID or name" });
    }

    // Check if user exists
    const user = await userSchema.findById(id);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Update name
    user.name = name.trim();
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Name updated successfully" });
  } catch (error) {
    console.error("Error updating name:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

    const otp = generateOtp();
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

// 📧 Send Email OTP
const send_Email_otp = async (req, res) => {
  try {
    const { email, id } = req.body;

    // ✅ Validate input
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    // ✅ Check if email already exists for a different user
    const user = await userSchema.findOne({ email });
    if (user && user._id.toString() != id) {
      return res.json({
        success: false,
        message: "Email is already registered with another account",
      });
    }

    // ✅ Generate OTP
    const OTP = generateOtp();
    console.log(`Generated OTP for ${email}: ${OTP}`);

    // ✅ Send email using your mailer function
    const emailSent = await sendVerificationEmail(email, OTP);
    if (!emailSent) {
      return res.json({
        success: false,
        message: "Failed to send verification email. Please try again.",
      });
    }

    // ✅ Store OTP and email in session
    req.session.userOtp = OTP;
    req.session.email = email;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.json({
          success: false,
          message: "Session error while saving OTP",
        });
      }

      console.log("✅ OTP saved in session:", OTP);
      res.json({ success: true, message: "OTP sent to your email" });
    });
  } catch (error) {
    console.error("❌ send_Email_otp Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

// Verify OTP and update phone
const verify_Email_Otp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const userId = req.session.userId;

    if (!email || !otp) {
      return res.json({ success: false, message: "Missing email or OTP" });
    }

    // ✅ Validate OTP from session
    const storedOtp = req.session.userOtp;

    if (!storedOtp || parseInt(otp) !== parseInt(storedOtp)) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // ✅ Clear OTP session
    req.session.userOtp = null;
    req.session.email = null;

    // ✅ Update user’s email
    await userSchema.findByIdAndUpdate(userId, { email });

    res.json({ success: true, message: "Email updated successfully" });
  } catch (error) {
    console.error("❌ verifyEmail_OTP Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

// Upload profile photo
const upload_Profile_photo = (req, res) => {
  if (!gfs)
    return res
      .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
      .json({ success: false, message: "Server not ready" });

  const form = new IncomingForm({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Upload error",
      });

    const file = Array.isArray(files.profilePhoto)
      ? files.profilePhoto[0]
      : files.profilePhoto;

    if (!file || !file.filepath) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "No file uploaded" });
    }

    // ✅ Check if uploaded file is an image
    if (!file.mimetype.startsWith("image/")) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Only image files are allowed",
      });
    }

    try {
      // 1️⃣ Find existing profile photo
      const user = await userSchema.findById(req.session.userId);
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .json({ success: false, message: "User not found" });
      }

      if (user.profilePhoto) {
        // 2️⃣ Delete old file from GridFS
        gfs.delete(user.profilePhoto, (err) => {
          if (err) console.error("Failed to delete old profile photo:", err);
        });
      }

      // 3️⃣ Upload new photo
      const readStream = fs.createReadStream(file.filepath);
      const uploadStream = gfs.openUploadStream(
        `profile_${req.session.userId}_${Date.now()}`,
        { contentType: file.mimetype }
      );

      readStream
        .pipe(uploadStream)
        .on("error", () =>
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Upload failed" })
        )
        .on("finish", async () => {
          // 4️⃣ Save new fileId to user profile
          user.profilePhoto = uploadStream.id;
          await user.save();

          res.json({
            success: true,
            message: "Profile photo uploaded!",
            fileId: uploadStream.id,
          });
        });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: "Server error" });
    }
  });
};

// Download profile photo
const Profile_photo = async (req, res) => {
  try {
    if (!gfs) return res.status(503).send("Server not ready. Try again later.");

    const fileId = new ObjectId(req.params.id);
    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on("error", () => {
      res.status(404).send("File not found");
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};

module.exports = {
  MY_Profile,
  UpdateName,
  updatePass,
  send_otp,
  verify_Otp,
  send_Email_otp,
  verify_Email_Otp,
  Profile_photo,
  upload_Profile_photo,
};
