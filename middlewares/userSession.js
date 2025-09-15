const session = require("express-session");
const env = require("dotenv").config();
const userSession = session({
  name: "user.sid", // unique cookie
  secret: process.env.SESSION_SECRET_USER,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }, // 1 hour
});

module.exports = userSession;
