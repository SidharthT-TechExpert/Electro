const express = require("express");
const router = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController.js");
const checkSession = require('../middlewares/session.js');

// Home page route
router.get("/pageNotFound",  userController.pageNotFound);
router.get("/signUp", checkSession.checker, userController.loadSignUpPage);
router.get("/logIn", checkSession.checker ,userController.loadLogInPage);
router.get("/forgetPass", checkSession.checker , userController.loadForgetPage);
router.get("/verify-Otp",checkSession.checker ,userController.verify_Otp);
router.get("/", userController.loadHomePage);

// Post Request
router.post("/signUp", userController.signUp);
router.post("/verify-Otp", userController.post_Verify_Otp);
router.post("/resend-Otp", userController.resend_Otp);
router.post("/logIn", userController.userLogIn);
router.post("/forgetpass", userController.forgetPass);
router.post("/passReset", userController.passReset);
router.post("/update-password", userController.updatePass);

// For signUp with Google
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signUp" }),
  (req, res) => {
    // Store googleId in session explicitly
    req.session.googleId = req.user.googleId;

    // Optional: store full user id too
    req.session.userId = req.user._id;

    res.redirect("/");
  }
);


module.exports = router;
