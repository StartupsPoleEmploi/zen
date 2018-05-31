var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
const session = require('express-session')
const config = require('config')
const Raven = require('raven')

var loginRouter = require('./routes/login')
var userRouter = require('./routes/user')
var declarationsRouter = require('./routes/declarations')
var employersRouter = require('./routes/employers')

var app = express()

const sentryUrl = process.env.SENTRY_URL

if (sentryUrl) {
  Raven.config(sentryUrl, {
    release: '0-0-0',
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
  }).install()
}

// Raven requestHandler must be the first middleware
app.use(Raven.requestHandler())

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
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
app.use('/declarations', declarationsRouter)
app.use('/employers', employersRouter)

app.use(Raven.errorHandler())
app.use((err, req, res, next) => res.status(500).json({ sentry: res.sentry }))

module.exports = app
