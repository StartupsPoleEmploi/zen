const ActivityLog = require('../models/ActivityLog')
const Declaration = require('../models/Declaration')
const ObjectsToCsv = require('objects-to-csv')
const { writeFileSync } = require('fs')

const { Model } = require('objection')
const Knex = require('knex')
const {
  format,
  setMilliseconds,
  setSeconds,
  setMinutes,
  setHours,
  subDays,
} = require('date-fns')

const knex = Knex({
  client: 'pg',
  useNullAsDefault: true,
  connection: process.env.DATABASE_URL,
})
Model.knex(knex)

const todayAt1730 = setMilliseconds(
  setSeconds(setMinutes(setHours(new Date(), 17), 30), 0),
  0,
)

const yesterdayAt1730 = subDays(todayAt1730, 1)

const pickDataForDoneDeclaration = (declaration) => ({
  prenom: declaration.user.firstName,
  nom: declaration.user.lastName,
  'code postal': declaration.user.postalCode,
  'a travaillé': declaration.hasWorked ? 'oui' : 'non',
  'a stage': declaration.hasInternship ? 'oui' : 'non',
  'début de stage': declaration.internshipStartDate,
  'fin de stage': declaration.internshipEndDate,
  'a maladie': declaration.hasSickLeave ? 'oui' : 'non',
  'début congé maladie': declaration.sickLeaveStartDate,
  'fin congé maladie': declaration.sickLeaveEndDate,
  'a congé maternité': declaration.hasMaternityLeave ? 'oui' : 'non',
  'début congé maternité': declaration.maternityLeaveStartDate,
  'a retraite': declaration.hasRetirement ? 'oui' : 'non',
  'début retraite': declaration.retirementStartDate,
  'a invalidité': declaration.hasInvalidity ? 'oui' : 'non',
  'début invalidité': declaration.invalidityStartDate,
  'recherche travail': declaration.isLookingForJob ? 'oui' : 'non',
  'fin recherche travail': declaration.jobSearchEndDate,
  'motif fin recherche travail': declaration.jobSearchStopMotive,
})

const pickDataForDeclarationWithFilesSent = (declaration) => ({
  prenom: declaration.user.firstName,
  nom: declaration.user.lastName,
  'code postal': declaration.user.postalCode,
  'attestation stage': declaration.internshipDocumentId ? 1 : 0,
  'attestation maladie': declaration.sickLeaveDocumentId ? 1 : 0,
  'attestation maternité': declaration.maternityLeaveDocumentId ? 1 : 0,
  'attestation retraite': declaration.retirementDocumentId ? 1 : 0,
  'attestation invalidité': declaration.invalidityDocumentId ? 1 : 0,
  'bulletins de paie': declaration.employers.filter(
    ({ hasEndedThisMonth }) => !hasEndedThisMonth,
  ).length,
  'attestations employeurs': declaration.employers.filter(
    ({ hasEndedThisMonth }) => hasEndedThisMonth,
  ).length,
})

ActivityLog.query()
  .where('createdAt', '>=', yesterdayAt1730.toISOString())
  .andWhere('createdAt', '<', todayAt1730.toISOString())
  .then((activityLogs) => {
    const declarationLogs = activityLogs.filter(
      ({ action }) => action === ActivityLog.actions.VALIDATE_EMPLOYERS,
    )
    const filesLogs = activityLogs.filter(
      ({ action }) => action === ActivityLog.actions.VALIDATE_FILES,
    )

    return Promise.all([
      Declaration.query()
        .eager('[user, employers.document]')
        .whereIn(
          'id',
          declarationLogs.map(({ metadata }) => metadata.declarationId),
        )
        .then((results) =>
          new ObjectsToCsv(results.map(pickDataForDoneDeclaration)).toString(),
        ),
      Declaration.query()
        .eager('[user, employers.document]')
        .whereIn('id', filesLogs.map(({ metadata }) => metadata.declarationId))
        .then((results) =>
          new ObjectsToCsv(
            results.map(pickDataForDeclarationWithFilesSent),
          ).toString(),
        ),
    ])
  })
  .then(([doneDeclarations, declarationsWithFilesSent]) => {
    const formattedToday = format(todayAt1730, 'YYYY-MM-DD')
    writeFileSync(
      `./extracts/actus-transmises-${formattedToday}.csv`,
      doneDeclarations.replace(/,/g, ';'),
    )
    writeFileSync(
      `./extracts/fichiers-transmis-${formattedToday}.csv`,
      declarationsWithFilesSent.replace(/,/g, ';'),
    )
    process.exit()
  })
