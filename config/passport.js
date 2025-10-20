const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userSchema = require("../models/userSchema");
require("dotenv").config();
const generateUniqueReferralCode = require("../helpers/generateUniqueReferralCode");

// =============== GOOGLE STRATEGY FOR USER ===============
passport.use(
  "google-user",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // ✅ Added
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google-user/callback", // ✅ Must match Google Console
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;
        const name = profile.displayName || profile.name?.givenName || "User";

        if (!email) return done(new Error("Email not available"), null);

        let user = await userSchema.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (!user) {
          const myReferalCode = await generateUniqueReferralCode();
          user = new userSchema({
            name,
            email,
            googleId: profile.id,
            myReferalCode,
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// =============== GOOGLE STRATEGY FOR ADMIN ===============

passport.use(
  "google-admin",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID_ADMIN,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET_ADMIN,
      callbackURL: "http://localhost:3000/auth/google-admin/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await userSchema.findOne({ googleId: profile.id });
        console.log("Google with:", user);
        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// =============== SERIALIZE & DESERIALIZE ===============
passport.serializeUser((user, done) => {
  done(null, { id: user._id, role: user.isAdmin ? "admin" : "user" });
});

passport.deserializeUser(async (obj, done) => {
  try {
    const user = await userSchema.findById(obj.id);
    if (!user) return done(null, false);
    user.role = obj.role;
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
