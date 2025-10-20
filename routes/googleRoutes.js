const express = require("express");
const passport = require("../config/passport"); // adjust path
const router = express.Router();

// ---------- User Google Login ----------
router.get(
  "/google-user",
  passport.authenticate("google-user", { scope: ["profile", "email"] })
);

router.get(
  "/google-user/callback",
  passport.authenticate("google-user", {
    failureRedirect: "/login",
    failureFlash: true, // ✅ Enables flash messages from passport
  }),
  (req, res) => {
    if (req.user.isBlocked) {
      req.flash(
        "warning_msg",
        "Blocked user account! Please contact with our customer care."
      );
      return res.redirect("/logIn");
    }

    req.session.userId = req.user._id;

    // Redirect to saved URL or home
    const redirectTo = req.session.redirectUrl || "/";
    delete req.session.redirectUrl;

    res.redirect(redirectTo + "?auth=success");
  }
);

// ---------- Admin Google Login ----------
router.get(
  "/google-admin",
  passport.authenticate("google-admin", { scope: ["profile", "email"] })
);

router.get(
  "/google-admin/callback",
  passport.authenticate("google-admin", {
    failureRedirect: "/admin/login",
    failureFlash: true, // ✅ enables custom flash messages from passport
  }),
  (req, res) => {
    // If user exists but is blocked
    if (req.user.isBlocked) {
      req.flash(
        "warning_msg",
        "Blocked admin account! Please contact support."
      );
      return res.redirect("/admin/login");
    }

    // If not an admin
    if (!req.user.isAdmin) {
      req.flash("error", "Unauthorized access! Admins only.");
      return res.redirect("/admin/login");
    }

    // ✅ Successful login
    req.session.adminId = req.user._id;
    req.flash("success", `Welcome back, ${req.user.name || "Admin"}!`);
    res.redirect("/admin/dashboard?auth=success");
  }
);

module.exports = router;
