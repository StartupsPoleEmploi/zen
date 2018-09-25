/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

const { Model } = require('objection')
const { getDate, subMonths, startOfDay, setDate } = require('date-fns')
const { get } = require('lodash')
const config = require('config')
const Knex = require('knex')
const sendDeclaration = require('./lib/headless-pilot/sendDeclaration')
const sendDocuments = require('./lib/headless-pilot/sendDocuments')
const sendDeclarationEmail = require('./lib/mailings/sendDeclarationEmail')
const sendDocumentsEmail = require('./lib/mailings/sendDocumentsEmail')
const {
  setDeclarationDoneProperty,
  setDocumentsDoneProperty,
} = require('./lib/mailings/manageContacts')

const isProd = process.env.NODE_ENV === 'production'

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const DeclarationMonth = require('./models/DeclarationMonth')
const Declaration = require('./models/Declaration')

const declarationFileFields = [
  'trainingDocument',
  'internshipDocument',
  'sickLeaveDocument',
  'maternityLeaveDocument',
  'retirementDocument',
  'invalidityDocument',
]

const { shouldSendPEAgentEmails, shouldTransmitDataToPE } = config

if (!shouldTransmitDataToPE) {
  console.log('pe-agent is deactivated.')
  process.exit()
}
console.log('Starting pe-agent')
if (!shouldSendPEAgentEmails) {
  console.log('pe-agent e-mails are deactivated')
}

const getActiveMonth = () =>
  DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first()

const hasDocumentsLeftToSend = (declaration) => {
  const hasMissingEmployersDocuments = declaration.employers.some(
    ({ documentId }) => !documentId,
  )
  const hasMissingDeclarationDocuments =
    (declaration.hasTrained &&
      !get(declaration, 'trainingDocument.isTransmitted')) ||
    (declaration.hasInternship &&
      !get(declaration, 'internshipDocument.isTransmitted')) ||
    (declaration.hasSickLeave &&
      !get(declaration, 'sickLeaveDocument.isTransmitted')) ||
    (declaration.hasMaternityLeave &&
      !get(declaration, 'maternityLeaveDocument.isTransmitted')) ||
    (declaration.hasRetirement &&
      !get(declaration, 'retirementDocument.isTransmitted')) ||
    (declaration.hasInvalidity &&
      !get(declaration, 'invalidityDocument.isTransmitted'))

  return hasMissingEmployersDocuments || hasMissingDeclarationDocuments
}

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
      'documents as trainingDocuments',
      'Declarations.trainingDocumentId',
      'trainingDocuments.id',
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
      this.where('trainingDocuments.isTransmitted', false)
        .orWhere('internshipDocuments.isTransmitted', false)
        .orWhere('sickLeaveDocuments.isTransmitted', false)
        .orWhere('maternityLeaveDocuments.isTransmitted', false)
        .orWhere('retirementDocuments.isTransmitted', false)
        .orWhere('invalidityDocuments.isTransmitted', false)
        .orWhere('employersDocuments.isTransmitted', false)
    })

