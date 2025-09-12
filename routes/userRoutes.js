const express = require("express");
const router = express.Router();
const userController = require("../controllers/user/userController.js");
const passport = require("passport");

// Home page route
router.get("/pageNotFound", userController.pageNotFound);
router.get("/signUp", userController.loadSignUpPage);
router.get("/logIn", userController.loadLogInPage);
router.get("/forgetPassword", userController.loadForgetPage);
router.get("/verify-Otp", userController.verify_Otp);
router.get("/", userController.loadHomePage);

// in userRoutes.js (near other routes)
router.get('/test-flash', (req, res) => {
  req.flash('error_msg', 'Test flash: this should pop up on /logIn');
  res.redirect('/logIn');
});

// Post Request
router.post("/signUp", userController.signUp);
router.post("/verify-Otp", userController.post_Verify_Otp);
router.post("/resend-Otp", userController.resend_Otp);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get('/auth/google/callback',passport.authenticate('google',{failureRedirect:'/signUp'}),(req,res)=>{
  res.redirect('/');
})

module.exports = router;
