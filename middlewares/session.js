const userSchema = require("../models/userSchema");

const homeAuth = async (req, res, next) => {
  try {
    // case: both user and admin session exist => conflict
    if (req.session.userId && req.session.adminId) {
      req.flash("error_msg", "Conflict detected. Please log in again.");
      req.session.userId = null;
      req.session.adminId = null;
      res.redirect("/");
      return;
    }

    // Pick whichever session exists
    const sessionId = req.session?.userId;

    if (sessionId) {
      const user = await userSchema.findById(sessionId);

      if (!user) next();

      if (user.isBlocked) {
        req.flash("error_msg", "Blocked User. Please contact Customer Care!");
        req.session.userId = null;
        res.redirect("/login");
        return;
      }

      // All good
      next();
    } else {
      // no session at all
      next();
    }
  } catch (err) {
    console.error("Auth error:", err);
    req.flash("error_msg", "Something went wrong. Please login again.");
    res.redirect("/logIn");
  }
};

const isAuth = async (req, res, next) => {
  if (req.session && req.session.userId) {
    userSchema.findById(req.session.userId).then((data) => {
      if (data && !data.isBlocked) {
         next();
      } else {
        req.session.destroy();
        console.log("Error :")
        res.json({
          success: false,
          blocked:true,
          message: "Blocked User , You must Contact With Our costomer care!",
        });
      }
    });
  }else{
    next();
  }
};

const isValid = async (req, res, next) => {
  if (req.session && req.session.userId) {
    userSchema.findById(req.session.userId).then((data) => {
      if (data && !data.isBlocked) {
        next();
      } else {
        res.json({
          success: false,
          message: "Blocked User! You must contact our customer care.",
        });
        req.session.destroy();
      }
    });
  } else next();
};

const userLogOut = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    req.flash("error_msg", "Session Expired!");
    res.redirect("/");
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.session && req.session.adminId) {
      const admin = await userSchema.findById(req.session.adminId);

      if (!admin) {
        req.flash("error_msg", "Admin not found. Please log in again.");
        return res.redirect("/admin/login");
      }

      if (admin.isBlocked) {
        req.flash(
          "error_msg",
          "Your account has been blocked. Contact support."
        );
        req.session.adminId = null; // clear session
        return res.redirect("/admin/login");
      }

      // ✅ Admin exists and is active
      return res.redirect("/admin/dashboard");
    }

    // 👌 If no session, allow access
    return next();
  } catch (err) {
    console.error("isAdmin middleware error:", err);
    req.flash("error_msg", "Something went wrong. Please try again.");
    return res.redirect("/admin/login");
  }
};

const isChecker = (req, res, next) => {
  if (req.session.adminId) {
    userSchema.findById(req.session.adminId).then((data) => {
      if (data && !data.isBlocked && data.isAdmin) {
        return next();
      }
    });
  } else {
    req.flash("error_msg", "Unathrized access..");
    return res.redirect("/admin");
  }
};

module.exports = {
  isAuth,
  homeAuth,
  userLogOut,
  isAdmin,
  isChecker,
  isValid,
};
