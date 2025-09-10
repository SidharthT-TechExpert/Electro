// Home page Loader
const loadHomePage = async (req, res) => {
  try {
    return res.render("home");
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(500).send("Internal Server Error");
  }
};

// 404 Page Not Found
const pageNotFound = async (req, res) => {
  try {
    res.render("page-404");
  } catch (error) {
    res.redirect("/pageNotFound");
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
};
