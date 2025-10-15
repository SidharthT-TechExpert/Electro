const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const adminSession = session({
  secret: process.env.SESSION_SECRET_ADMIN,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL, // ✅ FIXED
    collectionName: "adminSessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true if using HTTPS
  },
});

module.exports = adminSession;
