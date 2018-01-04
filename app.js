var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var session = require('express-session');
var logger = require('morgan');
var expressValidator = require('express-validator');
var passport = require('passport');
var LocalStategy = require('passport-local').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');
var config = require('./config/config.js')
var multer = require('multer')

var index = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');

//database connection
var options = {
  server: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000
    }
  },
  replset: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000
    }
  }
};

//connect to mongodb locally
mongoose.connect(config.mongo);

//connect to database mongoose.connect(config.mlab);

var db = mongoose.connection;

db.on('error', (err) => {
  console.log(err);
});

db.once('open', () => {
  console.log('connection to database established')
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({secret: config.sessionSecret, saveUninitialized: true, resave: true}));

// Express Validator
app.use(expressValidator({
  errorFormatter: (param, msg, value) => {
    const namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {param: formParam, msg: msg, value: value};
  }
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.errors = req.flash('error')
  res.locals.user = req.user;

  next();
});

app.use('/', index);
app.use('/admin', admin)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req
    .app
    .get('env') === 'development'
    ? err
    : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//set port
app.set('port', process.env.PORT || 8080);

//listen to port
app.listen(app.get('port'), function () {
  console.log('server live @ 8080!');
})
module.exports = app;