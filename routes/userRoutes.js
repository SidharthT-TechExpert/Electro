const express = require("express");
const routes = express.Router();
const passport = require("passport");
const { query, body } = require("express-validator");
const checkSession = require("../middlewares/session.js");
const userController = require("../controllers/user/userController.js");
const DetailController = require("../controllers/user/myProfileController.js");
const AddressController = require("../controllers/user/addressController.js");
const wishlistController = require("../controllers/user/wishlistController.js");
const cartController = require("../controllers/user/cartController.js");

// Login Menagement Get
routes.get("/pageNotFound", userController.pageNotFound);

// SignUp Route
routes
  .route("/signUp")
  .get(
    query("redirect")
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^\/[a-zA-Z0-9\-\/]*$/)
      .withMessage("Invalid redirect path"),
    checkSession.isSession,
    userController.loadSignUpPage
  )
  .post(
    [
      // Name: required, trimmed
      body("name")
        .notEmpty()
        .trim()
        .withMessage("Name is required")
        .isLength({ min: 2 })
        .withMessage("Name must be at least 2 characters")
        .escape(),

      // Email: required, valid format
      body("email")
        .notEmpty()
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Valid email is required")
        .escape(),

      // Phone: required, digits only
      body("phone")
        .notEmpty()
        .trim()
        .isMobilePhone("any")
        .withMessage("Valid phone number is required")
        .escape(),

      // Password: required, min 8 chars
      body("password")
        .notEmpty()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .escape(),

      // Confirm password: matches password
      body("cPassword")
        .notEmpty()
        .custom((value, { req }) => value === req.body.password)
        .withMessage("Passwords do not match")
        .escape(),

      // rememberMe: optional boolean
      body("rememberMe")
        .optional()
        .isBoolean()
        .withMessage("Invalid remember me value"),

      // referralCode: optional, Cap alphanumeric and num
      body("referalCode")
        .optional({ checkFalsy: true })
        .trim()
        .matches(/^[A-Z0-9]{13}$/)
        .withMessage(
          "Referral code must be 13 characters, uppercase letters and numbers only"
        )
        .escape(),
    ],
    checkSession.isSession,
    userController.signUp
  );

// ✅ LogIn Route
routes
  .route("/logIn")
  // Load login page
  .get(
    query("redirect")
      .optional()
      .trim()
      .matches(/^\/[a-zA-Z0-9\-\/]*$/)
      .withMessage("Invalid redirect path"),
    checkSession.isSession,
    userController.loadLogInPage
  )
  .post(
    // 🔒 Redirect param validation
    body("redirect")
      .optional({ checkFalsy: true })
      .trim()
      .matches(/^\/[a-zA-Z0-9\-\/]*$/)
      .withMessage("Invalid redirect path"),

    // Email validation
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Enter a valid email address")
      .normalizeEmail(),

    // Password validation
    body("password")
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .escape(),

    // Remember Me (convert to real Boolean)
    body("rememberMe")
      .optional()
      .isBoolean() // validator
      .withMessage("Invalid remember me value")
      .toBoolean(), // sanitizer

    // Middlewares
    checkSession.isAuth,
    userController.userLogIn
  );

// Forget Password Route
routes
  .route("/forgotPass")
  .get(checkSession.isSession, userController.loadForgetPage)
  .post(
    body("email").notEmpty().isEmail().withMessage("Valid email is required"),
    body("isOTP").optional().toBoolean(true),

    checkSession.isSession,
    userController.forgetPass
  );

// Verify OTP Route
routes
  .route("/verify-Otp")
  // GET route: verify-Otp page
  .get(checkSession.isSession, userController.verify_Otp)
  // POST route: verify OTP submission
  .post(
    body("otp").trim().escape(), // safe for OTP input

    userController.post_Verify_Otp
  );

// Resend OTP Route
routes.post("/resend-Otp", userController.resend_Otp);

// Reset Password Route
routes.post(
  "/passReset",
  body("otp").notEmpty().escape(),
  checkSession.isSession,
  userController.passReset
);

// Update Password Route
routes.post(
  "/update-password",
  body("password").notEmpty().withMessage("Password is required"),
  body("cPassword").notEmpty().withMessage("Password is required"),
  checkSession.isSession,
  userController.updatePass
);

// LogOut Route
routes.get("/logOut", checkSession.userLogOut, userController.logOut);

// Home Page Route
routes.get("/", userController.loadHomePage);

// Shop Page Route
routes.get("/shop", userController.loadShopPage);

// WishList Updating
routes.post(
  "/shop/wishlist",
  checkSession.isValid,
  wishlistController.addWishlist
);

// WishList Adding
routes.post("/cart/add", checkSession.isValid, cartController.addToCart);

// Profile
routes.get("/myProfile", DetailController.MY_Profile);

// -------------------- Serve Profile Photo Getting -------------------- //
routes.get("/profile-photo/:id", DetailController.Profile_photo);

// -------------------- Profile Photo Upload -------------------- //
routes.post("/upload-profile-photo", DetailController.upload_Profile_photo);

// -------------------- Serve Profile Photo Dleting -------------------- //
routes.post("/delete-profile-photo", DetailController.deleteProfile_photo);

//Update Name
routes.put("/update-name", DetailController.UpdateName);
//Update Password
routes.post("/change-password", DetailController.updatePass);
routes.post("/add-password", DetailController.addPass);

//Update Phone number
routes.post("/send-otp", DetailController.send_otp);
routes.post("/verifyOTP", DetailController.verify_Otp);
//Update Email
routes.post("/send-email-otp", DetailController.send_Email_otp);
routes.post("/verifyEmail_OTP", DetailController.verify_Email_Otp);

//Address Block
routes
  .route("/address-book")
  .get(AddressController.get_Address_page)
  .post(AddressController.addAddress)
  .delete(AddressController.deleteAddress);

routes
  .route("/address-book/:id")
  .get(AddressController.get_Details)
  .put(AddressController.editAddress);

// Product Details Page route
routes.get("/product/:id", userController.loadProductDetails);

// ==================== Google Auth


module.exports = routes;
