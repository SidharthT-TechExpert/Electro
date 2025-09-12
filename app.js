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
const passport = require('./config/passport.js');

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

app.use(flash())
app.use((req, res, next) => {
  // req.flash returns an array; keep arrays so templates can iterate
  res.locals.success_msg = req.flash('success_msg') || [];
  res.locals.error_msg   = req.flash('error_msg')   || [];
  res.locals.error       = req.flash('error')       || []; // passport or other libs
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
