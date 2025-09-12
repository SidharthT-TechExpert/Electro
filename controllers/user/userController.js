const HTTP_STATUS = require("../../config/statusCodes.js");
const userSchema = require("../../models/userSchema.js");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bcrypt = require("bcrypt");

// Home page Loader
const loadHomePage = async (req, res) => {
  try {
    res
      .status(HTTP_STATUS.OK)
      .render("auth/home", { user: req?.user, cartCount: req.cartCount || 2 });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// 404 Page Not Found
const pageNotFound = async (req, res) => {
  try {
    res.status(HTTP_STATUS.NOT_FOUND).render("auth/page-404", {
      user: req.user || { name: "Guest" },
      cartCount: req.cartCount || 2,
    });
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).redirect("/pageNotFound");
  }
};

// Sign Up Page Loader
const loadSignUpPage = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).render("auth/signUp", {
      user: req?.user || null,
      cartCount: req?.cartCount || 2,
    });
  } catch (error) {
    console.error("Error loading sign-up page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// Log In Page Loader
const loadLogInPage = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).render("auth/logIn", {
      user: req?.user,
      cartCount: req?.cartCount || 2,
    });
  } catch (error) {
    console.error("Error loading log-in page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// Forget Password Page Loader
const loadForgetPage = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).render("forgetPassword/forgetpass", {
      user: req?.user,
      cartCount: req?.cartCount || 2,
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

//Email through OTP Send
const sendVerificationEmail = async (email, OTP) => {
  try {
    // Create reusable transporter
    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // use true for port 465 (recommended for Gmail)
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD, // App Password (no spaces!)
      },
    });

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

    console.log(`✅ Email sent to ${email}: ${info.response}`);
    return info.accepted.length > 0;
  } catch (error) {
    console
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .error("❌ Error sending email:", error.message);
    return false;
  }
};

// SignUp
const signUp = async (req, res) => {
  const { name, email, phone, password, cPassword, rememberMe } = req.body;
  try {
       if (password !== cPassword) {
      req.flash("error", "Passwords do not match!");
      return res.redirect("/signUp");  
    }

    const findUser = await userSchema.findOne({ email });
    if (findUser) {
      req.flash("error_msg", "You are already our customer. Please login!");
      return res.redirect("/logIn");   
    }

    const OTP = generateOtp();
    const emailSend = await sendVerificationEmail(email, OTP);

    if (!emailSend) {
      req.flash("error_msg", "Failed to send email. Try again.");
      return res.redirect("/signUp");
    }

    req.session.userOtp = OTP;
    req.session.userData = { email, password, name, phone, rememberMe };
    req.session.email = email;

    // Render OTP verification page
    res.status(HTTP_STATUS.OK).render("auth/Verify-otp");
    console.log("OTP Sent:", OTP);
  } catch (error) {
    console.error("SignUp Error:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("page-404", {
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Verify page loader
const verify_otp = async (req, res) => {
  try {
    const user = req.session?.user || null;
    res.render("auth/verify-Otp", { user });
  } catch (error) {
    console.error("Error Verify otp page loder : ", error);
    res
      .send(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .redirect("/verify-Otp", { message: "Internal Server error", error });
  }
};

const securePassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log("Secure password Generating Error :", error);
  }
};

const Post_verify_otp = async (req, res) => {
  try {
    const { otp } = req.body;
    console.log("User enterd otp :", otp);
    if (otp === req.session.userOtp) {
      const user = req.session.userData;
      const passwordHashed = await securePassword(user.password);
      const saveUserData = new userSchema({
        name: user.name,
        email: user.email,
        phone: user.phone.trim().replace(/^0+/, ""),
        password: passwordHashed,
        rememberMe: user.rememberMe === "on",
      });
      await saveUserData.save();
      req.session.user = saveUserData._id;
      res.json({ success: true, redirectUrl: "/" });
    } else {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Your Enterd OTP Is Invalid!" });
    }
  } catch (error) {
    console.log("Error occure in post verify otp :", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internel server Error Try again Later",
    });
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
  loadSignUpPage,
  loadLogInPage,
  loadForgetPage,
  signUp,
  verify_otp,
  Post_verify_otp,
};
