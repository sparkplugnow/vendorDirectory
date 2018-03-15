var express = require('express');
var router = express.Router();
var passport = require('passport')
var multer = require('multer')

//Schemas
var User = require('../models/user');


var passportConfig = require('../config/passport.js');

/***MULTER */
var multer = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    var originalname = file.originalname;
    var extension = originalname.split(".");
    filename = originalname + Date.now() + '.' + extension[extension.length - 1];
    cb(null, filename);
  }
});
function fileFilter(req, file, cb) {
  var type = file.mimetype;
  var typeArray = type.split("/");
  if (typeArray[0] == "image") {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
var upload = multer({
  storage: storage,
  dest: "uploads/avatars",
  fileFilter: fileFilter
});

/****MULTER */
router.get('/',(req,res)=>{
  res.send('routes are <br> <a href="login">/login<a> ,<br> <a href="login">/register<a>,<br> <a href="update">/update')
})

const getRouteFn = (route) => {
  router.get(`/${route}`, (req, res) => res.json(`${route} page`))
}

//getRouteFn('login')
//getRouteFn('update')
//getRouteFn('register')

router.get('/dashboard', (req, res, next) => {
  res.json({
    user: req.user
  });
});

router.get("/login", (req, res, next) => {
  res.render('login');
});
 router.get("/register", (req, res, next) => {
   res.render("register");
 });
 router.get("/update", (req, res, next) => {
   res.render("update");
 });

// router.get('/:username', (req, res, next) => {
//   User
//     .find({username: req.params.username},(err, user) => {
//       res.json({user:user})
//     })
// })

router.get('/users', (req, res, next) => {
  User.find((err, users) => {
    res.json(users)
  })
})

/****REGISTER USER */
router.post('/register', upload.single('avatar'), (req, res, next) => {
  const {
    name,
    username,
    email,
    password,
    password2,
    role
  } = req.body;
 // var avatar = req.file.avatar;
  //console.log(avatar)
  const newUser = new User({
    name,
    username,
    email,
    password,
    password2,
    role,
    admin: false,
   // avatar: {
   //   name: req.file.originalname,
   //   path: req.file.path
   // }
  })
  User.findOne({
    email: req.body.email
  }, (err, existingUser) => {
    if (err) {
      console.error(err);
    }
    if (existingUser) {

      return res.redirect('/register');
    }
    User.createUser(newUser, (err, user) => {
      if (err) {
        console.error(err);
      }
      console.log(user);
      res.redirect('/login');
    });
  })
})

/****UPDATE USER */
router.post('/update', upload.single('avatar'), (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      console.error(err)
    }
    var {
      name,
      username,
      email,
      password
    } = req.body;
    var avatar = {
      name: req.file.originalname,
      path: req.file.path
    }
    user.name = name,
      user.username = username,
      user.email = email,
      user.password = password,
      user.avatar = avatar
    user.save((err) => {
      if (err) {
        console.error(err);
        return res.redirect('/update');
      }
      res.redirect('/dashboard');
    });
  });
})

/****LOGIN USER */
passportConfig.passportUser()

router.post('/login', passport.authenticate('user-local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res) {
 // console.log(req.body)
  res.redirect('/dashboard');
});

/****LOGOUT */
router.get('/logout', (req, res, next) => {
  req.logout();
  res.redirect('/')
})

/*****AUTH USER */
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}
module.exports = router;
