const express = require("express");
const routes = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController.js");
const checkSession = require("../middlewares/session.js");
const Swal = require('sweetalert2');

// Home page route
routes.get("/pageNotFound", userController.pageNotFound);
routes.get("/signUp", checkSession.checker, userController.loadSignUpPage);
routes.get("/logIn", checkSession.checker, userController.loadLogInPage);
routes.get("/forgetPass", checkSession.checker, userController.loadForgetPage);
routes.get("/verify-Otp", checkSession.checker, userController.verify_Otp);
routes.get("/logOut", checkSession.logOut, userController.logOut);
routes.get("/", userController.loadHomePage);

// Post Request
routes.post("/signUp", userController.signUp);
routes.post("/verify-Otp", userController.post_Verify_Otp);
routes.post("/resend-Otp", userController.resend_Otp);
routes.post("/logIn", userController.userLogIn);
routes.post("/forgetpass", userController.forgetPass);
routes.post("/passReset", userController.passReset);
routes.post("/update-password", userController.updatePass);

// For signUp with Google
routes.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

routes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signUp" }),
  (req, res) => {
    req.session.googleId = req.user.googleId;
    req.session.userId = req.user._id;

    // Add query param to indicate success
    res.redirect("/?auth=success");
  }
);


module.exports = routes;
