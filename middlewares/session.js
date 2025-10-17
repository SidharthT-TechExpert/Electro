const userSchema = require("../models/userSchema");

const isSession = async (req, res, next) => {
  try {
    // Conflict: both user & admin sessions
    if (req.session?.userId && req.session?.adminId) {
      req.flash("warning_msg", "Conflict detected. Please log in again.");
      req.session.userId = null;
      req.session.adminId = null;
      return res.redirect("/"); // return prevents further execution
    }

    // Check user session first
    const sessionId = req.session?.userId;
    if (sessionId) {
      const user = await userSchema.findById(sessionId);

      if (!user) {
        return next(); // no user found → continue
      }

      if (user.isBlocked) {
        req.flash("warning_msg", "Blocked User. Please contact Customer Care!");
        req.session.userId = null;
        return res.redirect("/login"); // return prevents double headers
      }

      // All good → proceed To Home
      return res.redirect('/'); // instead of res.redirect("/"), just allow route handler to continue
    }

    // No session at all → continue To Login or SignUp
    return next();
  } catch (err) {
    console.error("Auth error:", err);
    req.flash("error_msg", "Something went wrong. Please login again.");
    return res.redirect("/login"); // always return after redirect
  }
};

const isAuth = async (req, res, next) => {
  if (req.session && req.session.userId) {
    userSchema.findById(req.session.userId).then((data) => {
      if (data && !data.isBlocked) {
        next();
      } else {
        req.session.destroy();
        console.log("Error :");
        res.json({
          success: false,
          blocked: true,
          message: "Blocked User , You must Contact With Our costomer care!",
        });
      }
    });
  } else {
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
    req.flash("warning_msg", "Session Expired!");
    res.redirect("/");
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (req.session && req.session.adminId) {
      const admin = await userSchema.findById(req.session.adminId);

      if (!admin) {
        req.flash("error_msg", "Invalid credentials!");
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

const isChecker = async (req, res, next) => {
  try {
    // Check if admin is logged in
    if (!req.session.adminId) {
      req.flash("error_msg", "Unauthorized access.");
      return res.redirect("/admin");
    }

    // Find admin by ID
    const admin = await userSchema.findById(req.session.adminId);

    // Validate admin existence and status
    if (!admin) {
      req.flash("error_msg", "Admin not found.");
      return res.redirect("/admin");
    }

    if (admin.isBlocked) {
      req.flash("error_msg", "Your account is blocked.");
      return res.redirect("/admin");
    }

    if (!admin.isAdmin) {
      req.flash("error_msg", "Access denied.");
      return res.redirect("/admin");
    }

    // If all good, proceed
    next();
  } catch (err) {
    console.error("Middleware error:", err);
    req.flash("error_msg", "Something went wrong.");
    return res.redirect("/admin");
  }
};

module.exports = {
  isAuth,
  isSession,
  userLogOut,
  isAdmin,
  isChecker,
  isValid,
};
