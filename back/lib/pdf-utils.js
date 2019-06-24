const imagesToPdf = require('images-to-pdf')
const fs = require('fs')
const path = require('path')

const winston = require('../lib/log')

const getPDF = (document, directory) => {
  const originalFileName = document.file

  const fileBaseName = path.basename(
    originalFileName,
    path.extname(originalFileName),
  )

  const pdfFileName = `${fileBaseName}.pdf`

  return new Promise((resolve, reject) => {
    const pdfFilePath = `${directory}${pdfFileName}`
    const imgFilePath = `${directory}${originalFileName}`

    fs.access(pdfFilePath, (error) => {
      // PDF already converted ?
      if (!error) return resolve(pdfFileName)

      imagesToPdf([imgFilePath], pdfFilePath)
        .then(() => document.$query().patch({ file: pdfFileName }))
        .then(() =>
          fs.unlink(imgFilePath, (deleteError) =>
            deleteError ? reject(deleteError) : resolve(pdfFileName),
          ),
        )
        .catch((err) => {
          winston.warn(err)
          reject(err)
        })
    })
  })
}

module.exports = {
  getPDF,
}
