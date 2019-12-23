const fs = require('fs')
const bz2 = require('unbzip2-stream')
const readline = require('readline')
const winston = require('../lib/log')

const eraseFile = (filePath) =>
  new Promise((resolve, reject) => {
    fs.access(filePath, (accessError) => {
      if (accessError) return resolve(true)

      fs.unlink(filePath, (deleteError) => {
        if (deleteError) {
          winston.warn(deleteError)
          return reject(accessError)
        }

        // Return true in all case
        resolve(true)
      })
    })
  })

/**
 * @param {string} filePath
 * @param {string} filePathCsv default keep the same name but replace .bz2 to .csv
 * @returns {Promise<String>} path of the new file
 */
async function unzipBz2(filePath, filePathCsv) {
  filePathCsv = filePathCsv || filePath.replace('bz2', 'csv')
  return new Promise((res, rej) => {
    fs.createReadStream(filePath)
      .pipe(bz2())
      .pipe(fs.createWriteStream(filePathCsv))
      .on('close', () => res(filePathCsv))
      .on('error', rej)
  })
}

/**
 * @param {string} filePathCsv path of the csv file to read
 * @returns {Promise<String[]>} fileContent
 */
async function readCsv(filePathCsv) {
  const data = []
  await new Promise((res, rej) => {
    readline
      .createInterface({ input: fs.createReadStream(filePathCsv) })
      .on('line', (line) => data.push(line))
      .on('close', res)
      .on('error', rej)
  })
  return data
}

module.exports = {
  eraseFile,
  unzipBz2,
  readCsv,
}
