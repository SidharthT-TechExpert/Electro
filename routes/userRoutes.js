const express = require("express");
const routes = express.Router();
const passport = require("passport");
const { query, validationResult } = require('express-validator');
const checkSession = require("../middlewares/session.js");
const userController = require("../controllers/user/userController.js");
const DetailController = require("../controllers/user/myProfileController.js");
const AddressController = require("../controllers/user/addressController.js");
const wishlistController = require("../controllers/user/wishlistController.js");
const cartController = require("../controllers/user/cartController.js");

//user Session
const userSession = require("../middlewares/userSession.js");

// Login Menagement Get
routes.get("/pageNotFound", userController.pageNotFound);

// SignUp Route
routes
  .route("/signUp")
  .get(checkSession.isAuth, userController.loadSignUpPage)
  .post(userController.signUp);

// LogIn Route
routes
  .route("/logIn")
  .get(userController.loadLogInPage)
  .post(checkSession.isAuth, userController.userLogIn);

// Forget Password Route
routes
  .route("/forgetPass")
  .get(checkSession.isAuth, userController.loadForgetPage)
  .post(checkSession.isAuth, userController.forgetPass);

// Verify OTP Route
routes
  .route("/verify-Otp")
  .get(query('redirect').notEmpty(), checkSession.isAuth, userController.verify_Otp)
  .post(query('otp').notEmpty(),userController.post_Verify_Otp);

routes.post("/resend-Otp", userController.resend_Otp);

// LogOut Route
routes.get("/logOut", checkSession.userLogOut, userController.logOut);

// Home Page Route
routes.get("/", checkSession.homeAuth, userController.loadHomePage);

// Shop Page Route
routes.get("/shop", checkSession.homeAuth, userController.loadShopPage);

// WishList Updating
routes.post(
  "/shop/wishlist",
  checkSession.isValid,
  wishlistController.addWishlist
);

// WishList Adding
routes.post("/cart/add", checkSession.isValid, cartController.addToCart);

// Resend OTP Route
routes.post("/resend-Otp", userController.resend_Otp);
// Reset Password Route
routes.post("/passReset", userController.passReset);
// Update Password Route
routes.post("/update-password", userController.updatePass);

// Profile
routes.get("/myProfile", DetailController.MY_Profile);

// -------------------- Profile Photo Upload -------------------- //
routes.post("/upload-profile-photo", DetailController.upload_Profile_photo);

// -------------------- Serve Profile Photo Getting -------------------- //
routes.get("/profile-photo/:id", DetailController.Profile_photo);

//Update Name
routes.put("/update-name", DetailController.UpdateName);
//Update Password
routes.post("/change-password", DetailController.updatePass);
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

// ==================== Google Auth ====================

// Trigger Google Login
routes.get(
  "/auth/google",
  (req, res, next) => {
    const redirectUrl = req.query.redirect || req.headers.referer || "/";
    console.log("Redirect URL before Google auth:", redirectUrl);

    req.session.redirectUrl = redirectUrl;

    req.session.save(() => next());
  },
  passport.authenticate("google-user", { scope: ["profile", "email"] })
);

// Handle Google Callback
routes.get(
  "/auth/google/callback",
  (req, res, next) => {
    // Save the redirectUrl before Passport regenerates the session
    req.savedRedirect = req.session.redirectUrl;
    next();
  },
  passport.authenticate("google-user", { failureRedirect: "/signUp" }),
  (req, res) => {
    if (!req.user) return res.redirect("/signUp?error=unauthorized");

    // Attach userId
    req.session.userId = req.user._id;

    // Use the saved redirect URL
    const redirectTo = req.savedRedirect || "/";
    return res.redirect(redirectTo + "?auth=success");
  }
);


module.exports = routes;
