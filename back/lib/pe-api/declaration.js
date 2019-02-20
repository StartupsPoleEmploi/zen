const { format } = require('date-fns')
const superagent = require('superagent')
const config = require('config')
const { isAfter, isBefore } = require('date-fns')

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

  /*
   * multiple sickLeaves or internships need to be sent ot PE as one single date span
   * so for example, two sicknessLeaves like this :
   * [{ startDate: 2019-01-02, endDate: 2019-01-04 }, { startDate: 2019-01-09, endDate: 2019-01-16 }]
   * will be declared as one single sicknessLeave from 2019-01-02 to 2019-01-16.
   * PE-side, this will be handled by looking at the user's documents.
   */
  if (declaration.hasInternship) {
    apiDeclaration.dateDebutStage = convertDate(
      declaration.dates.internships.reduce(
        (prev, { startDate }) => (isBefore(prev, startDate) ? prev : startDate),
        declaration.dates.internships[0].startDate,
      ),
    )
    apiDeclaration.dateFinStage = convertDate(
      declaration.dates.internships.reduce(
        (prev, { endDate }) => (isAfter(prev, endDate) ? prev : endDate),
        declaration.dates.internships[0].endDate,
      ),
    )
  }
  if (declaration.hasSickLeave) {
    apiDeclaration.dateDebutMaladie = convertDate(
      declaration.dates.sickLeaves.reduce(
        (prev, { startDate }) => (isBefore(prev, startDate) ? prev : startDate),
        declaration.dates.sickLeaves[0].startDate,
      ),
    )
    apiDeclaration.dateFinMaladie = convertDate(
      declaration.dates.sickLeaves.reduce(
        (prev, { endDate }) => (isAfter(prev, endDate) ? prev : endDate),
        declaration.dates.sickLeaves[0].endDate,
      ),
    )
  }
  if (declaration.hasMaternityLeave) {
    apiDeclaration.dateDebutMaternite = convertDate(
      declaration.dates.maternityLeave.startDate,
    )
  }
  if (declaration.hasRetirement) {
    apiDeclaration.dateRetraite = convertDate(
      declaration.dates.retirement.startDate,
    )
  }
  if (declaration.hasInvalidity) {
    apiDeclaration.dateInvalidite = convertDate(
      declaration.dates.invalidity.startDate,
    )
  }
  if (!declaration.isLookingForJob) {
    apiDeclaration.dateFinRech = convertDate(
      declaration.dates.jobSearch.endDate,
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
