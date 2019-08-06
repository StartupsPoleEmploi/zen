const { transaction } = require('objection')
const { uploadsDirectory: uploadDestination } = require('config')

const { eraseFile } = require('./files')
const mailjet = require('./mailings/mailjet')

const ActivityLog = require('../models/ActivityLog')
const Declaration = require('../models/Declaration')
const User = require('../models/User')
const DeclarationInfo = require('../models/DeclarationInfo')
const Employer = require('../models/Employer')
const EmployerDocument = require('../models/EmployerDocument')
const DeclarationReview = require('../models/DeclarationReview')

const extractFileAndIdsFromEmployers = (employers) => {
  const employerDocumentFiles = []
  const employerDocumentIds = []

  for (const employer of employers) {
    for (const document of employer.documents) {
      employerDocumentIds.push(document.id)
      if (!document.isCleanedUp && document.file) {
        employerDocumentFiles.push(document.file)
      }
    }
  }

  return { employerDocumentIds, employerDocumentFiles }
}

const extractFileAndIdsFromDeclarations = (declarations) => {
  const declarationInfoFiles = []
  const declarationInfoIds = []

  for (const declaration of declarations) {
    for (const declarationInfo of declaration.infos) {
      declarationInfoIds.push(declarationInfo.id)
      if (!declarationInfo.isCleanedUp && declarationInfo.file) {
        declarationInfoFiles.push(declarationInfo.file)
      }
    }
  }
  return { declarationInfoIds, declarationInfoFiles }
}

const deleteUser = (user) => {
  // Extract employers_documents + declaration_infos files
  const employerIds = user.employers.map((emp) => emp.id)
  const declarationIds = user.declarations.map((dec) => dec.id)

  const {
    employerDocumentFiles,
    employerDocumentIds,
  } = extractFileAndIdsFromEmployers(user.employers)

  const {
    declarationInfoFiles,
    declarationInfoIds,
  } = extractFileAndIdsFromDeclarations(user.declarations)

  return transaction(User.knex(), (trx) =>
    // Delete employer_documents + declaration info + activityLog + declaration_reviews
    Promise.all([
      ActivityLog.query(trx)
        .delete()
        .where('userId', user.id),
      EmployerDocument.query(trx)
        .delete()
        .whereIn('id', employerDocumentIds),
      DeclarationInfo.query(trx)
        .delete()
        .whereIn('id', declarationInfoIds),
      DeclarationReview.query(trx)
        .delete()
        .whereIn('declarationId', declarationIds),
    ])
      // Delete employers
      .then(() =>
        Employer.query(trx)
          .delete()
          .whereIn('id', employerIds),
      )
      // Delete declarations
      .then(() =>
        Declaration.query(trx)
          .delete()
          .whereIn('id', declarationIds),
      )
      // Delete user
      .then(() => user.$query(trx).del())
      .then(() =>
        // Delete files + mailjet
        Promise.all([
          Promise.all(
            declarationInfoFiles.map((doc) =>
              eraseFile(`${uploadDestination}${doc}`),
            ),
          ),
          Promise.all(
            employerDocumentFiles.map((doc) =>
              eraseFile(`${uploadDestination}${doc}`),
            ),
          ),
          mailjet.deleteUser(user.email),
        ]),
      ),
  )
}

module.exports = {
  deleteUser,
}
