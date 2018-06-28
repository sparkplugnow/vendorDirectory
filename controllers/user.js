const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const passportConfig = require('../config/passport.js');

const User = require('../models/User');

exports.getLogin = (req, res) => {
  res.render('login');
};

exports.getSignup = (req, res) => {
  // res.json(
  //   'register view, if you get this after trying to register then you arent registere' +
  //     'd'
  // );
  res.render('register')
};

exports.postSignup = (req, res, next) => {
  const {
    name,
    email,
    address,
    occupation,
    company,
    username,
    password,
    confirmPassword,
    role
  } = req.body;

  const newUser = new User({
    name,
    username,
    password,
    email,
    address,
    occupation,
    company,
    role,
    isAdmin: false
  });
  User.findOne(
    {
      email: req.body.email
    },
    (err, existingUser) => {
      if (err) {
        return next(err);
      }
      if (existingUser) {
        return res.redirect('/register');
      }
      newUser.save(err => {
        if (err) {
          return next(err);
        }
        req.flash('success', {
          msg: 'your account have been registered you can now log in.'
        });
        res.redirect('/login');
      });
    }
  );
};

/**
 * POST /login
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  console.log(req.body, 'req body');
  const email = req.body.email;
  const password = req.body.password;
  const response = {};
  User.findOne(
    {
      email: req.body.email
    },
    (err, user) => {
      if (err) {
        return next(err);
      }
      if (user) {
        User.comparePassword(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            const token = jwt.sign(
              {
                data: user
              },
              config.secret,
              {
                expiresIn: 604800 // 1 week
              }
            );

            res.json({
              success: true,
              token: `Bearer ${token}`,
              user
              // user: {
              //   id: user._id,
              //   name: user.name,
              //   username: user.username,
              //   email: user.email
              // }
            });
          } else {
            return res.json({ success: false, msg: 'Wrong password' });
          }
        });
      } else {
        res.json('no such user');
      }
    }
  );
};

/**
 * GET /profle
 * Get user account
 */
exports.getProfile = (req, res) => {
  res.json(req.user);
};
exports.getAllUsers = (req, res) => {
  console.log(req.url);
  User.find({}, (err, users) => {
    res.json(users);
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      console.error(err);
    }
    let { firstname, lastname, username, occupation, email, bio } = req.body;

    (user.firstname = firstname),
      (user.lastname = lastname),
      (user.username = username),
      (user.email = email),
      (user.bio = bio),
      (user.occupation = occupation);
    user.save(err => {
      if (err) {
        return res.json(err);
      }
      User.findById(req.user.id, (err, user) => {
        return res.json(user);
      });
    });
  });
};

/**
 * GET /profile/password
 * Get update password
 */
exports.getUpdatePassword = (req, res) => {
  res.json('update password view');
};
/**
 * POST /profile/password
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err);
    }
    user.password = req.body.password;
    user.save(err => {
      if (err) {
        return next(err);
      }
      req.flash('success', { msg: 'Password has been changed.' });
      res.redirect('/login');
    });
  });
};

/////RESET PASSWORD *//////////
/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User.findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires')
    .gt(Date.now())
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        req.flash('errors', {
          msg: 'Password reset token is invalid or has expired.'
        });
        return res.redirect('/forgot');
      }
      res.render('reset', { title: 'Password Reset' });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  const resetPassword = () =>
    User.findOne({ passwordResetToken: req.params.token })
      .where('passwordResetExpires')
      .gt(Date.now())
      .then(user => {
        if (!user) {
          req.flash('errors', {
            msg: 'Password reset token is invalid or has expired.'
          });
          return res.redirect('back');
        }
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        return user.save().then(
          () =>
            new Promise((resolve, reject) => {
              req.logIn(user, err => {
                if (err) {
                  return reject(err);
                }
                resolve(user);
              });
            })
        );
      });

  const sendResetPasswordEmail = user => {
    if (!user) {
      return;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        pass: ''
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'prostus@prostus.com',
      subject: 'Your prostus account password has been changed',
      text: `Hello,\n\nThis is a confirmation that the password for your account ${
        user.email
      } has just been changed.\n`
    };
    return transporter.sendMail(mailOptions).then(() => {
      req.flash('success', { msg: 'Success! Your password has been changed.' });
    });
  };

  resetPassword()
    .then(sendResetPasswordEmail)
    .then(() => {
      if (!res.finished) res.redirect('/');
    })
    .catch(err => next(err));
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('forgot', { title: 'Forgot Password' });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  const createRandomToken = crypto
    .randomBytesAsync(16)
    .then(buf => buf.toString('hex'));

  const setRandomToken = token =>
    User.findOne({ email: req.body.email }).then(user => {
      if (!user) {
        req.flash('errors', {
          msg: 'Account with that email address does not exist.'
        });
      } else {
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user = user.save();
      }
      return user;
    });

  const sendForgotPasswordEmail = user => {
    if (!user) {
      return;
    }
    const token = user.passwordResetToken;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: '',
        pass: ''
      }
    });
    const mailOptions = {
      to: user.email,
      from: 'prostus@prostus.com',
      subject: 'Reset your password on prostus',
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, kindly ignore this email.\n`
    };
    return transporter.sendMail(mailOptions).then(() => {
      req.flash('info', {
        msg: `An e-mail has been sent to ${
          user.email
        } with further instructions.`
      });
    });
  };

  createRandomToken
    .then(setRandomToken)
    .then(sendForgotPasswordEmail)
    .then(() => res.redirect('/forgot'))
    .catch(next);
};
exports.getUsers = (req, res) => {
  User.find({}, (err, users) => {
    res.json(users);
  });
};

///*****RESET PASSWORD */

exports.searchUsers = (req, res) => {
  User.find({
    $text: {
      $search: req.query.q
    }
  }).exec((err, users) => {
    res.json(users);
  });
};

exports.getLogout = (req, res) => {
  if (req.user) {
    req.logout();
  }
  res.redirect('/');
};
