const { job } = require('cron')
const winston = require('../lib/log')

require('../lib/db') // setup db connection

const cleanOldFiles = require('../lib/cleanOldFiles')
const {
  saveUnauthorizedUsersInCSV,
  saveAuthorizedUsersInCSV,
} = require('../lib/exportUserList')

winston.info('Starting utilities agent')

// Every sunday at 2:30
job('0 30 2 * * 1', cleanOldFiles, null, true, 'Europe/Paris')

// Every day at 6:30
job('0 30 6 * * *', saveUnauthorizedUsersInCSV, null, true, 'Europe/Paris')

// Every day at 6:35
job('0 35 6 * * *', saveAuthorizedUsersInCSV, null, true, 'Europe/Paris')
