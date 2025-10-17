const express = require("express");
const routes = express.Router();
const adminController = require("../controllers/admin/adminController");
const customerController = require("../controllers/admin/customerController");
const categorieController = require("../controllers/admin/categorieController.js");
const brandController = require("../controllers/admin/brandController.js");
const productController = require("../controllers/admin/productController.js");
const variantController = require("../controllers/admin/variantController.js");
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
  .post(session.isAdmin, adminController.userLogIn);

routes
  .route("/forgetPass")
  .get(session.isAdmin, adminController.loadForgetPage)
  .post(session.isAdmin, adminController.forgetPass);

//Login management
routes.get("/", session.isAdmin, adminController.loadLogin);
routes.get("/dashboard", session.isChecker, adminController.loadDashBoardPage);
routes.post("/passReset", adminController.OTP_Verify);
routes.post("/resend-Otp", adminController.resend_Otp);
routes.post("/update-password", adminController.updatePass);
routes.get("/logOut", session.isChecker, adminController.logOut);
routes.get("/pageNotFound", session.isChecker, adminController.pageNotFound);

// Customer Management
routes.get("/customers", session.isChecker, customerController.customer);
routes.patch(
  "/customersBlock",
  session.isChecker,
  customerController.customerBlock
);

// Categories Management
routes
  .route("/categories")
  .get(session.isChecker, categorieController.categories)
  .post(session.isChecker, categorieController.addCategorie);

routes
  .route("/categories/:id")
  .delete(session.isChecker, categorieController.deleteCategorie)
  .patch(session.isChecker, categorieController.updateCategory);

routes.patch(
  "/categories/toggle-status/:id",
  session.isChecker,
  categorieController.unList
);

// Brand Management
routes
  .route("/brands")
  .get(session.isChecker, brandController.getBranchPage)
  .post(session.isChecker, upload.single("logo"), brandController.addBrands)
  .delete(session.isChecker, brandController.deleteBrand)
  .patch(session.isChecker, brandController.Ablock);

routes.patch(
  "/brands/:id",
  session.isChecker,
  upload.single("logo"),
  brandController.updateBrand
);

// Product Management
routes
  .route("/products")
  .get(session.isChecker, productController.getProductsPage)
  .post(session.isChecker, productController.addProduct)
  .patch(session.isChecker, productController.toggleStatus)
  .delete(session.isChecker, productController.deleteProduct);

routes.patch("/products/:id", session.isChecker, productController.editProduct);

routes
  .route("/products/Details/:id")
  .get(session.isChecker, productController.loadProductDetails);

// Variant Management
routes.post(
  "/products/:id/variants",
  session.isChecker,
  variantController.addVariants
);
routes.put(
  "/products/variants/edit/:id",
  session.isChecker,
  variantController.editVariants
);
routes.delete(
  "/products/variants/delete/:id",
  session.isChecker,
  variantController.deleteVariants
);
routes.post(
  "/products/variants/check-sku",
  session.isChecker,
  variantController.checkSKU
);

// Variant Image Management
routes.post(
  "/products/variants/:variantId/images",
  session.isChecker,
  variantController.uploadVariantImage
);
routes.delete(
  "/products/variants/:variantId/images",
  session.isChecker,
  variantController.deleteVariantImage
);

//Offer Management
routes
  .route("/offers")
  .get(session.isChecker, offerController.loadOfferPage)
  .post(session.isChecker, offerController.addOffer)
  .delete(session.isChecker, offerController.deleteOffer)
  .patch(session.isChecker, offerController.editOffer);

// New Routes for Offer Validations
routes.post(
  "/offers/check-code",
  session.isChecker,
  offerController.checkOfferCode
);

routes.post("/offers/check-Date", session.isChecker, offerController.checkDate);

routes.post(
  "/offers/check-discount",
  session.isChecker,
  offerController.checkDiscount
);

// Banner Management
routes
  .route("/banner")
  .get(session.isChecker, bannerController.getBannerPage)
  .post(
    session.isChecker,
    bannerUpload.single("image"),
    bannerController.addBanner
  )
  .put(
    session.isChecker,
    bannerUpload.single("image"),
    bannerController.updateBanner
  )
  .delete(session.isChecker, bannerController.deleteBanner);

// New Route for Banner Order Validation
routes.post(
  "/banner/check-order",
  session.isChecker,
  bannerController.checkBannerOrder
);

routes.post(
  "/banner/check-Date",
  session.isChecker,
  bannerController.checkDate
);

// Admin Management
routes.get("/manage", session.isChecker, adminController.LoadAdminPage);

// Orders Management
routes.get("/orders", session.isChecker, categorieController.categories);

// ---------- Admin Google Login ----------
routes.get(
  "/auth/google",
  passport.authenticate("google-admin", { scope: ["profile", "email"] })
);

routes.get(
  "/auth/google/callback",
  passport.authenticate("google-admin", { failureRedirect: "/admin/login" }),
  (req, res) => {
    req.session.adminId = req.user._id;
    res.redirect("/admin/dashboard?auth=success");
  }
);


module.exports = routes;
