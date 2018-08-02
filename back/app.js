const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const Raven = require('raven')
const { Model } = require('objection')
const Knex = require('knex')
const morgan = require('morgan')
const helmet = require('helmet')
const pgConnectSimple = require('connect-pg-simple')
const { version } = require('./package.json')

const activeMonthMiddleware = require('./lib/activeMonthMiddleware')

const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const declarationsRouter = require('./routes/declarations')
const declarationMonthsRouter = require('./routes/declarationMonths')
const employersRouter = require('./routes/employers')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

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
app.use(morgan('dev'))
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
    store: new (pgConnectSimple(session))(),
  }),
)

app.use('/ping', (req, res) => res.send('pong'))

app.use((req, res, next) => {
  if (!req.path.startsWith('/login') && !req.session.user)
    return res.status(401).json('Unauthorized')

  next()
})

app.use('/login', loginRouter)
app.use('/user', userRouter)

app.use(activeMonthMiddleware)

app.use('/declarationMonths', declarationMonthsRouter)

app.use((req, res, next) => {
  if (!req.activeMonth) {
    return res.status(503).json('Service unavailable (no active month)')
  }
  next()
})

app.use('/declarations', declarationsRouter)
app.use('/employers', employersRouter)

if (sentryUrl) {
  app.use(Raven.errorHandler())
  app.use((err, req, res) =>
    res.status(500).json({
      sentry: res.sentry,
    }),
  )
}

module.exports = app
