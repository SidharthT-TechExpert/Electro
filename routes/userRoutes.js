const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController.js');

// Home page route
router.get('/pageNotFound', userController.pageNotFound);
router.get('/signUp', userController.loadSignUpPage);
router.get('/logIn', userController.loadLogInPage);
router.get('/forgetPassword', userController.loadForgetPage);
router.get('/verify-Otp', userController.verify_otp)
router.get('/', userController.loadHomePage);

router.get("/test-flash", (req, res) => {
  req.flash("success_msg", "Flash is working!");
  res.redirect("/signUp");
});

// Post Request
router.post('/signUp', userController.signUp)
router.post('/verify-Otp', userController.Post_verify_otp)


module.exports = router;