const multer = require('multer');
const path = require('path');

const Upload = require('../models/Upload');
const User = require('../models/User');

exports.getUploadAvatar = (req, res, next) => {
  res.json('upload video, expecting an video file, title and description');
};

exports.postUploadAvatar = (req, res, next) => {
  if (!req.files) {
    return res.json('upload a file');
  }
  const avatar = new Upload({
    files: req.files,
    owner: req.user ? req.user.id : 'no owner'
  });

  Upload.create(avatar, (err, avatar) => {
    if (err) {
      return next(err);
    }
    User.findById(req.user.id, (err, user) => {
      if (err) throw err;
      user.avatar = avatar.files.path;
      user.save(err => {
        if (err) throw err;
        console.log(req.user.avatar, avatar.files.path, 'user');
      });
    });
    res.json(avatar);
  });
};

exports.getUploadResume = (req, res, next) => {
  res.render('resume');
};

exports.postUploadResume = (req, res, next) => {
  let { description, title } = req.body;

  console.log(req.files);
  const resume = new Upload({
    description,
    title,
    category: 'resume',
    files: req.files,
    owner: req.user ? req.user.id : 'no owner'
  });

  Upload.create(resume, (err, resume) => {
    if (err) {
      return next(err);
    }
    res.json(resume);
  });
};

exports.getResumes = (req, res, next) => {
  Upload.find({ category: 'resume' }, (err, resumes) => {
    const filteredResumes = resumes.filter(resume => {
      return resume.owner === req.user.id;
    });
    res.json(filteredResumes);
  });
};

exports.downloadResume = (req, res, next) => {
  if (!req.user._id) {
    return res.status(401).json('not authorized!');
  }
  Upload.findById(req.params.id, (err, resume) => {
    // console.log(resume.files[0].path);
    const filePath = resume.files[0].path;
    res.sendFile(path.join(__dirname, '../', filePath));
  });
};

exports.deleteResume = (req, res, next) => {
  // if (!req.user) {
  //   res.status(401).json('not authorized!');
  // }

  let query = {
    _id: req.params.id
  };
  Upload.findById(req.params.id, (err, resume) => {
    // console.log(resume.owner, req.user._id);
    Upload.remove(query, err => {
      if (err) {
        return next(err);
      }
      Upload.find({ category: 'resume' }, (err, resumes) => {
        const filteredResumes = resumes.filter(resume => {
          return resume.owner === req.user.id;
        });
        res.json(filteredResumes);
      });
    });
  });
};

exports.getUploadVideo = (req, res, next) => {
  res.json('upload video, expecting an video file, title and description');
};

exports.postUploadVideo = (req, res, next) => {
  let { description, title } = req.body;

  path = req.file.path;
  name = req.file.originalname;

  const video = new Upload({
    description,
    title,
    path,
    name,
    owner: req.user ? req.user.id : 'Anonymous'
  });
  Upload.create(video, (err, video) => {
    if (err) {
      console.error(err);
    }
    console.log(video);
    res.json(video);
  });
};
