const { format } = require('date-fns')
const config = require('config')
const { isAfter, isBefore } = require('date-fns')

const winston = require('../log')
const DeclarationInfo = require('../../models/DeclarationInfo')
const { request } = require('../resilientRequest')

const docTypes = DeclarationInfo.types

const convertDate = (date) => format(date, 'DDMMYYYY')

const JOB_SEARCH_STOP_MOTIVES = {
  WORK: 0,
  RETIREMENT: 1,
  OTHER: 2,
}

const MAX_DECLARABLE_HOURS = 420

const getDeclarationWorkHours = (declaration) => {
  // We cannot declare more than 420 hours to PE.fr
  // or the form will refuse our input
  const actualWorkHours = declaration.employers.reduce(
    (prev, { workHours }) => prev + workHours,
    0,
  )
  return actualWorkHours > MAX_DECLARABLE_HOURS
    ? MAX_DECLARABLE_HOURS
    : actualWorkHours
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
      declaration.infos
        .filter(({ type }) => type === docTypes.internship)
        .reduce(
          (prev, { startDate }) =>
            isBefore(prev, startDate) ? prev : startDate,
          declaration.infos.find(({ type }) => type === docTypes.internship)
            .startDate,
        ),
    )
    apiDeclaration.dateFinStage = convertDate(
      declaration.infos
        .filter(({ type }) => type === docTypes.internship)
        .reduce(
          (prev, { endDate }) => (isAfter(prev, endDate) ? prev : endDate),
          declaration.infos.find(({ type }) => type === docTypes.internship)
            .endDate,
        ),
    )
  }
  if (declaration.hasSickLeave) {
    apiDeclaration.dateDebutMaladie = convertDate(
      declaration.infos
        .filter(({ type }) => type === docTypes.sickLeave)
        .reduce(
          (prev, { startDate }) =>
            isBefore(prev, startDate) ? prev : startDate,
          declaration.infos.find(({ type }) => type === docTypes.sickLeave)
            .startDate,
        ),
    )
    apiDeclaration.dateFinMaladie = convertDate(
      declaration.infos
        .filter(({ type }) => type === docTypes.sickLeave)
        .reduce(
          (prev, { endDate }) => (isAfter(prev, endDate) ? prev : endDate),
          declaration.infos.find(({ type }) => type === docTypes.sickLeave)
            .endDate,
        ),
    )
  }
  if (declaration.hasMaternityLeave) {
    const { startDate } = declaration.infos.find(
      ({ type }) => type === docTypes.maternityLeave,
    )
    apiDeclaration.dateDebutMaternite = convertDate(startDate)
  }
  if (declaration.hasRetirement) {
    const { startDate } = declaration.infos.find(
      ({ type }) => type === docTypes.retirement,
    )
    apiDeclaration.dateRetraite = convertDate(startDate)
  }
  if (declaration.hasInvalidity) {
    const { startDate } = declaration.infos.find(
      ({ type }) => type === docTypes.invalidity,
    )
    apiDeclaration.dateInvalidite = convertDate(startDate)
  }
  if (!declaration.isLookingForJob) {
    const { endDate } = declaration.infos.find(
      ({ type }) => type === docTypes.jobSearch,
    )
    apiDeclaration.dateFinRech = convertDate(endDate)
    apiDeclaration.motifFinRech =
      declaration.jobSearchStopMotive === 'work'
        ? JOB_SEARCH_STOP_MOTIVES.WORK
        : declaration.jobSearchStopMotive === 'retirement'
        ? JOB_SEARCH_STOP_MOTIVES.RETIREMENT
        : JOB_SEARCH_STOP_MOTIVES.OTHER
  }

  return apiDeclaration
}

const sendDeclaration = ({ declaration, accessToken, ignoreErrors }) => {
  // NEVER ACTIVATE IN PRODUCTION
  if (config.get('bypassDeclarationDispatch')) {
    winston.info(`Simulating sending ${declaration.id} to PE`)
    return Promise.resolve({ body: { statut: 0 } })
  }

  return request({
    method: 'post',
    url: `${
      config.apiHost
    }/partenaire/peconnect-actualisation/v1/actualisation`,
    data: {
      ...convertDeclarationToAPIFormat(declaration),
      forceIncoherence: ignoreErrors ? 1 : 0,
    },
    accessToken,
    headers: [
      {
        key: 'media',
        value: 'I',
      },
    ],
  }).catch((err) => {
    winston.error(
      `Error while sending declaration ${declaration.id} (HTTP ${err.status})`,
    )
    throw err
  })
}

module.exports = {
  sendDeclaration,
}
