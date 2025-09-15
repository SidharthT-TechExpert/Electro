// Electro Shop Application
const express = require("express");
const env = require("dotenv").config();
const path = require("path");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("connect-flash");
const nocache = require("nocache");

const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const connectDB = require("./config/db");
const passport = require("./config/passport.js");
const userSession = require("./middlewares/userSession.js");
const adminSession = require("./middlewares/adminSession.js");

const app = express();

// -------------------- Middlewares -------------------- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply user session to user routes
app.use("/", userSession, passport.initialize(), passport.session());

// Apply admin session to admin routes
app.use("/admin", adminSession, passport.initialize(), passport.session());

// Prevent caching
app.use(nocache());

// Flash messages
app.use(flash());

// Expose flash messages to EJS views
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

// -------------------- Views & Static -------------------- //
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/partials"),
]);

app.use(express.static(path.join(__dirname, "public")));

// -------------------- Routes -------------------- //
app.use("/", userRoutes);
app.use("/admin", adminRoutes);

// -------------------- Start Server -------------------- //
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
  });
});

module.exports = app;
