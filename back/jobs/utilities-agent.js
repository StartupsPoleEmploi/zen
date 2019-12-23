const { job } = require('cron')
const winston = require('../lib/log')

require('../lib/db') // setup db connection

const cleanOldFiles = require('../lib/cleanOldFiles')
const {
  saveUnauthorizedUsersInCSV,
  saveAuthorizedUsersInCSV,
} = require('../lib/exportUserList')
const postDeclarationStatusToSlack = require('../lib/postDeclarationStatusToSlack')
const { importUserFromDatalake } = require('../lib/importUserFromDatalake')

winston.info('Starting utilities agent')

// Every sunday at 2:30
job('0 30 2 * * 1', cleanOldFiles, null, true, 'Europe/Paris')

// Every day at 6:30
job('0 30 6 * * *', saveUnauthorizedUsersInCSV, null, true, 'Europe/Paris')
// Every day at 6:35
job('0 35 6 * * *', saveAuthorizedUsersInCSV, null, true, 'Europe/Paris')

// Every day at 6:45
job('0 45 6 * * *', importUserFromDatalake, null, true, 'Europe/Paris')

// Every day at 9, 18
job('0 0 9,18 * * *', postDeclarationStatusToSlack, null, true, 'Europe/Paris')
