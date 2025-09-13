const HTTP_STATUS = require("../../config/statusCodes.js");
const userSchema = require("../../models/userSchema.js");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bcrypt = require("bcrypt");

const checkSession = async (_id) => {
  return _id ? await userSchema.findOne({ _id }) : null;
};

// Home page Loader
const loadHomePage = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);
    res
      .status(HTTP_STATUS.OK)
      .render("auth/home", { user, cartCount: req.cartCount || null });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// 404 Page Not Found
const pageNotFound = async (req, res) => {
  try {
    const user = await checkSession(req.session?.userId);
    res
      .status(HTTP_STATUS.NOT_FOUND)
      .render("auth/page-404", { user, cartCount: req.cartCount || null });
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
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).render("auth/page-404", {
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Verify page loader
const verify_Otp = async (req, res) => {
  try {
    const user = null;
    res.render("auth/verify-Otp", { user });
  } catch (error) {
    console.error("Error Verify otp page loder : ", error);
    res.send(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: `Internal Server Error , Please Try Again! : ${error}`,
    });
    res.redirect("/veriry-Otp");
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

//checking OTP
const post_Verify_Otp = async (req, res) => {
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
      });

      await saveUserData.save();

      req.session.userId = saveUserData._id;

      //  Handle rememberMe with session cookie
      if (req.session.userData.rememberMe === "true") {
        req.session.cookie.maxAge = 24 * 60 * 60 * 1000;
      } else {
        req.session.cookie.expires = false; // browser close
      }

      req.flash("success_msg", "User SignUp Successfully");
      res.json({ success: true, redirectUrl: "/" });
      req.session.userData = null;
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

// Resend OTP
const resend_Otp = async (req, res) => {
  try {
    const email = req.session.email;
    console.log(email);

    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Email not found in session!" });
    }

    const OTP = generateOtp();
    req.session.userOtp = OTP;

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

const userLogIn = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user with password field
    const user = await userSchema.findOne({ email }).select("+password");

    if (!user) {
      req.flash("error", "User not found!");
      return res.status(400).redirect("/logIn");
    }

    if (user.googleId) {
      req.flash("error", "User signed up with Google!");
      return res.status(404).redirect("/logIn");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      req.flash("error", "Invalid credentials");
      return res.status(401).redirect("/logIn");
    }

    //  Handle rememberMe with session cookie
    if (rememberMe === "true") {
      req.session.cookie.maxAge = 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = false; // browser close
    }

    req.session.userId = user._id;
    req.flash("success_msg", "Login successful!");
    return res.redirect("/");
  } catch (error) {
    console.log("user Login verification Error :", error);
    req.flash("error", "Internal Server Error, Please Try Again!");
    return res.redirect("/logIn");
  }
};

// Forget password - send OTP
const forgetPass = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please sign up.",
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

    req.session.userOtp = OTP;
    req.session.email = email;

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
const passReset = async (req, res) => {
  try {
    const { otp } = req.body;
    if (otp == req.session.userOtp) {
      return res.json({
        success: true,
        message: "OTP Verified Successfully",
        redirectUrl: "/reset-password",
      });
    }
    return res.json({
      success: false,
      message: "Invalid OTP. Please try again.",
    });
  } catch (error) {
    console.error("OTP Validating Error:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: "Internal server error" });
  }
};

//Update Password
const updatePass = async (req, res) => {
  try {
    const { password } = req.body;
    const email = req.session.email;

    if (!email) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Session expired. Please retry." });
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
        .json({ success: false, message: "User not found" });
    }

    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
  loadSignUpPage,
  loadLogInPage,
  loadForgetPage,
  signUp,
  verify_Otp,
  post_Verify_Otp,
  resend_Otp,
  userLogIn,
  forgetPass,
  passReset,
  updatePass,
};
