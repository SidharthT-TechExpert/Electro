const session = require("express-session");
const env = require("dotenv").config();

const adminSession = session({
  name: "admin.sid", // unique cookie
  secret: process.env.SESSION_SECRET_ADMIN,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 },
});

module.exports = adminSession;
