// app.js
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const flash = require("connect-flash");
const nocache = require("nocache");
const passport = require("./config/passport.js");
const fs = require("fs");
const { GridFSBucket, ObjectId } = require("mongodb");
const { IncomingForm } = require("formidable");
const User = require("./models/userSchema.js");
const connectDB = require("./config/db");

// Session middlewares
const userSession = require("./middlewares/userSession.js");
const adminSession = require("./middlewares/adminSession.js");

// Routes
const userRoutes = require("./routes/userRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

const app = express();

// -------------------- Middlewares -------------------- //
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(nocache());

// -------------------- Sessions -------------------- //
app.use("/", userSession);
app.use("/admin", adminSession);

// -------------------- Flash -------------------- //
app.use(flash());
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

// -------------------- MongoDB & GridFS -------------------- //
let gfs;

connectDB()
  .then(() => {
    const db = mongoose.connection.db;
    gfs = new GridFSBucket(db, { bucketName: "profilePhotos" });
    console.log("✅ MongoDB connected & GridFSBucket initialized");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err.message);
  });

// -------------------- Routes -------------------- //
app.use("/", userRoutes);
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);

// -------------------- Start Server -------------------- //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

module.exports = app;
