const express = require("express");
const env = require("dotenv").config();
const path = require("path");
const ejs = require("ejs");
const flash = require("connect-flash");
const nocache = require("nocache");
const passport = require("./config/passport.js");

const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const connectDB = require("./config/db");

// Session middlewares
const userSession = require("./middlewares/userSession.js");
const adminSession = require("./middlewares/adminSession.js");

const app = express();

// -------------------- Middlewares -------------------- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Prevent caching
app.use(nocache());

// -------------------- Sessions  -------------------- //
// Apply sessions per scope
app.use("/", userSession);
app.use("/admin", adminSession);

// -------------------- Flash -------------------- //
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

// -------------------- Passport -------------------- //
app.use(passport.initialize());
app.use(passport.session());

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
 