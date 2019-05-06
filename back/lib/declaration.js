const { isNull } = require('lodash')

const EmployerDocument = require('../models/EmployerDocument')
const DeclarationInfo = require('../models/DeclarationInfo')

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

const hasMissingDeclarationDocuments = (declaration) => {
  return (
    (declaration.hasInternship &&
      declaration.infos.some(
        ({ type, file }) => type === docTypes.internship && isNull(file),
      )) ||
    (declaration.hasSickLeave &&
      declaration.infos.some(
        ({ type, file }) => type === docTypes.sickLeave && isNull(file),
      )) ||
    (declaration.hasMaternityLeave &&
      declaration.infos.some(
        ({ type, file }) => type === docTypes.maternityLeave && isNull(file),
      )) ||
    (declaration.hasRetirement &&
      declaration.infos.some(
        ({ type, file }) => type === docTypes.retirement && isNull(file),
      )) ||
    (declaration.hasInvalidity &&
      declaration.infos.some(
        ({ type, file }) => type === docTypes.invalidity && isNull(file),
      ))
  )
}

module.exports = {
  hasMissingEmployersDocuments,
  hasMissingDeclarationDocuments,
}
