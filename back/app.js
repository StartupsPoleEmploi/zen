const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const Raven = require('raven')
const { Model } = require('objection')
const Knex = require('knex')
const morgan = require('morgan')
const helmet = require('helmet')

const loginRouter = require('./routes/login')
const userRouter = require('./routes/user')
const declarationsRouter = require('./routes/declarations')
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
    release: '0-0-0',
    environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
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
    store: new (require('connect-pg-simple')(session))(), // eslint-disable-line
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
