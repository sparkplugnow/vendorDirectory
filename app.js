const express = require('express');
const socket = require('socket.io');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const logger = require('morgan');
const expressValidator = require('express-validator');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const config = require('./config/config.js');
const multer = require('multer');
const graphqlHTTP = require('express-graphql');
// const schema = require('./schema');
const chalk = require('chalk');
const bluebird = require('bluebird');
const crypto = require('crypto');
const dotenv = require('dotenv');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const index = require('./routes/index');

/**
 * Load environment variables from .env file,store of API keys and passwords
 */
dotenv.load({ path: '.env.example' });

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || config.mongo);
mongoose.connection.on('error', err => {
  console.error(err);
  console.log(
    '%s MongoDB connection error. Please make sure MongoDB is running.',
    chalk.red('✗')
  );
  process.exit();
});
mongoose.connection.once('open', () => {
  console.log('connection to database established', chalk.green('😁'));
});

// App setup
const app = express();
//set port
app.set('port', process.env.PORT || 8080);
//listen to port
const server = app.listen(app.get('port'), function() {
  console.log(`server live @${app.get('port')}!`);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const passportConfig = require('./config/passport.js');

// bind express with graphql
// app.use(
//   '/graphql',
//   graphqlHTTP({
//     schema,
//     graphiql: true
//   })
// );
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
// Express Session
app.use(
  session({
    secret: config.sessionSecret,
    saveUninitialized: true,
    resave: true
  })
);

// Express Validator
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      const namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return { param: formParam, msg: msg, value: value };
    }
  })
);

// Passport init
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);
// Connect Flash
app.use(flash());

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.errors = req.flash('error');
  res.locals.user = req.user;

  next();
});

app.use('/', index);

/**
 * web sockets
 *
 */
// Socket setup & pass server.
const io = socket(server);

// require('./controllers/chat/SocketManager.js')(io);

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
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
//set port
app.set('port', process.env.PORT || 8080);
