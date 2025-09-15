const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const userSchema = require("../models/userSchema");
require("dotenv").config();

passport.use(
  "google-user",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        //Safely get email & name
        const email =
          profile.emails && profile.emails.length > 0
            ? profile.emails[0].value
            : null;
        const name = profile.displayName || profile.name?.givenName || "User";

        if (!email) {
          return done(new Error("Email not available in Google profile"), null);
        }

        // Check if user already exists by googleId OR email
        let user = await userSchema.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (!user) {
          // Create new user
          user = new userSchema({
            name,
            email,
            googleId: profile.id,
          });
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// ---------- Admin Google Strategy ----------
passport.use(
  "google-admin",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/admin/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await userSchema.findOne({ googleId: profile.id });

        if (!user) {
          return done(null, false, { message: "Not authorized as admin" });
        }

        if (!user.isAdmin) {
          return done(null, false, { message: "User is not an admin" });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  userSchema
    .findById(id)
    .then((user) => done(null, user))
    .catch((err) => done(err, null));
});

module.exports = passport;