const transmitAllDeclarations = (activeMonth) =>
  Declaration.query()
    .eager('[declarationMonth, user, employers]')
    .where({
      monthId: activeMonth.id,
      isTransmitted: false,
      // PE declaration is both declaration an work hours / salary
      hasFinishedDeclaringEmployers: true,
    })
    .then(async (declarationsToTransmit) => {
      for (const declaration of declarationsToTransmit) {
        try {
          console.log(`Gonna send declaration ${declaration.id}`)
          await sendDeclaration(declaration)
        } catch (e) {
          console.error(`Error transmitting declaration ${declaration.id}`, e)
        }
        try {
          // First set mailjet property, so declaration reminder emails won't be sent
          if (isProd) await setDeclarationDoneProperty(declaration)
          if (shouldSendPEAgentEmails) {
            if (declaration.isEmailSent) {
              console.warn(
                `Tried sending e-mail for declaration ${
                  declaration.id
                } but it was already sent!`,
              )
              continue // eslint-disable-line no-continue
            }
            await sendDeclarationEmail(declaration)
          }
        } catch (e) {
          console.error(
            `Error sending e-mail or editing contact for declaration ${
              declaration.id
            }`,
            e,
          )
        }
      }
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
          console.log(`Gonna send documents from declaration ${declaration.id}`)
          await sendDocuments(declaration)
        } catch (e) {
          console.error(
            `Error sending some documents from declaration ${declaration.id}`,
          )
        }
        try {
          // First set mailjet property, so documents reminder emails won't be sent
          if (isProd) await setDocumentsDoneProperty(declaration)
          if (shouldSendPEAgentEmails) {
            if (declaration.isEmailSent) {
              console.warn(
                `Tried sending e-mail for declaration ${
                  declaration.id
                } documents but it was already sent!`,
              )
              continue // eslint-disable-line no-continue
            }
            await sendDocumentsEmail(declaration)
          }
        } catch (e) {
          console.error(
            `Error sending e-mail or editing contact for documents from ${
              declaration.id
            }`,
            e,
          )
        }
      }
    })

// This does the same thing that transmitAllDocuments does but for old documents, and without mail.
const transmitOldDocuments = () => {
  const now = new Date()
  let dateForRequest = new Date()

  /* We want to select all declarations before the last active one
       * Ex: * On 22/10, we'd choose all declarations until august (included)
       *     * On 29/10, we'd choose all declarations until september (included)
       *
       * We'll do that by selecting declarations by their creation date
       * Ex: * All declarations until august included were created before the 15/09 23:59:59
       *     * All declarations until september included were created before the 15/10 23:59:59
       * and so on
       */

  const dayOfTheMonth = getDate(now)
  if (dayOfTheMonth < 27) {
    dateForRequest = subMonths(dateForRequest, 1)
  }
  dateForRequest = startOfDay(setDate(dateForRequest, 16))

  return (
    getDeclarationBaseQuery()
      .andWhere({
        hasFinishedDeclaringEmployers: true,
        isFinished: false,
      })
      .andWhere('Declarations.createdAt', '<', dateForRequest.toISOString())
      .groupBy('Declarations.id')
      // Note: This sends back declarations for which there are documents left to send, but some
      // documents could already have been transfered, so we make sure we filter in sendDocuments.
      .then(async (declarations) => {
        for (const declaration of declarations) {
          try {
            console.log(
              `Gonna send late documents from declaration ${declaration.id}`,
            )
            await sendDocuments(declaration)

            // set isFinished to true if nothing is left to send.
            const updatedDeclaration = await Declaration.query()
              .eager('employers.document')
              .findById(declaration.id)

            if (!hasDocumentsLeftToSend(updatedDeclaration)) {
              console.log(
                `Setting isFinished for declaration ${updatedDeclaration.id}`,
              )
              await updatedDeclaration.$query().patch({ isFinished: true })
            }
          } catch (e) {
            console.error(
              `Error sending some late documents from declaration ${
                declaration.id
              }`,
            )
          }
        }
      })
  )
}

let isWorking = false

// Always transmit declarations before documents.
// Declaration have a limited time to be done, documents can be done afterwards
const initActions = () => {
  if (isWorking) return
  isWorking = true
  return getActiveMonth()
    .then((activeMonth) => {
      // Documents can be transmitted when there is no active months. Declarations can't.
      if (!activeMonth) return transmitAllDocuments().then(transmitOldDocuments)

      return transmitAllDeclarations(activeMonth)
        .then(transmitAllDocuments)
        .then(transmitOldDocuments)
    })
    .then(() => {
      isWorking = false
    })
    .catch((e) => {
      console.error('Error in transmission process', e)
      isWorking = false
    })
}

setInterval(initActions, 600000) // every 10 minutes
initActions()
