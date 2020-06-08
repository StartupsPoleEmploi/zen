const express = require('express')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const config = require('config')
const helmet = require('helmet')
const pgConnectSimple = require('connect-pg-simple')

const { setActiveMonth } = require('./lib/middleware/activeMonthMiddleware')
const loggerMiddleware = require('./lib/middleware/loggerMiddleware')

require('./lib/db') // setup db connection

const app = express()

app.use(helmet())
app.use(loggerMiddleware)
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
    store: new (pgConnectSimple(session))({
      tableName : 'session_admin'
    }),
  }),
)

app.use(setActiveMonth)

app.use('/', 
  require('./routes/admin/activityLog.admin'),
  require('./routes/admin/auth.admin'),
  require('./routes/admin/conseillerHelps.admin'),
  require('./routes/admin/dashbord.admin'),
  require('./routes/admin/declarations.admin'),
  require('./routes/admin/setting.admin'),
  require('./routes/admin/useradmins.admin'),
  require('./routes/admin/users.admin'),
)

module.exports = app
