/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

const { Model } = require('objection')
const Knex = require('knex')
const sendDeclaration = require('./lib/headless-pilot/sendDeclaration')
const sendDocuments = require('./lib/headless-pilot/sendDocuments')
const sendDeclarationEmail = require('./lib/mailings/sendDeclarationEmail')
const sendDocumentsEmail = require('./lib/mailings/sendDocumentsEmail')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const DeclarationMonth = require('./models/DeclarationMonth')
const Declaration = require('./models/Declaration')

/*
TODO de ce code

Récupérer le mois actif
Faire périodiquement (toutes les 15 minutes ?) des requêtes pour trouver les déclarations avec employeurs terminés.

TODO ajouter un isTransmitted sur déclaration aussi

Sur ces déclarations :
* Si la déclaration n'est pas transmise, la transmettre
* Récupérer tous les fichiers de la déclaration et des employeurs
* Pour chaque fichier qui n'est pas transmis, le transmettre
* Finir la boucle.

*/

const getActiveMonth = () =>
  DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first()

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
          await sendDeclarationEmail(declaration)
        } catch (e) {
          console.error(`Error transmitting declaration ${declaration.id}`, e)
        }
      }
    })

const transmitAllDocuments = () => {
  const declarationFileFields = [
    'trainingDocument',
    'internshipDocument',
    'sickLeaveDocument',
    'maternityLeaveDocument',
    'retirementDocument',
    'invalidityDocument',
  ]

  /*
   * Summary of this scary-as-hell query:
   * Select all declarations and eagerly get all possible types of documents
   * All the joins and where clauses have for only objective to query declarations
   * for which there are documents left to send.
   * The group by is used because we have multiple left joins which could match
   * multiple times the same declaration.
   */

  return (
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
      .where({
        isFinished: true,
      })
      .andWhere(function() {
        this.where('trainingDocuments.isTransmitted', false)
          .orWhere('internshipDocuments.isTransmitted', false)
          .orWhere('sickLeaveDocuments.isTransmitted', false)
          .orWhere('maternityLeaveDocuments.isTransmitted', false)
          .orWhere('retirementDocuments.isTransmitted', false)
          .orWhere('invalidityDocuments.isTransmitted', false)
          .orWhere('employersDocuments.isTransmitted', false)
      })
      .groupBy('Declarations.id')
      // Note: This sends back declarations for which there are documents left to send, but some
      // documents could already have been transfered, so we make sure we filter in sendDocuments.
      .then(async (declarations) => {
        for (const declaration of declarations) {
          try {
            console.log(
              `Gonna send documents from declaration ${declaration.id}`,
            )
            await sendDocuments(declaration)
            await sendDocumentsEmail(declaration)
          } catch (e) {
            console.error(
              `Error sending some documents from declaration ${declaration.id}`,
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
      if (!activeMonth) return transmitAllDocuments()

      return transmitAllDeclarations(activeMonth).then(() =>
        transmitAllDocuments(),
      )
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
