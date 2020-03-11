const fs = require('fs')
const { format, subDays } = require('date-fns')
const { Parser } = require('json2csv')

const winston = require('../lib/log')

const User = require('../models/User')
const ActivityLog = require('../models/ActivityLog')

const EXPORT_DIR = '/mnt/datalakepe/vers_datalake/'
const EXPORT_UNAUTHORIZED_FILE_NAME = `export_utilisateur.csv`
const EXPORT_UNAUTHORIZED_FILE_PATH = `${EXPORT_DIR}${EXPORT_UNAUTHORIZED_FILE_NAME}`

const EXPORT_AUTHORIZED_FILE_NAME = `export_utilisateurs_autorises.csv`
const EXPORT_AUTHORIZED_FILE_PATH = `${EXPORT_DIR}${EXPORT_AUTHORIZED_FILE_NAME}`

const DATA_EXPORT_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'postalCode',
  'gender',
  'isAuthorized',
  'peId',
  'agencyCode',
  'situationRegardEmploiId',
  'registeredAt',
]

const getDeclaration = (declarations, monthId) =>
  declarations.find((d) => d.declarationMonth.id === monthId)

const getValidateFileActivityLog = (logs, { id: declarationId }) =>
  logs.find(
    (log) =>
      log.action === ActivityLog.actions.VALIDATE_FILES &&
      log.metadata &&
      log.metadata.declarationId === declarationId,
  )

const computeFields = (declarationMonths) => {
  const months = []
  declarationMonths.forEach((month) => {
    const label = format(month.month, 'MM/YYYY')
    months.push({
      label: `${label} - Actu envoyee`,
      value: (row, field) => {
        if (row.declarations) {
          const declaration = getDeclaration(row.declarations, month.id)

          if (declaration) return format(declaration.transmittedAt, 'DD/MM')
        }
        return field.default
      },
      default: '',
    })
    months.push({
      label: `${label} - Actu et doc envoyee`,
      value: (row, field) => {
        if (row.declarations) {
          const declaration = getDeclaration(row.declarations, month.id)

          if (declaration) {
            if (!declaration.hasWorked) return 'Pas travaille'
            if (declaration.isFinished) {
              if (row.activityLogs) {
                const log = getValidateFileActivityLog(
                  row.activityLogs,
                  declaration,
                )
                if (log) return format(log.createdAt, 'DD/MM')
              }
              // During 2 months we got a regression resulting in no VALIDATE_FILES activityLog...
              // We use declaration.updatedAt as fallback
              return format(declaration.updatedAt, 'DD/MM')
            }
          }
        }
        return field.default
      },
      default: '',
    })
  })

  return [
    'firstName',
    'lastName',
    'email',
    'postalCode',
    'gender',
    'isAuthorized',
    'peId',
    ...months,
  ]
}

const renameFile = (from, to) =>
  new Promise((resolve, reject) => {
    fs.rename(from, to, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })

const exportUsersFileInCSV = async ({ isAuthorized, filePath, fileName }) => {
  // Archive current file if exists
  if (fs.existsSync(filePath)) {
    const yesterdayDate = format(subDays(new Date(), 1), 'YYYY-MM-DD')

    try {
      await renameFile(
        `${filePath}`,
        `${EXPORT_DIR}${yesterdayDate}-${fileName}`,
      )
    } catch (err) {
      winston.error(err)
      throw err
    }
  }

  // Create file
  fs.openSync(filePath, 'w')

  // Extract and save in new file
  return User.query()
    .where({ isAuthorized })
    .whereNotNull('registeredAt')
    .then((users) => {
      const json2csvParser = new Parser({ fields: DATA_EXPORT_FIELDS })
      const csvContent = json2csvParser.parse(users)

      fs.writeFile(filePath, csvContent, function(err) {
        if (err) {
          winston.error(err)
          throw err
        }
      })
    })
}

const saveAuthorizedUsersInCSV = async () => {
  winston.info('Starting export authorized users')
  await exportUsersFileInCSV({
    isAuthorized: true,
    filePath: EXPORT_AUTHORIZED_FILE_PATH,
    fileName: EXPORT_AUTHORIZED_FILE_NAME,
  })
  winston.info('Finished export authorized users')
}

const saveUnauthorizedUsersInCSV = async () => {
  winston.info('Starting export unauthorized users')
  await exportUsersFileInCSV({
    isAuthorized: false,
    filePath: EXPORT_UNAUTHORIZED_FILE_PATH,
    fileName: EXPORT_UNAUTHORIZED_FILE_NAME,
  })
  winston.info('Finished export unauthorized users')
}

module.exports = {
  saveUnauthorizedUsersInCSV,
  saveAuthorizedUsersInCSV,
  computeFields,
  DATA_EXPORT_FIELDS,
}
