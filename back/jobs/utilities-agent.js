const { job } = require('cron')

require('../lib/db') // setup db connection

const cleanOldFile = require('../lib/cleanOldFiles')

console.log('Starting utilities agent')

// Every sunday at 2:30
job('0 30 2 * * 1', cleanOldFile, null, true, 'Europe/Paris')
