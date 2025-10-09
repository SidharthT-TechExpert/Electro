const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categorieController = require("../controllers/admin/categorieController.js");
const brandController = require("../controllers/admin/brandController.js");
const productController = require("../controllers/admin/productController.js");
const variantController = require('../controllers/admin/variantController.js')
const offerController = require("../controllers/admin/offerController.js");
const bannerController = require("../controllers/admin/bannerController.js");

const session = require("../middlewares/session");

const passport = require("passport");
const upload = require("../helpers/multer.js");
const bannerUpload = require("../helpers/bannerMulter.js");
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
routes.patch("/customersBlock", customerController.customerBlock);

// Categories Management
routes
  .route("/categories")
  .get(categorieController.categories)
  .post(categorieController.addCategorie);

routes
  .route("/categories/:id")
  .delete(categorieController.deleteCategorie)
  .patch(categorieController.updateCategory);

routes.patch("/categories/toggle-status/:id", categorieController.unList);

// Brand Management
routes
  .route("/brands")
  .get(brandController.getBranchPage)
  .post(upload.single("logo"), brandController.addBrands)
  .delete(brandController.deleteBrand)
  .patch(brandController.Ablock);

routes.patch("/brands/:id", upload.single("logo"), brandController.updateBrand);

// Product Management
routes
  .route("/products")
  .get(productController.getProductsPage)
  .post(productController.addProduct)
  .patch(productController.toggleStatus)
  .delete(productController.deleteProduct);

routes.patch('/products/:id' , productController.editProduct)

routes
      .route("/products/Details/:id")
      .get(productController.loadProductDetails);

// Variant Management
routes.post("/products/:id/variants", variantController.addVariants);
routes.put("/products/variants/edit/:id", variantController.editVariants);
routes.delete("/products/variants/delete/:id", variantController.deleteVariants);
routes.get("/products/variants/delete/:id", variantController.deleteVariants);
routes.post('/products/variants/check-sku' , variantController.checkSKU)


// Variant Image Management
routes.post("/products/variants/:variantId/images", variantController.uploadVariantImage);
routes.delete("/products/variants/:variantId/images", variantController.deleteVariantImage);

//Offer Management
routes.route("/offers")
       .get(offerController.loadOfferPage)
        .post(offerController.addOffer)
        .delete(offerController.deleteOffer)
        .patch(offerController.editOffer);

// New Routes for Offer Validations
routes.post("/offers/check-code", offerController.checkOfferCode);
routes.post("/offers/check-Date", offerController.checkDate);
routes.post("/offers/check-discount", offerController.checkDiscount);

// Banner Management
routes
  .route("/banner")
  .get(bannerController.getBannerPage)
  .post(bannerUpload.single("image"), bannerController.addBanner)
  .put(bannerUpload.single("image"), bannerController.updateBanner)
  .delete(bannerController.deleteBanner);

// New Route for Banner Order Validation
routes.post('/banner/check-order' , bannerController.checkBannerOrder);
routes.post('/banner/check-Date', bannerController.checkDate);

// Orders Management
routes.get("/orders", categorieController.categories);

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
