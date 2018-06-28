const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// const md5 = require("md5");

const UserSchema = mongoose.Schema(
  {
    firstname: String,
    lastname: String,
    username: String,
    password: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    dateOfBirth: Date,
    logs: {
      LastLogin: Date,
      lastPassword_reset: Date
    },
    state: {
      online: Boolean,
      available: Boolean
    },
    salt: String,
    contacts: [],
    occupation: String,
    age: String,
    company: String,
    sex: String,
    address: String,
    avatar: String,
    avatarUrl: String,
    following: [],
    blocked: [],
    followers: [],
    subscriptionsUrl: String,
    organizationsUrl: String,
    role: String,
    uploads: [],
    status: String,
    role: Number,
    bio: String,
    isAdmin: Boolean
  },
  {
    timestamps: true
  }
);

// on every save, add the date
UserSchema.pre('save', function save(next) {
  const user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        return next(err);
      }
      user.password = hash;
      next();
    });
  });
});

UserSchema.index({
  firstname: 'text',
  lastname: 'text',
  username: 'text'
});

const User = mongoose.model('User', UserSchema);

module.exports = User;

/**
 * Helper method for getting user's gravatar.
 */
// UserSchema.methods.gravatar = function gravatar(size) {
//   if (!size) {
//     size = 200;
//   }j
//   if (!this.email) {
//     return `https://gravatar.com/avatar/?s=${size}&d=retro`;
//   }
//   const hash = md5(this.email);
//   return `https://gravatar.com/avatar/${hash}?s=${size}&d=retro`;
// };
// //set full name virtual
// UserSchema.virtual("name.full").get(function () {
//   return this.firstname + " " + this.lastname;
// });

module.exports.comparePassword = (password, hash, callback) => {
  bcrypt.compare(password, hash, (err, isMatch) => {
    if (err) throw err;
    callback(null, isMatch);
  });
};
