const express = require('express');
const router = express.Router();
const passport = require('passport');
const multer = require('multer');
const jwt = require('jsonwebtoken');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const originalName = file.originalname;
    const extension = originalName.split('.');
    filename =
      originalName + Date.now() + '.' + extension[extension.length - 1];
    cb(null, filename);
  }
});

function fileFilter(req, file, cb) {
  const type = file.mimetype;
  const typeArray = type.split('/');
  if (typeArray[0] == 'image' || 'video' || 'application') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
const upload = multer({
  storage: storage,
  dest: 'uploads/',
  fileFilter: fileFilter
});

const indexController = require('../controllers/index');
const userController = require('../controllers/user');
const uploadController = require('../controllers/upload');

router.get('/', indexController.index);


router.get('/login', userController.getLogin);
router.post('/login', userController.postLogin);
router.get('/register', userController.getSignup);
router.post('/register', userController.postSignup);

// router.get(
//   '/profile',
//   passport.authenticate('jwt', { session: false }),
//   userController.getProfile
// );

// router.post(
//   '/profile/update',
//   passport.authenticate('jwt', { session: false }),
//   userController.postUpdateProfile
// );
// router.get(
//   '/profile/password',
//   passport.authenticate('jwt', { session: false }),
//   userController.getUpdatePassword
// );

// router.post(
//   '/profile/password',
//   passport.authenticate('jwt', { session: false }),
//   userController.postUpdatePassword
// );

// router.get(
//   '/profile/avatar',
//   // passport.authenticate('jwt', { session: false }),
//   uploadController.getUploadAvatar
// );

// router.post(
//   '/profile/avatar',
//   passport.authenticate('jwt', { session: false }),
//   upload.single('avatar'),
//   uploadController.postUploadAvatar
// );

module.exports = router;
