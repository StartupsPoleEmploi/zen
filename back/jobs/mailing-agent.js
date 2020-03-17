const config = require('config')
const { job } = require('cron')

require('../lib/db') // setup db connection
const winston = require('../lib/log')

if (
  !config.get('shouldSendCampaignEmails') &&
  !config.get('shouldSendTransactionalEmails')
) {
  winston.info('Mailing Agent is deactivated.')
  process.exit()
}

const sendDeclarationCampaign = require('../lib/mailings/sendDeclarationCampaign')
const sendDeclarationReminderCampaign = require('../lib/mailings/sendDeclarationReminderCampaign')
const sendDeclarationReminderCampaign2Days = require('../lib/mailings/sendDeclarationReminderCampaign2Days')
const {
  sendAllDocumentsReminders,
  sendCurrentDeclarationDocsReminders,
} = require('../lib/mailings/sendDocumentReminders')
const sendDeclarationConfirmationEmails = require('../lib/mailings/sendDeclarationConfirmationEmails')
const sendCurrentDeclarationNotFinish = require('../lib/mailings/sendCurrentDeclarationNotFinish')

winston.info('Starting mailing agent')

if (config.get('shouldSendCampaignEmails')) {
  job('0 0 9 28 * *', sendDeclarationCampaign, null, true, 'Europe/Paris')
  job(
    '0 0 9 7,11 * *',
    sendDeclarationReminderCampaign,
    null,
    true,
    'Europe/Paris',
  )
  job(
    '0 0 9 14 * *',
    sendDeclarationReminderCampaign2Days,
    null,
    true,
    'Europe/Paris',
  )

  job(
    '0 0 9 10 * *',
    sendCurrentDeclarationDocsReminders,
    null,
    true,
    'Europe/Paris',
  )
  job('0 0 9 20 * *', sendAllDocumentsReminders, null, true, 'Europe/Paris')
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
    '0 0 9 6,14 * *',
    sendCurrentDeclarationNotFinish,
    null,
    true,
    'Europe/Paris',
  )
}
