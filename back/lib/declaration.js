const { get } = require('lodash');
const { transaction } = require('objection');

const Declaration = require('../models/Declaration');
const ActivityLog = require('../models/ActivityLog');

const salarySheetType = 'salarySheet';
const employerCertificateType = 'employerCertificate';

function hasMissingEmployersDocuments(declaration) {
  return declaration.employers.reduce((prev, employer) => {
    if (!employer.hasEndedThisMonth) {
      return prev + (get(employer, 'documents[0].isTransmitted') ? 0 : 1);
    }

    /*
        The salary sheet is optional for users which have already sent their employer certificate,
        in which case we do not count it in the needed documents.
      */
    const hasEmployerCertificate = employer.documents.some(
      ({ type, isTransmitted }) => type === employerCertificateType && isTransmitted,
    );
    const hasSalarySheet = employer.documents.some(
      ({ type, isTransmitted }) => type === salarySheetType && isTransmitted,
    );

    if (hasEmployerCertificate) return prev + 0;
    return prev + (hasSalarySheet ? 1 : 2);
  }, 0) !== 0;
}

function hasMissingDeclarationDocuments(declaration) {
  return declaration.infos.filter(
    ({ type, isTransmitted }) => type !== 'jobSearch' && !isTransmitted,
  ).length !== 0;
}

async function fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated({
  declarationId,
  userId,
}) {
  const declaration = await Declaration.query()
    .eager('[infos, employers.documents, declarationMonth]')
    .findOne({ id: declarationId, userId });

  if (hasMissingEmployersDocuments(declaration) || hasMissingDeclarationDocuments(declaration)) {
    return declaration;
  }

  declaration.isFinished = true;
  await transaction(Declaration.knex(), (trx) => Promise.all([
    declaration.$query(trx).patch({ isFinished: true }),
    ActivityLog.query(trx).insert({
      userId,
      action: ActivityLog.actions.VALIDATE_FILES,
      metadata: JSON.stringify({
        declarationId,
      }),
    }),
  ]));

  return declaration;
}

module.exports = {
  hasMissingEmployersDocuments,
  hasMissingDeclarationDocuments,
  fetchDeclarationAndSaveAsFinishedIfAllDocsAreValidated,
};
