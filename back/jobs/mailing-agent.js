const config = require('config')
const { job } = require('cron')

require('../lib/db') // setup db connection

if (
  !config.get('shouldSendCampaignEmails') &&
  !config.get('shouldSendTransactionalEmails')
) {
  console.log('Mailing Agent is deactivated.')
  process.exit()
}

const sendDeclarationCampaign = require('../lib/mailings/sendDeclarationCampaign')
const sendDeclarationReminderCampaign = require('../lib/mailings/sendDeclarationReminderCampaign')
const sendDocsReminderCampaign = require('../lib/mailings/sendDocsReminderCampaign')
const sendDeclarationConfirmationEmails = require('../lib/mailings/sendDeclarationConfirmationEmails')
const sendDocumentsConfirmationEmails = require('../lib/mailings/sendDocumentsConfirmationEmails')

console.log('Starting mailing agent')

if (config.get('shouldSendCampaignEmails')) {
  job('0 0 9 27 * *', sendDeclarationCampaign, null, true, 'Europe/Paris')
  job(
    '0 0 9 6,10,14 * *',
    sendDeclarationReminderCampaign,
    null,
    true,
    'Europe/Paris',
  )
  job('0 0 9 6,10 * *', sendDocsReminderCampaign, null, true, 'Europe/Paris')
}

if (config.get('shouldSendTransactionalEmails')) {
  job(
    '0 * * * * *',
    sendDeclarationConfirmationEmails,
    null,
    true,
    'Europe/Paris',
  )
  job(
    '30 * * * * *',
    sendDocumentsConfirmationEmails,
    null,
    true,
    'Europe/Paris',
  )
}
