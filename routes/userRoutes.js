const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/userController.js');

// Home page route
router.get('/pageNotFound', userController.pageNotFound);
router.get('/signUp', userController.loadSignUpPage);
router.get('/', userController.loadHomePage);


module.exports = router;