const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const userSession = session({
  secret: process.env.SESSION_SECRET_USER,
  saveUninitialized: true,
  resave: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL, // ✅ FIXED
    collectionName: "userSessions",
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true in production with HTTPS
  },
});

module.exports = userSession;
