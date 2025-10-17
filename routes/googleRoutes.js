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
    failureRedirect: "/admin",
    failureFlash: true,
  }),
  (req, res) => {
    // ✅ Here, req.user is guaranteed to exist if authentication succeeded
    if (!req.user) {
      req.flash("error_msg", "Unauthorized admin access!");
      return res.redirect("/admin");
    }

    console.log("✅ Google with:", req.user);

    // ✅ Store adminId in session
    req.session.adminId = req.user._id;
    req.session.save(() => {
      res.redirect("/admin/dashboard");
    });
  }
);

module.exports = router;
