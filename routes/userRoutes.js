const express = require("express");
const routes = express.Router();
const passport = require("passport");
const userController = require("../controllers/user/userController.js");
const checkSession = require("../middlewares/session.js");


// Login Menagement Get
routes.get("/pageNotFound", userController.pageNotFound);

routes
  .route('/signUp')
     .get(checkSession.isAuth, userController.loadSignUpPage)
     .post(userController.signUp);
       
routes
  .route('/logIn')
     .get( userController.loadLogInPage)
     .post(checkSession.isAuth, userController.userLogIn);

routes
  .route('/forgetPass')
     .get( checkSession.isAuth, userController.loadForgetPage)
     .post(checkSession.isAuth , userController.forgetPass);

routes
  .route('/verify-Otp')
     .get( checkSession.isAuth, userController.verify_Otp)
     .post( userController.post_Verify_Otp);

routes.get("/logOut", checkSession.userLogOut, userController.logOut);
routes.get("/", checkSession.homeAuth, userController.loadHomePage);

// Post Request
routes.post("/resend-Otp", userController.resend_Otp);
routes.post("/passReset", userController.passReset);
routes.post("/update-password", userController.updatePass);

// Product Details Page route
routes.get("/products/Details/:id", userController.loadProductDetails);

// For signUp/SignIn with Google
routes.get(
  "/auth/google",
  passport.authenticate("google-user", { scope: ["profile", "email"] })
);

// User Google login
routes.get(
  "/auth/google/callback",
  passport.authenticate("google-user", { failureRedirect: "/signUp" }),
  (req, res) => {
    if (req.user) {
      req.session.userId = req.user._id;
      return res.redirect("/?auth=success");
    }
    res.redirect("/signUp?error=unauthorized");
  }
);

module.exports = routes;
