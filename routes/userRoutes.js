const express = require("express");
const routes = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController.js");
const checkSession = require("../middlewares/session.js");
const DetailController = require("../controllers/user/DetailController.js");
const AddressController = require("../controllers/user/addressController.js");

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
  .get(checkSession.isAuth, userController.verify_Otp)
  .post(userController.post_Verify_Otp);

// LogOut Route
routes.get("/logOut", checkSession.userLogOut, userController.logOut);

// Home Page Route
routes.get("/", checkSession.homeAuth, userController.loadHomePage);

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
routes.put("/myProfile/name", DetailController.UpdateName);
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

// Product Details Page route
routes.get("/products/Details/:id", userController.loadProductDetails);

// For signUp/SignIn with Google
routes.get(
  "/auth/google",
  passport.authenticate("google-user", { scope: ["profile", "email"] })
);

// User Google login
routes.get(
  "/auth/google/callback",
  passport.authenticate("google-user", { failureRedirect: "/signUp" }),
  (req, res) => {
    if (req.user) {
      req.session.userId = req.user._id;
      return res.redirect("/?auth=success");
    }
    res.redirect("/signUp?error=unauthorized");
  }
);

module.exports = routes;
