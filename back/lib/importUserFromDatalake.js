/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
const fs = require('fs')
const util = require('util')
const { format, subDays } = require('date-fns')
const { startCase, toLower } = require('lodash')

const winston = require('./log')
const { unzipBz2, readCsv } = require('./files')
const mailjet = require('./mailings/mailjet')
const User = require('../models/User')

const readdir = util.promisify(fs.readdir)

/**
 * @desc find the last file in the folder and check if it is the one of the current day (We do this in case of the datalake has not done their job correctly)
 * @returns {Promise<string>} path of the file
 */
async function $getFile() {
  const FOLDER = `/mnt/datalakepe/depuis_datalake`
  const files = await readdir(FOLDER)
  const dateFormated = format(subDays(new Date(), 1), 'YYYYMMDD')
  const startWith = `zen_de_eligible_full_${dateFormated}`
  const file = files.find((f) => f.startsWith(startWith) && f.endsWith('.bz2'))
  if (!file) throw new Error(`No file found that start with ${startWith}`)
  return `${FOLDER}/${file}`
}

function $convertField(filed) {
  return filed === 'NULL' ? null : filed
}

function $lineToUser(lineContent) {
  const [
    dc_ididentiteexterne, // peId (eg => 2c786256-84ac-4fec-84da-52cb87e4a541)
    ,
    ,
    // [n_individuadmin_id] identifant national (eg => 1336559849)
    // [c_individulocal] identifiant local (eg => 0261148306J)
    c_prenomcorrespondance, // firstName
    c_nomcorrespondance, // lastName
    c_sexe_id, // F or H
    c_adresseemail, // email
    c_codepostal, // postalCode
    c_cdeale, // agencyCode (eg => 62574)
    ,
    ,
    // [dc_lbldepartement] (eg => PAS-DE-CALAIS)
    // [dc_lblregion] (eg => HAUTS-DE-FRANCE)
    radie, // every to false, because we only have user eligible
    // [dc_situationregardemploi_id] catégorie d'inscription (eg => SAN)
    // [actu_faite] 'true' or 'false'; savoir si elle a fait sont actu du mois courrent
    ,
    ,
  ] = lineContent.split('|')

  const firstName = $convertField(c_prenomcorrespondance)
  const lastName = $convertField(c_nomcorrespondance)
  return {
    peId: $convertField(dc_ididentiteexterne),
    firstName: firstName ? startCase(toLower(firstName)) : null,
    lastName: lastName ? startCase(toLower(lastName)) : null,
    gender: $convertField(c_sexe_id) === 'F' ? 'female' : 'male',
    email: $convertField(c_adresseemail),
    postalCode: $convertField(c_codepostal),
    isBlocked: $convertField(radie) === 'true',
    agencyCode: $convertField(c_cdeale),
  }
}

/**
 * @param {Object} userFromFile result of lineToUser
 * @returns {Promise<User|null>} user
 */
async function $updateUser(userFromFile) {
  // some of user from file dont have peId, we only get user with peId
  if (
    !userFromFile.peId ||
    !userFromFile.firstName ||
    !userFromFile.lastName ||
    !userFromFile.postalCode
  ) {
    return null
  }

  const userInDb = await User.query().findOne({ peId: userFromFile.peId })
  if (userInDb) {
    const hasEmailChange =
      !!userFromFile.email &&
      !!userInDb.email &&
      userFromFile.email !== userInDb.email
    if (userInDb.registeredAt && hasEmailChange) {
      // User email has changed. Changing email in mailjet
      // Note: We do not wait for Mailjet to answer to send data back to the user
      winston.info(
        `E-mail changed for user ${userInDb.id}: old="${userInDb.email}"; new="${userFromFile.email}"`,
      )
      await mailjet.changeContactEmail({
        oldEmail: userInDb.email,
        newEmail: userFromFile.email,
      })
    }
    // If no email is communicated by PE, do not override email
    userFromFile.email = userFromFile.email || userInDb.email

    const hasModif = Object.entries(userFromFile).some(
      ([key, val]) => userInDb[key] !== val,
    )
    if (hasModif) await userInDb.$query().patch(userFromFile)
  } else {
    await User.query().insert(userFromFile)
  }

  return !!userInDb
}

async function importUserFromDatalake() {
  winston.info('[ImportUserFromDatalake] START')
  try {
    const startTime = new Date()
    const filePath = await $getFile()
    const filePathCsv = await unzipBz2(filePath)
    const dataToManage = await readCsv(filePathCsv)
    // remove the first line that contain titles and not data
    dataToManage.splice(0, 1)

    // manage all line
    winston.info('[ImportUserFromDatalake] Update users ...')
    const peIdsFromFile = []
    while (dataToManage.length) {
      winston.info(`Still ${dataToManage.length} lines`)
      const dataLines = dataToManage.splice(0, 1000)
      await Promise.all(
        dataLines.map(async (dataLine, idx) => {
          const userFromFile = $lineToUser(dataLine)
          if (userFromFile.peId) peIdsFromFile.push(userFromFile.peId)
          await $updateUser(userFromFile).catch((err) => {
            winston.error(
              `[ImportUserFromDatalake] "${err}" to line (${dataLine})`,
              { error: err, filePathCsv, idx, dataLine },
            )
          })
        }),
      )
    }

    // The file from datalake contain only user not block. So block all user not in file
    winston.info('[ImportUserFromDatalake] Block users ...')
    if (peIdsFromFile.length) {
      // the where clause is here to optimise performences, get only user that has not been insert/updated by updateUser
      const users = await User.query()
        .where('updatedAt', '<', startTime)
        .column('peId')
      const peIds = users.map((e) => e.peId)
      const userToUpdate = peIds.filter((peId) => !peIdsFromFile.includes(peId))
      while (userToUpdate.length) {
        winston.info(`Still ${userToUpdate.length} user to block lines`)
        const peIdIn = userToUpdate.splice(0, 1000)
        await User.query()
          .patch({ isBlock: true })
          .whereIn('peId', peIdIn)
      }
    }
  } catch (error) {
    winston.error(`[ImportUserFromDatalake] ${error}`, error)
  }
}

module.exports = {
  importUserFromDatalake,
}
