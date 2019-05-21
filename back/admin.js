const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const morgan = require('morgan')
const helmet = require('helmet')
const pgConnectSimple = require('connect-pg-simple')

const { setActiveMonth } = require('./lib/activeMonthMiddleware')
const adminRouter = require('./routes/admin')

require('./lib/db') // setup db connection

const app = express()

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
app.use(setActiveMonth)

app.use('/', adminRouter)

module.exports = app
