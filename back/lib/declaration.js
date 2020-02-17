const { isNull } = require('lodash')
const { transaction } = require('objection')

const EmployerDocument = require('../models/EmployerDocument')
const DeclarationInfo = require('../models/DeclarationInfo')
const Declaration = require('../models/Declaration')
const ActivityLog = require('../models/ActivityLog')

const docTypes = DeclarationInfo.types

const hasMissingEmployersDocuments = (declaration) =>
  declaration.employers.some((employer) => {
    // If employer contract is still going on, we only need one document (the salary sheet)
    // to validate it. Otherwise, we need an employer certificate.
    if (!employer.hasEndedThisMonth) {
      return employer.documents.length === 0
    }
    return !employer.documents.find(
      ({ type }) => type === EmployerDocument.types.employerCertificate,
    )
  })

const hasMissingDeclarationDocuments = (declaration) =>
  (declaration.hasInternship &&
    declaration.infos.some(
      ({ isTransmitted, type, file }) =>
        type === docTypes.internship && isNull(file) && !isTransmitted,
    )) ||
  (declaration.hasSickLeave &&
    declaration.infos.some(
      ({ isTransmitted, type, file }) =>
        type === docTypes.sickLeave && isNull(file) && !isTransmitted,
    )) ||
  (declaration.hasMaternityLeave &&
    declaration.infos.some(
      ({ isTransmitted, type, file }) =>
        type === docTypes.maternityLeave && isNull(file) && !isTransmitted,
    )) ||
  (declaration.hasRetirement &&
    declaration.infos.some(
      ({ isTransmitted, type, file }) =>
        type === docTypes.retirement && isNull(file) && !isTransmitted,
    )) ||
  (declaration.hasInvalidity &&
    declaration.infos.some(
      ({ isTransmitted, type, file }) =>
        type === docTypes.invalidity && isNull(file) && !isTransmitted,
    ))

const fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated = ({
  declarationId,
  userId,
}) =>
  Declaration.query()
    .eager(`[infos, employers.documents]`)
    .findOne({
      id: declarationId,
      userId,
    })
    .then((declaration) => {
      if (
        hasMissingEmployersDocuments(declaration) ||
        hasMissingDeclarationDocuments(declaration)
      ) {
        return declaration
      }

      declaration.isFinished = true

      return transaction(Declaration.knex(), (trx) =>
        Promise.all([
          declaration.$query(trx).upsertGraph(),
          ActivityLog.query(trx).insert({
            userId,
            action: ActivityLog.actions.VALIDATE_FILES,
            metadata: JSON.stringify({
              declarationId,
            }),
          }),
        ]).then(() =>
          // Note : we don't use upsertGraphAndFetch above because we want the declarationMonth with the declaration
          // And add it in the initial query will cause some trouble with the date :
          //   See => https://github.com/StartupsPoleEmploi/zen/commit/d10e639179881ca67c63968054ab44f848b0d824
          Declaration.query()
            .eager(`[infos, employers.documents, declarationMonth]`)
            .findOne({
              id: declarationId,
              userId,
            }),
        ),
      )
    })

module.exports = {
  hasMissingEmployersDocuments,
  hasMissingDeclarationDocuments,
  fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated,
}
