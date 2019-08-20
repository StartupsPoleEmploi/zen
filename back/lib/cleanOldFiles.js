/* eslint-disable no-await-in-loop */
const { subMonths } = require('date-fns')
const { uploadsDirectory } = require('config')
const { uniq } = require('lodash')

const winston = require('../lib/log')
const Declaration = require('../models/Declaration')
const EmployerDocument = require('../models/EmployerDocument')
const DeclarationInfo = require('../models/DeclarationInfo')
const { eraseFile } = require('../lib/files')

const setIsCleanedUp = (idSet, model) => {
  model
    .query()
    .patch({ isCleanedUp: true })
    .whereIn('id', Array.from(idSet))
    .catch(winston.warn)
}

const cleanOldFiles = () => {
  winston.info('Starting files cleanup')
  const MONTH_DELTA = 6
  const minimumDate = subMonths(new Date(), MONTH_DELTA)

  return Declaration.query()
    .eager('[declarationMonth, infos, employers.documents]')
    .where('isFinished', true)
    .where('isCleanedUp', false)
    .where('transmittedAt', '<', minimumDate) // 6 month old declarations
    .then(async (declarations) => {
      const declarationIds = []
      const employerDocumentIds = []
      const infoIds = []

      for (const declaration of declarations) {
        for (const employer of declaration.employers) {
          try {
            await Promise.all(
              employer.documents.map((doc) => {
                employerDocumentIds.push(doc.id)
                return eraseFile(`${uploadsDirectory}${doc.file}`)
              }),
            )
            declarationIds.push(declaration.id)
          } catch (err) {
            winston.warn(err)
          }
        }

        for (const info of declaration.infos) {
          try {
            await eraseFile(`${uploadsDirectory}${info.file}`)
            infoIds.push(info.id)
            declarationIds.push(declaration.id)
          } catch (err) {
            winston.warn(err)
          }
        }

        if (!declaration.employers.length && !declaration.infos.length) {
          declarationIds.push(declaration.id)
        }
      }

      // Update all declarations, employer_documents & declaration_infos
      if (declarationIds.length) {
        setIsCleanedUp(uniq(declarationIds), Declaration)
      }
      if (infoIds.length) setIsCleanedUp(infoIds, DeclarationInfo)
      if (employerDocumentIds.length) {
        setIsCleanedUp(employerDocumentIds, EmployerDocument)
      }

      winston.info('Finished files cleanup')
    })
}

module.exports = cleanOldFiles
