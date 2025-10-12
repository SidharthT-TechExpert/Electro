const HTTP_STATUS = require("../../config/statusCodes.js");
const userSchema = require("../../models/userSchema.js");
const productSchema = require("../../models/productSchema.js");
const categorieSchema = require("../../models/categorySchema.js");
const brandSchema = require("../../models/brandSchema.js");
const variantSchema = require("../../models/variantSchema.js");
const bannerSchema = require("../../models/bannerSchema.js");
const wishlistSchema = require("../../models/wishlistSchema.js");

const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const env = require("dotenv").config();
const bcrypt = require("bcrypt");

const checkSession = async (_id) => {
  if (!_id) return null;

  const objectId =new mongoose.Types.ObjectId(_id);

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
    { $unwind: "$wishlists" }
  ]);

  return result.length ? result[0] : null;
};

const updateCategoryProductCounts = async () => {
  try {
    // 🟦 Update category product counts
    const categories = await categorieSchema.find();

    for (const category of categories) {
      const count = await productSchema.countDocuments({
        category: category._id,
      });
      await categorieSchema.updateOne(
        { _id: category._id },
        { $set: { productCount: count } }
      );
      console.log(`✅ Category '${category.name}' count updated: ${count}`);
    }

    // 🟧 Update brand product counts
    const brands = await brandSchema.find();

    for (const brand of brands) {
      const count = await productSchema.countDocuments({ brand: brand._id });
      await brandSchema.updateOne(
        { _id: brand._id },
        { $set: { productCount: count } }
      );
      console.log(`✅ Brand '${brand.name}' count updated: ${count}`);
    }

    console.log("🎉 All category and brand counts updated successfully!");
  } catch (error) {
    console.error("❌ Error updating category/brand product counts:", error);
  }
};

