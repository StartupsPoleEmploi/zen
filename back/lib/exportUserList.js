const fs = require('fs')
const { format, subDays } = require('date-fns')
const { Parser } = require('json2csv')

const winston = require('../lib/log')

const User = require('../models/User')

const EXPORT_DIR = '/mnt/datalakepe/vers_datalake/'
const EXPORT_UNAUTHORIZED_FILENAME_PATH = `${EXPORT_DIR}export_utilisateur.csv`
const EXPORT_AUTHORIZED_FILENAME_PATH = `${EXPORT_DIR}export_utilisateurs_autorises.csv`

const EXPORT_FIELDS = [
  'firstName',
  'lastName',
  'email',
  'postalCode',
  'gender',
  'isAuthorized',
  'peId',
]

const renameFile = (from, to) =>
  new Promise((resolve, reject) => {
    fs.rename(from, to, (err) => {
      if (err) return reject(err)
      resolve()
    })
  })

const exportUsersFileInCSV = async ({ isAuthorized, filePath }) => {
  // Archive current file if exists
  if (fs.existsSync(filePath)) {
    const yesterdayDate = format(subDays(new Date(), 1), 'YYYY-MM-DD')

    try {
      await renameFile(
        `${filePath}`,
        `${EXPORT_DIR}${yesterdayDate}-${filePath}`,
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
    .then((users) => {
      const json2csvParser = new Parser({ fields: EXPORT_FIELDS })
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
    filePath: EXPORT_AUTHORIZED_FILENAME_PATH,
  })
  winston.info('Finished export authorized users')
}

const saveUnauthorizedUsersInCSV = async () => {
  winston.info('Starting export unauthorized users')
  await exportUsersFileInCSV({
    isAuthorized: false,
    filePath: EXPORT_UNAUTHORIZED_FILENAME_PATH,
  })
  winston.info('Finished export unauthorized users')
}

module.exports = {
  saveUnauthorizedUsersInCSV,
  saveAuthorizedUsersInCSV,
  EXPORT_FIELDS,
}
