const config = require('config')
const { job } = require('cron')
const { Model } = require('objection')
const Knex = require('knex')

if (!config.get('shouldSendReminderEmails')) {
  console.log('Mailing Agent is deactivated.')
  process.exit()
}

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const sendDeclarationCampaign = require('./lib/mailings/sendDeclarationCampaign')
const sendDeclarationReminderCampaign = require('./lib/mailings/sendDeclarationReminderCampaign')
const sendDocsReminderCampaign = require('./lib/mailings/sendDocsReminderCampaign')

console.log('Starting mailing agent')

job('0 0 7 28 * *', sendDeclarationCampaign, null, true, 'Europe/Paris')
job(
  '0 0 7 7,11 * *',
  sendDeclarationReminderCampaign,
  null,
  true,
  'Europe/Paris',
)
job('0 0 7 7,11 * *', sendDocsReminderCampaign, null, true, 'Europe/Paris')
