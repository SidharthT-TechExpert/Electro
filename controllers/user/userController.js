const HTTP_STATUS = require("../../config/statusCodes.js");
// Home page Loader
const loadHomePage = async (req, res) => {
  try {
    res.render("home", { user: req.user || { name: "Guest" } , cartCount : req.cartCount || 2});
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// 404 Page Not Found
const pageNotFound = async (req, res) => {
  try {
    res.render("page-404");
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).redirect("/pageNotFound");
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
};
