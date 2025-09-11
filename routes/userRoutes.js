const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController.js');

// Home page route
router.get('/pageNotFound', userController.pageNotFound);
router.get('/signUp', userController.loadSignUpPage);
router.get('/logIn', userController.loadLogInPage);
router.get('/forgetPassword', userController.loadForgetPage);
router.get('/', userController.loadHomePage);

// Post Request
router.post('/signUp', userController.signUp)


module.exports = router;