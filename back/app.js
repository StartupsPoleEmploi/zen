var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');

var loginRouter = require('./routes/login');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  cookie: { maxAge: 2 * 60 * 60 * 1000 },
  httpOnly: true,
  resave: false,
  saveUninitialized: false,
  secure: false, // TODO set to true when in production
  secret: process.env.COOKIE_SECRET,
  store: new (require('connect-pg-simple')(session))(),
}));

app.use('/login', loginRouter);

module.exports = app;
