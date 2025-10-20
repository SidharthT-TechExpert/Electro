const express = require("express");
const router = express.Router();
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
router
  .route("/login")
  .get(session.isAdmin, adminController.loadLogin)
  .post(session.isAdmin, adminController.userLogIn);

router
  .route("/forgetPass")
  .get(session.isAdmin, adminController.loadForgetPage)
  .post(session.isAdmin, adminController.forgetPass);

//Login management
router.get("/", session.isAdmin, adminController.loadLogin);
router.get("/dashboard", session.isChecker, adminController.loadDashBoardPage);
router.post("/passReset", adminController.OTP_Verify);
router.post("/resend-Otp", adminController.resend_Otp);
router.post("/update-password", adminController.updatePass);
router.get("/logOut", session.isChecker, adminController.logOut);
router.get("/pageNotFound", session.isChecker, adminController.pageNotFound);

// Customer Management
router.get("/customers", session.isChecker, customerController.customer);
router.patch(
  "/customersBlock",
  session.isChecker,
  customerController.customerBlock
);

// Categories Management
router
  .route("/categories")
  .get(session.isChecker, categorieController.categories)
  .post(session.isChecker, categorieController.addCategorie);

router
  .route("/categories/:id")
  .delete(session.isChecker, categorieController.deleteCategorie)
  .patch(session.isChecker, categorieController.updateCategory);

router.patch(
  "/categories/toggle-status/:id",
  session.isChecker,
  categorieController.unList
);

// Brand Management
router
  .route("/brands")
  .get(session.isChecker, brandController.getBranchPage)
  .post(session.isChecker, upload.single("logo"), brandController.addBrands)
  .delete(session.isChecker, brandController.deleteBrand)
  .patch(session.isChecker, brandController.Ablock);

router.patch(
  "/brands/:id",
  session.isChecker,
  upload.single("logo"),
  brandController.updateBrand
);

// Product Management
router
  .route("/products")
  .get(session.isChecker, productController.getProductsPage)
  .post(session.isChecker, productController.addProduct)
  .patch(session.isChecker, productController.toggleStatus)
  .delete(session.isChecker, productController.deleteProduct);

router.patch("/products/:id", session.isChecker, productController.editProduct);

router
  .route("/products/Details/:id")
  .get(session.isChecker, productController.loadProductDetails);

// Variant Management
router.post(
  "/products/:id/variants",
  session.isChecker,
  variantController.addVariants
);
router.put(
  "/products/variants/edit/:id",
  session.isChecker,
  variantController.editVariants
);
router.delete(
  "/products/variants/delete/:id",
  session.isChecker,
  variantController.deleteVariants
);
router.post(
  "/products/variants/check-sku",
  session.isChecker,
  variantController.checkSKU
);

// Variant Image Management
router.post(
  "/products/variants/:variantId/images",
  session.isChecker,
  variantController.uploadVariantImage
);
router.delete(
  "/products/variants/:variantId/images",
  session.isChecker,
  variantController.deleteVariantImage
);

//Offer Management
router
  .route("/offers")
  .get(session.isChecker, offerController.loadOfferPage)
  .post(session.isChecker, offerController.addOffer)
  .delete(session.isChecker, offerController.deleteOffer)
  .patch(session.isChecker, offerController.editOffer);

// New router for Offer Validations
router.post(
  "/offers/check-code",
  session.isChecker,
  offerController.checkOfferCode
);

router.post("/offers/check-Date", session.isChecker, offerController.checkDate);

router.post(
  "/offers/check-discount",
  session.isChecker,
  offerController.checkDiscount
);

// Banner Management
router
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
router.post(
  "/banner/check-order",
  session.isChecker,
  bannerController.checkBannerOrder
);

router.post(
  "/banner/check-Date",
  session.isChecker,
  bannerController.checkDate
);

// Admin Management
router.get("/manage", session.isChecker, adminController.LoadAdminPage);

// Orders Management
router.get("/orders", session.isChecker, categorieController.categories);

module.exports = router;
