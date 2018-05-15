var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const config = require('config')

var loginRouter = require('./routes/login')
var userRouter = require('./routes/user')

var app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    cookie: { maxAge: 2 * 60 * 60 * 1000 },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
    secure: false, // TODO set to true when in production
    secret: config.cookieSecret,
    store: new (require('connect-pg-simple')(session))(),
  }),
)
app.use(function ensureLoggedIn(req, res, next) {
  if (!req.path.startsWith('/login') && !req.session.user)
    return res.status(401).json('Unauthorized')

  next()
})

app.use('/login', loginRouter)
app.use('/user', userRouter)

module.exports = app
