const express = require('express');
const routes = express.Router();
const adminController = require('../controllers/admin/adminController');
const passport = require('passport');

// Example admin route
routes.get("/login", adminController.loadLogin);
routes.get("/forgot-password", adminController.loadForgetPage);
routes.get("/", adminController.loadLogin);


routes.post("/forgetPass", adminController.forgetPass);
routes.post("/passReset", adminController.OTP_Verify);
routes.post("/resend-Otp", adminController.resend_Otp);
routes.post("/update-password", adminController.updatePass);
routes.post("/logIn", adminController.userLogIn);


// For signUp with Google
routes.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
routes.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/signUp" }),
  (req, res) => {
    if(req.user.isAdmin){
      // Store googleId in session explicitly
    req.session.googleId = req.user.googleId;
    // Store full user id too
    req.session.userId = req.user._id;
    res.redirect("/admin/dashBoard?auth=success");
    }else{
      res.redirect("/")
    }
  }
);


module.exports = routes;