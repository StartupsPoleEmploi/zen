const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const Raven = require('raven')

const helmet = require('helmet')
const pgConnectSimple = require('connect-pg-simple')
const csurf = require('csurf')

const { version } = require('./package.json')

const { setActiveMonth } = require('./lib/middleware/activeMonthMiddleware')
const loggerMiddleware = require('./lib/middleware/loggerMiddleware')
const {
  requireServiceUp,
  setIsServiceUp,
} = require('./lib/middleware/serviceUpMiddleware')
const winston = require('./lib/log')

const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const declarationsRouter = require('./routes/declarations')
const declarationMonthsRouter = require('./routes/declarationMonths')
const employersRouter = require('./routes/employers')

require('./lib/db') // setup db connection

const isDevEnv = process.env.NODE_ENV === 'development'
const isQaEnv = process.env.NODE_ENV === 'qa'
const isTestEnv = process.env.NODE_ENV === 'test'
const isProd = process.env.NODE_ENV === 'production'

if (!isDevEnv) {
  winston.info('Starting back')
}
if (
  isProd &&
  (config.get('bypassDeclarationDispatch') ||
    config.get('bypassDocumentsDispatch'))
) {
  const message = 'Bypasses must NOT be activated in production.'
  winston.error(message)
  throw new Error(message)
}

const app = express()

const sentryUrl = process.env.SENTRY_URL

if (sentryUrl) {
  Raven.config(sentryUrl, {
    release: version,
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
    captureUnhandledRejections: true,
  }).install()
  // Raven requestHandler must be the first middleware
  app.use(Raven.requestHandler())
}

app.use(helmet())
app.use(loggerMiddleware)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    // our sessions are long but PE token is only valid ~20 minutes
    // so we reconnect any user here over 20 minutes.
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
    secure: isProd,
    secret: config.cookieSecret,
    store: new (pgConnectSimple(session))(),
  }),
)

// Setup dev and test routes before csurf token
if (isDevEnv || isQaEnv) {
  app.use('/developer', require('./routes/developer')) // eslint-disable-line global-require
}
if (isTestEnv) {
  app.use('/tests', require('./routes/tests')) // eslint-disable-line global-require
}

if (!isTestEnv) {
  app.use(csurf())
}

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache,no-store')
  next()
})

app.use('/ping', (req, res) => res.send('pong'))

app.use(setIsServiceUp)

app.use('/status', (req, res) =>
  res.json({
    global: { up: req.isServiceUp },
    files: { up: req.isFilesServiceUp },
  }),
)

app.use((req, res, next) => {
  if (!req.path.startsWith('/login') && !req.session.user) {
    return res.status(401).json('Unauthorized')
  }

  req.user = req.session.user // For sentry reporting

  next()
})

app.use('/login', loginRouter)
app.use('/user', userRouter)

app.use(setActiveMonth)
app.use(requireServiceUp)

app.use('/declarationMonths', declarationMonthsRouter)

app.use('/declarations', declarationsRouter)
app.use('/employers', employersRouter)

if (sentryUrl) {
  app.use(Raven.errorHandler())
  // an error middleware needs 4 arguments
  app.use((err, req, res) => {
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({ code: 'EBADCSRFTOKEN' })
    } else {
      winston.error('Error caught in final middleware:', err)
      res.status(500).json({ sentry: res.sentry })
    }
  })
}

module.exports = app
