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
const csurf = require('csurf')

const { version } = require('./package.json')

const { setActiveMonth } = require('./lib/activeMonthMiddleware')

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
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  session({
    cookie: { maxAge: 20 * 60 * 1000 }, // 20 short minutes for now T_T
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
    secure: process.env.NODE_ENV === 'production',
    secret: config.cookieSecret,
    store: new (pgConnectSimple(session))(),
  }),
)
app.use(csurf())

app.use('/ping', (req, res) => res.send('pong'))

app.use((req, res, next) => {
  if (!req.path.startsWith('/login') && !req.session.user)
    return res.status(401).json('Unauthorized')

  req.user = req.session.user // For sentry reporting

  next()
})

app.use('/login', loginRouter)
app.use('/user', userRouter)

app.use(setActiveMonth)

app.use('/declarationMonths', declarationMonthsRouter)

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
