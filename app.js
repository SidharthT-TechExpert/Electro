//Electro Shop Application
const express = require("express");
const env = require("dotenv").config();
const connectDB = require("./config/db");
const path = require("path");
const ejs = require("ejs");
const session = require("express-session");
const flash = require("connect-flash");

const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const passport = require("./config/passport.js");

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Try connect-flash (if it works with your setup)
app.use(flash());

// Fallback flash: if req.flash is not a function (e.g. connect-flash incompatible),
// create a tiny flash implementation that uses req.session._flash
app.use((req, res, next) => {
  if (!req.session) return next(new Error("Session is not initialized"));

  if (typeof req.flash !== "function") {
    req.flash = function (type, msg) {
      // getter: req.flash(type) => returns array and clears it
      if (typeof msg === "undefined") {
        if (req.session._flash && req.session._flash[type]) {
          const arr = req.session._flash[type];
          delete req.session._flash[type];
          return arr;
        }
        return [];
      }
      // setter: req.flash(type, msg)
      req.session._flash = req.session._flash || {};
      req.session._flash[type] = req.session._flash[type] || [];
      req.session._flash[type].push(msg);
    };
  }

  next();
});

// Expose flash messages to views (works with connect-flash or fallback)
app.use((req, res, next) => {
  if (req.session && req.session._flash) {
    // use fallback stored messages (do not call req.flash here because it already removes)
    res.locals.success_msg = req.session._flash.success_msg || [];
    res.locals.error_msg = req.session._flash.error_msg || [];
    res.locals.error = req.session._flash.error || [];
    // clear them after exposing
    delete req.session._flash.success_msg;
    delete req.session._flash.error_msg;
    delete req.session._flash.error;
  } else if (typeof req.flash === "function") {
    // connect-flash style (this will consume messages)
    res.locals.success_msg = req.flash("success_msg") || [];
    res.locals.error_msg = req.flash("error_msg") || [];
    res.locals.error = req.flash("error") || [];
  } else {
    res.locals.success_msg = [];
    res.locals.error_msg = [];
    res.locals.error = [];
  }

  // ensure arrays (helps templates that iterate)
  res.locals.success_msg = Array.isArray(res.locals.success_msg)
    ? res.locals.success_msg
    : res.locals.success_msg
    ? [res.locals.success_msg]
    : [];
  res.locals.error_msg = Array.isArray(res.locals.error_msg)
    ? res.locals.error_msg
    : res.locals.error_msg
    ? [res.locals.error_msg]
    : [];
  res.locals.error = Array.isArray(res.locals.error)
    ? res.locals.error
    : res.locals.error
    ? [res.locals.error]
    : [];

  next();
});

app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views/user"),
  path.join(__dirname, "views/admin"),
  path.join(__dirname, "views/partials"),
]);
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", userRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);



app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

connectDB();
module.exports = app;
