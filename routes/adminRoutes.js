const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/admin/adminController");
const passport = require("passport");

const session = require("../middlewares/session");

// Example admin route
routes.get("/login", session.isAdmin, adminController.loadLogin);
routes.get("/forgot-password", session.isAdmin , adminController.loadForgetPage);
routes.get("/dashboard",session.isChecker , adminController.loadDashBoardPage);
routes.get("/", session.isAdmin, adminController.loadLogin);
routes.get("/logOut", session.isChecker , adminController.logOut);

routes.post("/forgetPass", adminController.forgetPass);
routes.post("/passReset", adminController.OTP_Verify);
routes.post("/resend-Otp", adminController.resend_Otp);
routes.post("/update-password", adminController.updatePass);
routes.post("/logIn", adminController.userLogIn);

// Admin Google Login
routes.get(
  "/auth/google",
  passport.authenticate("google-admin", { scope: ["profile", "email"] })
);

// Admin Google login
routes.get(
  "/auth/google/callback",
  passport.authenticate("google-admin", { failureRedirect: "/admin/login" }),
  (req, res) => {
    if (req.user && req.user.isAdmin) {
      req.session.adminId = req.user._id;
      return res.redirect("/admin/dashboard?auth=success");
    }
    res.redirect("/admin/login?error=unauthorized");
  }
);

module.exports = routes;
