/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */

const { Model } = require('objection')
const Knex = require('knex')
const sendDeclaration = require('./lib/headless-pilot/sendDeclaration')
const sendDocuments = require('./lib/headless-pilot/sendDocuments')

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
    .eager('user')
    .where({
      monthId: activeMonth.id,
      isTransmitted: false,
      // PE declaration is both declaration an work hours / salary
      hasFinishedDeclaringEmployers: true,
    })
    .then(async (declarationsToTransmit) => {
      for (const declaration of declarationsToTransmit) {
        try {
          await sendDeclaration(declaration)
        } catch (e) {
          console.error(`Error transmitting declaration ${declaration.id}`, e)
        }
      }
    })

const transmitAllDocuments = (activeMonth) => {
  const declarationFileFields = [
    'trainingDocument',
    'internshipDocument',
    'sickLeaveDocument',
    'maternityLeaveDocument',
    'retirementDocument',
    'invalidityDocument',
  ]

  Declaration.query()
    .eager(
      `[${declarationFileFields.join(
        ', ',
      )}, declarationMonth, employers.document, user]`,
    )
    .where({
      hasFinishedDeclaringEmployers: true,
      monthId: activeMonth.id,
    })
    // Note: This sends back *all* eligible declarations, even with already
    // transmitted documents. For now, filtering is done in the sendAllDocuments function.
    .then(async (declarations) => {
      for (const declaration of declarations) {
        try {
          await sendDocuments(declaration)
        } catch (e) {
          console.error(
            `Error sending some documents from declaration${declaration.id}`,
          )
        }
      }
    })
}

let isWorking = false

// Always transmit declarations before documents.
// Declaration have a limited time to be done, documents can be done afterwards
const initActions = () => {
  if (isWorking) return
  isWorking = true
  return getActiveMonth()
    .then((activeMonth) => {
      if (!activeMonth) return
      return transmitAllDeclarations(activeMonth).then(() =>
        transmitAllDocuments(activeMonth),
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
