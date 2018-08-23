const job = require('cron')
const { Model } = require('objection')
const Knex = require('knex')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const sendDeclarationCampaign = require('./lib/mailings/sendDeclarationCampaign')
const sendReminderCampaign = require('./lib/mailings/sendReminderCampaign')

job('0 15 1 28 * *', sendDeclarationCampaign, null, true, 'Europe/Paris')
job('0 0 7 5,13 * *', sendReminderCampaign, null, true, 'Europe/Paris')
