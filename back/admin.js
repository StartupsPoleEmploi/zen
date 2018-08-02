const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const { Model } = require('objection')
const Knex = require('knex')
const morgan = require('morgan')
const helmet = require('helmet')
const adminRouter = require('./routes/admin')
const pgConnectSimple = require('connect-pg-simple')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

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
app.use('/', adminRouter)

module.exports = app
