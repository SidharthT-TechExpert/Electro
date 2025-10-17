const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();

const adminSession = session({
  secret: process.env.SESSION_SECRET_ADMIN,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "adminSessions",
    ttl: 4 * 60 * 60, // 1 day in seconds
  }),
  cookie: {
    maxAge: 4 * 60 * 60 * 1000, // 4hrs
    httpOnly: true,
    sameSite: "lax",
    secure: false, // true if using HTTPS
  },
});

module.exports = adminSession;
