const checker = (req, res, next) => {
  if (req.session && req.session.userId) res.redirect("/");
  else next();
};

const logOut = (req, res, next) => {
  if (req.session && req.session.userId) next();
  else {
    req.flash("error_msg" , 'Session Expired!');
    res.redirect('/');
  }
};

module.exports = {
  checker,
  logOut,
};
