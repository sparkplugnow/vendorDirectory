var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//custom modules
var User = require('../models/users');
var Passport = require('./passport');


//signup
router.get('/register', function (req, res) {
  res.render('register');
});

//login
router.get('/login', function (req, res) {
  res.render('login');
});

router.post('/register',function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var phone = req.body.phone;
  var password = req.body.password;
var password2 = req.body.password2;


//req.body validation
req.checkBody('name', 'name is required').notEmpty();
req.checkBody('email', 'email is required').notEmpty();
req.checkBody('email', 'enter valid email eg. mail@mail.com').isEmail();
req.checkBody('password', 'password is required').notEmpty();
req.checkBody('password', 'passwords must be at least 4 characters long').isLength({ min: 4 });
req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
req.checkBody('phone', 'Kindly Enter your phone Number').notEmpty();

var errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    });
  } else {
    var newUser = new User({
      name: name,
      email: email,
      phone: phone,
      password: password,
      password2: password2,
    })

    User.createUser(newUser, function (err, user) {
      if (err) { throw err };
    });
    req.flash('success_msg', 'you are registered to login');


    res.redirect('/users/login');
  }
})
Passport.passport();

router.post('/login',
  passport.authenticate('local',
    { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
  function (req, res) {
    res.redirect('/');
  });

//logout
router.get('/logout', function (req, res) {
  req.logout();

  req.flash('success_msg', 'You are logged out');

  res.redirect('/users/login');
})


module.exports = router;
