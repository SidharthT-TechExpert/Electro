const express = require("express");
const routes = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController.js");
const checkSession = require("../middlewares/session.js");

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

// Post Request
// Resend OTP Route
routes.post("/resend-Otp", userController.resend_Otp);
// Reset Password Route
routes.post("/passReset", userController.passReset);
// Update Password Route
routes.post("/update-password", userController.updatePass);

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
