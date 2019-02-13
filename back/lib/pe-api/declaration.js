const { format } = require('date-fns')
const superagent = require('superagent')
const config = require('config')

const winston = require('../log')

const convertDate = (date) => format(date, 'DDMMYYYY')

const JOB_SEARCH_STOP_MOTIVES = {
  WORK: 0,
  RETIREMENT: 1,
  OTHER: 2,
}

const getDeclarationWorkHours = (declaration) => {
  // We cannot declare more than 450 hours to PE.fr
  // or the form will refuse our input
  const actualWorkHours = declaration.employers.reduce(
    (prev, { workHours }) => prev + workHours,
    0,
  )
  return actualWorkHours > 450 ? 450 : actualWorkHours
}

const convertDeclarationToAPIFormat = (declaration) => {
  const apiDeclaration = {}

  if (declaration.hasWorked) {
    apiDeclaration.nbHeuresTrav = getDeclarationWorkHours(declaration)
    apiDeclaration.montSalaire = Math.round(
      declaration.employers.reduce((prev, { salary }) => prev + salary, 0),
    )
  }
  if (declaration.hasInternship) {
    apiDeclaration.dateDebutStage = convertDate(
      declaration.dates.internship[0].startDate,
    )
    apiDeclaration.dateFinStage = convertDate(
      declaration.dates.internship[0].endDate,
    )
  }
  if (declaration.hasSickLeave) {
    apiDeclaration.dateDebutMaladie = convertDate(
      declaration.dates.sickLeave[0].startDate,
    )
    apiDeclaration.dateFinMaladie = convertDate(
      declaration.dates.sickLeave[0].endDate,
    )
  }
  if (declaration.hasMaternityLeave) {
    apiDeclaration.dateDebutMaternite = convertDate(
      declaration.dates.maternityLeave[0].startDate,
    )
  }
  if (declaration.hasRetirement) {
    apiDeclaration.dateRetraite = convertDate(
      declaration.dates.retirement[0].startDate,
    )
  }
  if (declaration.hasInvalidity) {
    apiDeclaration.dateInvalidite = convertDate(
      declaration.dates.invalidity[0].startDate,
    )
  }
  if (!declaration.isLookingForJob) {
    apiDeclaration.dateFinRech = convertDate(
      declaration.dates.jobSearch[0].endDate,
    )
    apiDeclaration.motifFinRech =
      declaration.jobSearchStopMotive === 'work'
        ? JOB_SEARCH_STOP_MOTIVES.WORK
        : declaration.jobSearchStopMotive === 'retirement'
          ? JOB_SEARCH_STOP_MOTIVES.RETIREMENT
          : JOB_SEARCH_STOP_MOTIVES.OTHER
  }

  return apiDeclaration
}

const sendDeclaration = ({ declaration, accessToken, ignoreErrors }) =>
  superagent
    .post(
      `${config.apiHost}/partenaire/peconnect-actualisation/v1/actualisation`,
      {
        ...convertDeclarationToAPIFormat(declaration),
        forceIncoherence: ignoreErrors ? 1 : 0,
      },
    )
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Accept-Encoding', 'gzip')
    .set('Accept', 'application/json')
    .set('media', 'I')
    .catch((err) => {
      winston.error('Error while sending declaration', declaration.id, err)
      throw err
    })

module.exports = {
  sendDeclaration,
}
