const HTTP_STATUS = require("../../config/statusCodes.js");
const userSchema = require("../../models/userSchema.js");
const productSchema = require("../../models/productSchema.js");
const categorieSchema = require("../../models/categorySchema.js");
const offerSchema = require("../../models/OfferSchema.js");
const brandSchema = require("../../models/brandSchema.js");
const variantSchema = require("../../models/variantSchema.js");
const bannerSchema = require("../../models/bannerSchema.js");

const nodemailer = require("nodemailer");
const env = require("dotenv").config();
const bcrypt = require("bcrypt");

const checkSession = async (_id) => {
  return _id ? await userSchema.findById(_id) : null;
};

// Home Page Loader
const loadHomePage = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);

    // Fetch listed categories
    const categories = await categorieSchema.find({ status: "listed" });
    const bannerData = await bannerSchema
      .find({
        isActive: true,
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() },
      })
      .sort({ order: 1 })
      .lean();
    // Extract category IDs
    const categoryIds = categories.map((cat) => cat._id);

    // Fetch latest 8 unblocked products
    const products = await productSchema
      .find({ isBlocked: false })
      .populate("brand", "name logo")
      .populate("category", "name description isListed")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // ✅ Fetch variants for these products (includes price)
    const productIds = products.map((p) => p._id);
    const variants = await variantSchema
      .find(
        { product_id: { $in: productIds } },
        "product_id product_image price sku specifications color description"
      )
      .lean();

    // ✅ Attach variant image and price to each product
    const newArrivals = products.map((product) => {
      const variant = variants.find(
        (v) => v.product_id.toString() === product._id.toString()
      );

      product.variantImage =
        variant?.product_image?.length > 0
          ? variant.product_image[0]
          : product.Images?.[0] || "/img/header-img.jpg";

      // ✅ Attach price from variant if available
      product.price = variant?.price.toFixed(2) || "N/A";

      return product;
    });

    console.log("✅ New Arrivals:", newArrivals.length);

    // Best Sellers
    const bestSellers = await productSchema
      .find({ isBlocked: false, category: { $in: categoryIds } })
      .populate("brand", "name logo")
      .sort({ salesCount: -1 })
      .limit(10)
      .lean();

    // Hot Sales
    const hotSales = await productSchema
      .find({ isBlocked: false, category: { $in: categoryIds } })
      .populate("brand", "name logo")
      .sort({ views: -1 })
      .limit(8)
      .lean();

    // ✅ Render Home Page
    res.status(HTTP_STATUS.OK).render("home/home", {
      user,
      bannerData,
      newArrivals,
      bestSellers,
      hotSales,
      cartCount: req.cartCount || null,
    });
  } catch (error) {
    console.error("❌ Error loading home page:", error);
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
      user: null,
      cartCount: null,
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
      user: null,
      cartCount: null,
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
      user: null,
      cartCount: null,
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

// SignUp
const signUp = async (req, res) => {
  const { name, email, phone, password, cPassword, rememberMe } = req.body;

  try {
    // Check password match
    if (password !== cPassword) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: "Passwords do not match!" });
    }

    // Check if user already exists
    const findUser = await userSchema.findOne({ email });
    if (findUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: "You are already our customer. Please login!",
      });
    }

    // Generate OTP & send email
    const OTP = generateOtp();
    const emailSend = await sendVerificationEmail(email, OTP);

    if (!emailSend) {
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Failed to send email. Try again." });
    }

    // Store OTP & user data in session
    req.session.userOtp = OTP;
    req.session.userData = { email, password, name, phone, rememberMe };

    console.log("OTP Sent:", OTP);

    // ✅ Final response — only one
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "OTP sent successfully! Please verify.",
    });
  } catch (error) {
    console.error("SignUp Error:", error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// Verify page loader
const verify_Otp = async (req, res) => {
  try {
    res.render("auth/verify-Otp", { user: null, cartCount: null });
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

// Login verification step
const userLogIn = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find user with password field
    const user = await userSchema.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ success: false, message: "User not found!" });
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

    req.session.userId = user._id;

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

//logOut  Btn Logic
const logOut = async (req, res) => {
  try {
    req.session.userId = null;
    res.redirect("/");
  } catch (error) {
    console.log("Logout Error :", error);
    req.flash("error_msg", "Internal Server Error , please try again later !");
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).redirect("/pageNotFound");
  }
};

// Products Details Page Loader
const loadProductDetails = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);

    res
      .status(HTTP_STATUS.OK)
      .render("auth/page-404", { user, cartCount: req.cartCount || null });
  } catch (error) {
    console.error("Error loading product details page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
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
  logOut,
  loadProductDetails,
};
