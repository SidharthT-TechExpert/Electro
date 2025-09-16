const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const passport = require("passport");

const session = require("../middlewares/session");

// Login Menagement admin
routes
  .route("/login")
  .get(session.isAdmin, adminController.loadLogin)
  .post(adminController.userLogIn);

routes
  .route("/forgetPass")
  .get(session.isAdmin, adminController.loadForgetPage)
  .post(adminController.forgetPass);

routes.get("/", session.isAdmin, adminController.loadLogin);
routes.get("/dashboard", session.isChecker, adminController.loadDashBoardPage);
routes.post("/passReset", adminController.OTP_Verify);
routes.post("/resend-Otp", adminController.resend_Otp);
routes.post("/update-password", adminController.updatePass);
routes.get("/logOut", session.isChecker, adminController.logOut);
routes.get("/pageNotFound", session.isChecker, adminController.pageNotFound);

// Customer Management
routes.get("/customers", customerController.customer);
routes.put("/customersBlock",customerController.customerBlock);
routes.get("/categories", customerController.categories);

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
