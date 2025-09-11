const HTTP_STATUS = require("../../config/statusCodes.js");
const userSchema = require("../../models/userSchema.js");
const nodemailer = require("nodemailer");
const env = require("dotenv").config();

// Home page Loader
const loadHomePage = async (req, res) => {
  try {
    res.render("home", { user: req?.user, cartCount: req.cartCount || 2 });
  } catch (error) {
    console.error("Error loading home page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// 404 Page Not Found
const pageNotFound = async (req, res) => {
  try {
    res.render("page-404", {
      user: req.user || { name: "Guest" },
      cartCount: req.cartCount || 2,
    });
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).redirect("/pageNotFound");
  }
};

// Sign Up Page Loader
const loadSignUpPage = async (req, res) => {
  try {
    res.render("signUp", { user: req?.user || null , cartCount: req?.cartCount || 2 });
  } catch (error) {
    console.error("Error loading sign-up page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// Log In Page Loader
const loadLogInPage = async (req, res) => {
  try {
    res.render("logIn", { user: req?.user, cartCount: req?.cartCount || 2 });
  } catch (error) {
    console.error("Error loading log-in page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// Forget Password Page Loader
const loadForgetPage = async (req, res) => {
  try {
    res.render("forgetpass", {
      user: req?.user,
      cartCount: req?.cartCount || 2,
    });
  } catch (error) {
    console.error("Error loading forget password page:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send("Internal Server Error");
  }
};

// OTP Generater
const generateOtp = () => {
  return Math.floor(10000 + Math.random() * 900000).toString();
};

//Email through OTP Send
const sendVerificationEmail = async (email, OTP) => {
  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });
    const info = await transport.sendMail({
      form: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verify your account",
      text: `Your OTP is ${OTP} `,
      html: `<b>Your OTP:${OTP}</b>`,
    });
    return info.accepted.length > 0;
  } catch (error) {
    console.error("Error Sending email :", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send("Internal Server Error!");
  }
};

// SignUp
const signUp = async (req, res) => {
  const { name, email, phone, password, cPassword, rememberMe } = req.body;
  try {
    if (password != cPassword) {
      return res.render("signUp", { message: "Password do not match!" });
    }
    const findUser = await userSchema.findOne({ email });

    if (findUser) {
      return res.render("signUp", {
        message: "User with this email already exist",
      });
    }

    const OTP = generateOtp();
    const emailSend = await sendVerificationEmail(email, OTP);

    if (!emailSend) {
      return res.json("email-error");
    }
    req.session.userOtp = OTP;
    req.session.userData = { email, password, name, phone, rememberMe };

    //res.status(HTTP_STATUS.OK).render("Verify-otp");
    console.log("OTP Sent ",OTP);
  } catch (error) {
    console.error("SignUp Error :", error);
    res.redirect("/pageNotFound");
  }
};

module.exports = {
  loadHomePage,
  pageNotFound,
  loadSignUpPage,
  loadLogInPage,
  loadForgetPage,
  signUp,
};