// Home Page Loader
const loadHomePage = async (req, res) => {
  try {
    const user = await checkSession(req.session.userId);
    const now = new Date();

    // ✅ Fetch listed categories
    const categories = await categorieSchema.find({ status: "listed" });
    const categoryIds = categories.map((cat) => cat._id);

    // ✅ Fetch active banners
    const bannerData = await bannerSchema
      .find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .sort({ order: 1 })
      .lean();

    // Common product query
    const query = { status: "In Stock", isBlocked: false };

    // ------------------------------
    // 1️⃣ Fetch New Arrivals (with active offers)
    // ------------------------------
    let newArrivals = await productSchema.aggregate([
      { $match: query },
      {
        $lookup: {
          from: "variants",
          localField: "_id",
          foreignField: "product_id",
          as: "variants",
        },
      },
      { $unwind: "$variants" },
      { $match: { "variants.specifications.stock": { $gt: 0 } } },

      // ✅ Product offers
      {
        $lookup: {
          from: "offers",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$appliesTo", "product"] },
                    { $in: ["$$productId", "$targetIds"] },
                    { $eq: ["$isActive", true] },
                    { $lte: ["$startDate", now] },
                    { $gte: ["$endDate", now] },
                  ],
                },
              },
            },
          ],
          as: "productOffers",
        },
      },

      // ✅ Category offers
      {
        $lookup: {
          from: "offers",
          let: { categoryIds: "$category" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$appliesTo", "category"] },
                    { $in: ["$$categoryIds", "$targetIds"] },
                    { $eq: ["$isActive", true] },
                    { $lte: ["$startDate", now] },
                    { $gte: ["$endDate", now] },
                  ],
                },
              },
            },
          ],
          as: "categoryOffers",
        },
      },

      // Merge both offers
      {
        $addFields: {
          offers: { $concatArrays: ["$productOffers", "$categoryOffers"] },
        },
      },

      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          mainPrice: { $min: "$variants.price" },
          brand: { $first: "$brand" },
          category: { $first: "$category" },
          variants: { $push: "$variants" },
          Images: { $first: "$Images" },
          createdAt: { $first: "$createdAt" },
          offers: { $first: "$offers" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
    ]);

    // ------------------------------
    // 2️⃣ Apply discount calculation (from shop page)
    // ------------------------------
    newArrivals = newArrivals.map((product) => {
      let totalDiscountValue = 0;

      if (product.offers && product.offers.length > 0) {
        product.offers.forEach((o) => {
          const startDate = new Date(o.startDate);
          const endDate = new Date(o.endDate);

          // 🛑 Skip if inactive / upcoming / expired
          if (!o.isActive) return;
          if (startDate > now) return;
          if (endDate < now) return;

          let discountValue = 0;

          if (o.discountType === "Percentage") {
            discountValue = product.mainPrice * (o.discountValue / 100);

            // Cap by maxAmount if present
            if (o.maxAmount && discountValue > o.maxAmount) {
              discountValue = o.maxAmount;
            }
          } else if (o.discountType === "Fixed") {
            // Use maxAmount if exists, otherwise discountValue
            discountValue = o.maxAmount ? o.maxAmount : o.discountValue;
          }

          totalDiscountValue += discountValue;
        });
      }

      // Prevent over-discount
      if (totalDiscountValue > product.mainPrice) {
        totalDiscountValue = product.mainPrice;
      }

      const finalPrice = product.mainPrice - totalDiscountValue;
      const discountPercentage = (totalDiscountValue / product.mainPrice) * 100;

      // Apply final computed values
      product.finalPrice = Number(finalPrice.toFixed(0));
      product.appliedDiscountValue = Number(totalDiscountValue.toFixed(0));
      product.appliedDiscountType = "Percentage";
      product.discountPercentage = Number(discountPercentage.toFixed(0));

      // Update variant prices
      product.variants = product.variants.map((v) => ({
        ...v,
        discountType: "Percentage",
        activeDiscountValue: Number(totalDiscountValue.toFixed(0)),
      }));

      return product;
    });

    // ------------------------------
    // 3️⃣ Enrich variant image and price
    // ------------------------------
    const newArrivalIds = newArrivals.map((p) => p._id);
    const variantsNewArrivals = await variantSchema
      .find(
        { product_id: { $in: newArrivalIds } },
        "product_id product_image price"
      )
      .lean();

    const enrichedNewArrivals = newArrivals.map((product) => {
      const variant = variantsNewArrivals.find(
        (v) => v.product_id.toString() === product._id.toString()
      );
      product.variantImage =
        variant?.product_image?.[0] ||
        product.Images?.[0] ||
        "/img/header-img.jpg";
      product.price =
        variant?.price?.toFixed(2) || product.mainPrice?.toFixed(2);
      return product;
    });

    // ------------------------------
    // 4️⃣ Best Sellers & Hot Sales
    // ------------------------------
    const bestSellers = await productSchema
      .find({ isBlocked: false, category: { $in: categoryIds } })
      .populate("brand", "name logo")
      .sort({ salesCount: -1 })
      .limit(10)
      .lean();

    const hotSales = await productSchema
      .find({ isBlocked: false, category: { $in: categoryIds } })
      .populate("brand", "name logo")
      .sort({ views: -1 })
      .limit(8)
      .lean();

    console.log(enrichedNewArrivals[0]);

    // ------------------------------
    // Render Home Page
    // ------------------------------
    res.status(HTTP_STATUS.OK).render("home/home", {
      user,
      bannerData,
      newArrivals: enrichedNewArrivals,
      newProducts: enrichedNewArrivals,
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

const loadShopPage = async (req, res) => {
  try {
    const limit = 6;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const { category, search, minPrice, maxPrice, brand, sort } = req.query;

    const user = await checkSession(req.session.userId);

    await updateCategoryProductCounts();

    const categories = await categorieSchema
      .find({ status: "listed" })
      .sort({ productCount: -1 })
      .lean();

    const matchStage = { isBlocked: false, status: "In Stock" };

    if (category && category !== "all") {
      matchStage.category = mongoose.Types.ObjectId.isValid(category)
        ? new mongoose.Types.ObjectId(category)
        : category;
    }

    if (brand && brand !== "all" && mongoose.Types.ObjectId.isValid(brand)) {
      matchStage.brand = new mongoose.Types.ObjectId(brand);
    }

    const searchStage = [];
    if (search) {
      searchStage.push({
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { "variants.description": { $regex: search, $options: "i" } },
            { "brand.name": { $regex: search, $options: "i" } },
            { "category.name": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    const now = new Date();

    // Step 1: Aggregate products
    let products = await productSchema
      .aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: "variants",
            localField: "_id",
            foreignField: "product_id",
            as: "variants",
          },
        },
        {
          $lookup: {
            from: "brands",
            localField: "brand",
            foreignField: "_id",
            as: "brand",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        ...searchStage,
        { $unwind: "$variants" },
        { $match: { "variants.specifications.stock": { $gt: 0 } } },
        // Product offers
        {
          $lookup: {
            from: "offers",
            let: { productId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$appliesTo", "product"] },
                      { $in: ["$$productId", "$targetIds"] },
                      { $eq: ["$isActive", true] },
                      { $lte: ["$startDate", now] },
                      { $gte: ["$endDate", now] },
                    ],
                  },
                },
              },
            ],
            as: "productOffers",
          },
        },
        // Category offers
        {
          $lookup: {
            from: "offers",
            let: {
              categoryIds: {
                $map: { input: "$category", as: "c", in: "$$c._id" },
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ["$appliesTo", "category"] },
                      {
                        $gt: [
                          {
                            $size: {
                              $setIntersection: ["$targetIds", "$$categoryIds"],
                            },
                          },
                          0,
                        ],
                      },
                      { $eq: ["$isActive", true] },
                      { $lte: ["$startDate", now] },
                      { $gte: ["$endDate", now] },
                    ],
                  },
                },
              },
            ],
            as: "categoryOffers",
          },
        },
        {
          $addFields: {
            offers: { $concatArrays: ["$productOffers", "$categoryOffers"] },
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            mainPrice: { $min: "$variants.price" },
            price: { $first: "$price" },
            brand: { $first: "$brand" },
            category: { $first: "$category" },
            variants: { $push: "$variants" },
            Images: { $first: "$Images" },
            createdAt: { $first: "$createdAt" },
            offers: { $first: "$offers" },
          },
        },
      ])
      .exec();

    // Step 2: Compute finalPrice after offers
    products = products.map((product) => {
      let totalDiscountValue = 0;

      if (product.offers && product.offers.length > 0) {
        product.offers.forEach((o) => {
          const startDate = new Date(o.startDate);
          const endDate = new Date(o.endDate);
          if (!o.isActive || startDate > now || endDate < now) return;

          let discountValue = 0;

          if (o.discountType === "Percentage") {
            discountValue = product.mainPrice * (o.discountValue / 100);
            if (o.maxAmount && discountValue > o.maxAmount)
              discountValue = o.maxAmount;
          } else if (o.discountType === "Fixed") {
            discountValue = o.maxAmount || o.discountValue;
          }

          totalDiscountValue += discountValue;
        });
      }

      if (totalDiscountValue > product.mainPrice)
        totalDiscountValue = product.mainPrice;

      const finalPrice = product.mainPrice - totalDiscountValue;
      const discountPercentage = (totalDiscountValue / product.mainPrice) * 100;

      product.finalPrice = Number.isFinite(finalPrice)
        ? Number(finalPrice.toFixed(0))
        : 0;
      product.appliedDiscountValue = Number(totalDiscountValue.toFixed(0));
      product.appliedDiscountType = "Percentage";
      product.discountPercentage = Number(discountPercentage.toFixed(0));

      return product;
    });

    // Step 3: Apply minPrice / maxPrice filter BEFORE sorting
    if (!isNaN(minPrice) && minPrice !== "")
      products = products.filter((p) => p.finalPrice >= Number(minPrice));
    if (!isNaN(maxPrice) && maxPrice !== "")
      products = products.filter((p) => p.finalPrice <= Number(maxPrice));

    // Step 4: Apply sorting
    if (sort === "priceLow") {
      products.sort((a, b) => a.finalPrice - b.finalPrice);
    } else if (sort === "priceHigh") {
      products.sort((a, b) => b.finalPrice - a.finalPrice);
    } else if (sort === "nameAsc") {
      products.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameDesc") {
      products.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === "newest") {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sort === "oldest") {
      products.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Step 5: Pagination
    const totalProducts = products.length;
    products = products.slice(skip, skip + limit);

    // Wishlist
    let wishlistItems = [];
    if (user)
      wishlistItems = await wishlistSchema.find({ userId: user._id }).lean();

    const brands = await brandSchema
      .find({ status: "active" })
      .sort({ productCount: -1 })
      .lean();

    console.log(products[0] , user);

    res.status(200).render("products/shop", {
      user,
      categories,
      category,
      products,
      search,
      currentPage: page,
      brands,
      sort: sort || "relevance",
      totalPages: Math.ceil(totalProducts / limit),
      cartCount: req.cartCount || null,
      selectedCategory: category || "all",
      selectedBrand: brand || "all",
      selectedSort: sort || "",
      searchQuery: search || "",
      minPrice: minPrice || "",
      maxPrice: maxPrice || "",
      wishlistItems,
      perPage: limit,
      totalProducts,
    });
  } catch (error) {
    console.error("❌ Error loading shop page:", error);
    res.status(500).send("Internal Server Error");
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
  loadShopPage,
};
