const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const Raven = require('raven')
const { Model } = require('objection')
const pg = require('pg')

const Knex = require('knex')
const morgan = require('morgan')
const helmet = require('helmet')
const pgConnectSimple = require('connect-pg-simple')
const csurf = require('csurf')
const winston = require('winston')
const slackWinston = require('slack-winston').Slack

const { version } = require('./package.json')

const { setActiveMonth } = require('./lib/activeMonthMiddleware')
const {
  requireServiceUp,
  setIsServiceUp,
} = require('./lib/serviceUpMiddleware')

const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const declarationsRouter = require('./routes/declarations')
const declarationMonthsRouter = require('./routes/declarationMonths')
const employersRouter = require('./routes/employers')

/* https://github.com/tgriesser/knex/issues/927
 * This tells node-pg to use float type for decimal
 * which it does not do because JS loses precision on
 * big decimal number.
 * For our usage, this is not an issue.
 */
const PG_DECIMAL_OID = 1700
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat)

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

winston.add(slackWinston, {
  // Send this file's logs to Slack
  webhook_url: process.env.SLACK_WEBHOOK_SU_ZEN_TECH,
  message: `*{{level}}*: {{message}}\n\n{{meta}}`,
  level: 'info',
})

if (process.env.NODE_ENV !== 'development') {
  winston.info('Starting back')
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
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
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
    secure: process.env.NODE_ENV === 'production',
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

app.use((req, res, next) => {
  if (!req.path.startsWith('/login') && !req.session.user)
    return res.status(401).json('Unauthorized')

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
    winston.error(err)
    res.status(500).json({
      sentry: res.sentry,
    })
  })
}

module.exports = app
