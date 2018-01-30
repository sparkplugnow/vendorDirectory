var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var User = require("../models/user");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.getUserById(id, (err, user) => {
    if (user) return done(err, user);
  });
});


module.exports.passportUser = function() {
  passport.use(
    "user-local",
    new LocalStrategy(
      {
        usernameField: "email"
      },
      (email, password, done) => {
        User.findOne(
          {
            email: email.toLowerCase()
          },
          (err, user) => {
            if (err) {
              return done(err);
            }
            if (!user) {
              return done(null, false, {
                message: `Email: ${email} not found.`
              });
            }

            //else compare password
            User.comparePassword(password, user.password, function(
              err,
              isMatch
            ) {
              if (err) {
                throw err;
              }

              if (isMatch) {
                return done(null, user);
              } else {
                return done(null, false, { message: "Incorrect password." });
              }
            });
          }
        );
      }
    )
  );
};
