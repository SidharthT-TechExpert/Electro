const checker = (req, res, next) => {
        console.log("chcker:")
  if (req.session && req.session.user) res.redirect("/");
  else next();
};

module.exports = {
  checker,
};
