/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

const { Model } = require('objection')
const config = require('config')
const Knex = require('knex')
const winston = require('winston')
const slackWinston = require('slack-winston').Slack
const sendDocuments = require('./lib/headless-pilot/sendDocuments')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

winston.add(slackWinston, {
  // Send this file's logs to Slack
  webhook_url: process.env.SLACK_WEBHOOK_SU_ZEN_TECH,
  message: `*{{level}}*: {{message}}\n\n{{meta}}`,
})

const Declaration = require('./models/Declaration')

const declarationFileFields = [
  'internshipDocument',
  'sickLeaveDocument',
  'maternityLeaveDocument',
  'retirementDocument',
  'invalidityDocument',
]

const { shouldTransmitDataToPE } = config

if (!shouldTransmitDataToPE) {
  console.log('pe-agent is deactivated.')
  process.exit()
}
winston.info('Starting pe-agent')

/*
   * Summary of this scary-as-hell query:
   * Select all declarations and eagerly get all possible types of documents
   * All the joins and where clauses have for only objective to query declarations
   * for which there are documents left to send.
   * The group by is used because we have multiple left joins which could match
   * multiple times the same declaration.
   */
const getDeclarationBaseQuery = () =>
  Declaration.query()
    .eager(
      `[${declarationFileFields.join(
        ', ',
      )}, declarationMonth, employers.document, user]`,
    )
    .join('Employers', 'Declarations.id', 'Employers.declarationId')
    .join(
      'documents as employersDocuments',
      'Employers.documentId',
      'employersDocuments.id',
    )
    .leftJoin(
      'documents as internshipDocuments',
      'Declarations.internshipDocumentId',
      'internshipDocuments.id',
    )
    .leftJoin(
      'documents as sickLeaveDocuments',
      'Declarations.sickLeaveDocumentId',
      'sickLeaveDocuments.id',
    )
    .leftJoin(
      'documents as maternityLeaveDocuments',
      'Declarations.maternityLeaveDocumentId',
      'maternityLeaveDocuments.id',
    )
    .leftJoin(
      'documents as retirementDocuments',
      'Declarations.retirementDocumentId',
      'retirementDocuments.id',
    )
    .leftJoin(
      'documents as invalidityDocuments',
      'Declarations.invalidityDocumentId',
      'invalidityDocuments.id',
    )
    .where(function() {
      this.where('internshipDocuments.isTransmitted', false)
        .orWhere('sickLeaveDocuments.isTransmitted', false)
        .orWhere('maternityLeaveDocuments.isTransmitted', false)
        .orWhere('retirementDocuments.isTransmitted', false)
        .orWhere('invalidityDocuments.isTransmitted', false)
        .orWhere('employersDocuments.isTransmitted', false)
    })

const transmitAllDocuments = () =>
  getDeclarationBaseQuery()
    .andWhere({
      isFinished: true,
    })
    .groupBy('Declarations.id')
    // Note: This sends back declarations for which there are documents left to send, but some
    // documents could already have been transfered, so we make sure we filter in sendDocuments.
    .then(async (declarations) => {
      for (const declaration of declarations) {
        try {
          winston.info(
            `Gonna send documents from declaration ${declaration.id}`,
          )
          await sendDocuments(declaration)
        } catch (e) {
          winston.error(
            `Error sending some documents from declaration ${declaration.id}`,
          )
        }
      }
    })

let isWorking = false

// Always transmit declarations before documents.
// Declaration have a limited time to be done, documents can be done afterwards
const initActions = () => {
  if (isWorking) return
  isWorking = true
  return transmitAllDocuments()
    .then(() => {
      isWorking = false
    })
    .catch((e) => {
      winston.error('Error in transmission process', e)
      isWorking = false
    })
}

setInterval(initActions, 600000) // every 10 minutes
initActions()
