const config = require('config')
const { job } = require('cron')
const { Model } = require('objection')
const Knex = require('knex')
const pg = require('pg')

if (
  !config.get('shouldSendCampaignEmails') &&
  !config.get('shouldSendTransactionalEmails')
) {
  console.log('Mailing Agent is deactivated.')
  process.exit()
}

/* https://github.com/tgriesser/knex/issues/927
 * This tells node-pg to use float type for decimal
 * which it does not do because JS loses precision on
 * big decimal number.
 * For our usage (salary), this is not an issue.
 */
const PG_DECIMAL_OID = 1700
pg.types.setTypeParser(PG_DECIMAL_OID, parseFloat)

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const sendDeclarationCampaign = require('./lib/mailings/sendDeclarationCampaign')
const sendDeclarationReminderCampaign = require('./lib/mailings/sendDeclarationReminderCampaign')
const sendDocsReminderCampaign = require('./lib/mailings/sendDocsReminderCampaign')
const sendDeclarationConfirmationEmails = require('./lib/mailings/sendDeclarationConfirmationEmails')
const sendDocumentsConfirmationEmails = require('./lib/mailings/sendDocumentsConfirmationEmails')

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
