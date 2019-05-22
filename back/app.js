const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const Raven = require('raven')

const morgan = require('morgan')
const helmet = require('helmet')
const pgConnectSimple = require('connect-pg-simple')
const csurf = require('csurf')

const { version } = require('./package.json')

const { setActiveMonth } = require('./lib/activeMonthMiddleware')
const {
  requireServiceUp,
  setIsServiceUp,
} = require('./lib/serviceUpMiddleware')
const winston = require('./lib/log')

const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const declarationsRouter = require('./routes/declarations')
const declarationMonthsRouter = require('./routes/declarationMonths')
const employersRouter = require('./routes/employers')
const developerRouter = require('./routes/developer')

require('./lib/db') // setup db connection

const isDevEnv = process.env.NODE_ENV === 'development'
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
app.use(morgan(isDevEnv ? 'dev' : 'combined'))
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
app.use(csurf())

app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache,no-store')
  next()
})

app.use('/ping', (req, res) => res.send('pong'))

app.use(setIsServiceUp)

app.use('/status', (req, res) => res.json({ up: req.isServiceUp }))

if (isDevEnv) {
  app.use('/developer', developerRouter)
}

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
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    winston.error('Error caught in final middleware:', err)
    res.status(500).json({
      sentry: res.sentry,
    })
  })
}

module.exports = app
