const checker = (req, res, next) => {
  if (req.session && (req.session.userId||req.session.googleId)) res.redirect("/");
  else next();
};

const logOut = (req, res, next) => {
  if (req.session && req.session.userId) next();
  else {
    req.flash("error_msg", "Session Expired!");
    res.redirect("/");
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.adminId || req.session.adminGooleId)
    res.redirect("/admin/dashboard");
  else next();
};

const isChecker = (req, res, next) => {
  if (req.session.adminId || req.session.adminGooleId)
    next()
  else res.redirect('/admin');
};

module.exports = {
  checker,
  logOut,
  isAdmin,
  isChecker,
};
