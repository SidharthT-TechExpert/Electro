require("dotenv").config(); // ✅ Load .env first

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const flash = require("connect-flash");
const nocache = require("nocache");
const passport = require("./config/passport.js");
const { GridFSBucket } = require("mongodb");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Routes
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const googleRoutes = require("./routes/googleRoutes.js");

const app = express();

// -------------------- Middlewares -------------------- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());

// -------------------- Sessions -------------------- //
app.use(
  session({
    secret: process.env.SESSION_SECRET_USER,
    resave: false,
    saveUninitialized: true, // important for Google OAuth Redirecting
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL,
      collectionName: "sessions",
      ttl: 10 * 60, // 1 day in seconds
    }),
    cookie: {
      httpOnly: true,
      secure: false, // use true only in production (HTTPS)
      sameSite: "lax", // allows Google OAuth to keep session
      maxAge: 10 * 60 * 1000, // 10min
    },
  })
);

// -------------------- Flash -------------------- //
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.warning_msg = req.flash("warning_msg");
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
app.use("/product", express.static(path.join(__dirname, "public")));

// -------------------- Passport -------------------- //
app.use(passport.initialize());
app.use(passport.session());

// -------------------- MongoDB & GridFS -------------------- //
let gfs;

connectDB()
  .then(() => {
    const db = mongoose.connection.db;
    gfs = new mongoose.mongo.GridFSBucket(db, { bucketName: "profilePhotos" });
    console.log("✅ GridFSBucket initialized");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
  });

// -------------------- Routes
app.use("/auth", googleRoutes);
app.use("/", userRoutes);
app.use("/admin", adminRoutes);

// -------------------- Start Server -------------------- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
