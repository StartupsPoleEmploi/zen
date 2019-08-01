const { job } = require('cron')
const winston = require('../lib/log')

require('../lib/db') // setup db connection

const cleanOldFile = require('../lib/cleanOldFiles')

winston.info('Starting utilities agent')

// Every sunday at 2:30
job('0 30 2 * * 1', cleanOldFile, null, true, 'Europe/Paris')
