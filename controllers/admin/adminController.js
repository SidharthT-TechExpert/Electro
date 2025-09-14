const HTTP_STATUS = require("../../config/statusCodes");
const userSchema = require("../../models/userSchema");
const env = require("dotenv").config();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const loadLogin = async (req, res) => {
  try {
    res.render("adminAuth/login");
  } catch (error) {}
};

// Forget Password Page Loader
const loadForgetPage = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).render("adminAuth/forgetpass");
  } catch (error) {
    console.error("Error loading forget password page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

const loadDashBoardPage = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).render("Home/dashboard", {
      user: "Sidharth",
      activePage: "dashboard",
      pageTitle: "Dashboard",
      brandInitial :'Brand',
      brandName :"Electro"
    });
  } catch (error) {
    console.error("Error loading forget password page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// OTP Generater
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email through OTP Send
const sendVerificationEmail = async (email, OTP) => {
  try {
    // Create reusable transporter
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD, // <-- App Password here
      },
    });

    // Verify SMTP connection before sending
    transport.verify((error, success) => {
      if (error) {
        console.error("SMTP Error:", error);
        console.log(
          process.env.NODEMAILER_EMAIL,
          process.env.NODEMAILER_PASSWORD
        );
      } else {
        console.log("✅ Server is ready to take messages");
      }
    });

    console.log("✅ SMTP Server is ready to take messages");

    // Email content
    const mailOptions = {
      from: `"Electro Support ⚡" <${process.env.NODEMAILER_EMAIL}>`,
      to: email,
      subject: "🔐 Verify Your Account - Electro",
      text: `Your OTP is ${OTP}. It will expire in 10 minutes.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;
                    border:1px solid #ddd;border-radius:8px;background:#f9f9f9;">
          <h2 style="color:#4caf50;">Welcome to Electro ⚡</h2>
          <p>We received a request to verify your account.</p>
          <p style="font-size:18px;">Your OTP is:</p>
          <h1 style="color:#333;letter-spacing:3px;">${OTP}</h1>
          <p>This OTP will expire in <b>10 minutes</b>.</p>
          <hr style="margin:20px 0;">
          <small>If you didn’t request this, you can safely ignore this email.</small>
        </div>
      `,
    };

    // Send email
    const info = await transport.sendMail(mailOptions);

    console.log(`📩 Email sent to ${email}: ${info.response}`);
    return info.accepted.length > 0;
  } catch (error) {
    console.error("sendVerificationEmail Error:", error);
    return false;
  }
};

// Forget password - send OTP
const forgetPass = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Admin not found.",
      });
    }

    if (!user.isAdmin) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        isAdmin: false,
        message: "Unauthorized access.",
      });
    }

    const OTP = generateOtp();
    const emailSend = await sendVerificationEmail(email, OTP);

    if (!emailSend) {
      return res.json({
        success: false,
        message: "Failed to send email. Try again.",
      });
    }

    req.session.adminOTP = OTP;
    req.session.adminEmail = email;

    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.json({ success: false, message: "Session error" });
      }
      console.log("OTP generated:", OTP);
      res.json({ success: true, message: "OTP sent to your email" });
    });
  } catch (error) {
    console.error("ForgetPass Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

// OTP Verify forgetPass
const OTP_Verify = async (req, res) => {
  try {
    const { otp } = req.body;

    // If session expired
    if (!req.session.adminOTP || !req.session.adminEmail) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: "⏳ Session expired. Please try again later.",
      });
    }

    if (otp == req.session.adminOTP) {
      return res.json({
        success: true,
        message: "✅ OTP Verified Successfully",
      });
    }

    return res.json({
      success: false,
      message: "❌ Invalid OTP. Please try again.",
    });
  } catch (error) {
    console.error("OTP Validating Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

// Resend OTP
const resend_Otp = async (req, res) => {
  try {
    const email = req.session.adminEmail;
    console.log(email);

    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Email not found in session!" });
    }

    const admin = await userSchema.findOne({ email });

    if (!admin.isAdmin) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        isAdmin: false,
        message: "Unauthorized access.",
      });
    }
    const OTP = generateOtp();
    req.session.adminOTP = OTP;

    const emailSend = await sendVerificationEmail(email, OTP);

    if (emailSend) {
      console.log("Resend OTP :", OTP);
      return res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: "OTP Resend Successfully" });
    } else {
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to resend OTP , Please Try Again!",
      });
    }
  } catch (error) {
    console.log("Resending OTP Error :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error , Please Try Again!",
    });
  }
};

//password convert to hashed formate
const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log("Secure password Generating Error :", error);
  }
};

//Update Password
const updatePass = async (req, res) => {
  try {
    const { password, cPassword } = req.body;
    const email = req.session.adminEmail;
    console.log(password, cPassword, email);
    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Session expired. Please retry." });
    }

    if (password != cPassword) {
      return res
        .status(HTTP_STATUS.CONFLICT)
        .json({ success: false, message: "Password Missmatch!" });
    }
    // Hash the new password
    const hashPass = await securePassword(password);

    // Update the user
    const user = await userSchema.findOneAndUpdate(
      { email },
      { $set: { password: hashPass } },
      { new: true } // return updated document
    );

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Admin not found" });
    }

    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Login verification step
const userLogIn = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user with password field
    const user = await userSchema.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "Admin not found!" });
    }

    if (!user.isAdmin) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        isAdmin: false,
        message: "Unauthorized access.",
      });
    }

    if (!user.password) {
      if (user.googleId) {
        return res.json({
          success: false,
          authType: "google",
          message:
            "You signed up with Google. Please continue with Google login.",
        });
      }
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Handle rememberMe with session cookie
    if (rememberMe === "true") {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 1 day
    } else {
      req.session.cookie.expires = false; // expires on browser close
    }

    req.session.adminId = user._id;
    req.session.adminOTP = "";
    req.session.adminEmail = "";

    return res
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "Login successful" });

  } catch (error) {
    console.log("user Login verification Error :", error);

    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error, Please Try Again!",
    });
  }
};

// Admin LogOut 
const logOut = async (req, res) => {
  try {
    console.log('LogOut!');
    req.session.adminId = null 
    res.redirect('/admin');
  } catch (error) {
    console.log("Logout Error :", error);
    req.flash("error_msg", "Internal Server Error , please try again later !");
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).redirect("/pageNotFound");
  }
};

module.exports = {
  loadLogin,
  loadForgetPage,
  forgetPass,
  OTP_Verify,
  resend_Otp,
  updatePass,
  userLogIn,
  loadDashBoardPage,
  logOut,
};
