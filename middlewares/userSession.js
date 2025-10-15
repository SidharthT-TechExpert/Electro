const session = require("express-session");
require("dotenv").config();

const userSession = session({
  name: "user.sid",
  secret: process.env.SESSION_SECRET_USER,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60, // 1 hour
    secure: false,           // true if HTTPS
    sameSite: "lax",         // needed for AJAX
  },
});

module.exports = userSession;
