const imagesToPdf = require('images-to-pdf')
const fs = require('fs')
const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const pdftk = require('node-pdftk')

const winston = require('../lib/log')
const { uploadDestination } = require('../lib/upload')

pdftk.configure({ bin: 'pdftk' })

const IMG_EXTENSIONS = ['.png', '.jpeg', '.jpg']
const MAX_PDF_SIZE = 5

const getFileBasename = (filename) =>
  path.basename(filename, path.extname(filename))

const getPDF = (document, directory) => {
  const originalFileName = document.file

  const fileBaseName = getFileBasename(originalFileName)

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

const numberOfPage = (filePath) =>
  exec(`pdfinfo ${filePath} | grep Pages | sed 's/[^0-9]*//'`).then((res) =>
    parseInt(res.stdout.replace('\n', ''), 10),
  )

const transformImageToPDF = (filename) => {
  const fileBaseName = getFileBasename(filename)
  const pdfFilePath = `${uploadDestination}${fileBaseName}.pdf`
  const imgFilePath = `${uploadDestination}${filename}`

  return imagesToPdf([imgFilePath], pdfFilePath).then(() => {
    fs.unlink(imgFilePath, (deleteError) => {
      if (deleteError) {
        winston.warn(
          `Erreur en supprimant l'image ${filename} : ${deleteError.message}`,
        )
      }
    })
  })
}

const mergePDF = (file1, file2, output) =>
  pdftk
    .input({
      A: file1,
      B: file2,
    })
    .cat('A B')
    .output(output)

const handleNewFileUpload = async ({
  newFilename,
  existingDocumentFile,
  documentFileObj,
  isAddingFile,
}) => {
  if (IMG_EXTENSIONS.includes(path.extname(newFilename))) {
    await transformImageToPDF(newFilename)
    documentFileObj = {
      ...documentFileObj,
      file: `${getFileBasename(newFilename)}.pdf`,
    }
  }

  if (
    isAddingFile &&
    path.extname(documentFileObj.file) === '.pdf' &&
    path.extname(existingDocumentFile) === '.pdf'
  ) {
    // We can attempt a PDF merge
    const additionFilePath = `${uploadDestination}${documentFileObj.file}`
    const existingFilePath = `${uploadDestination}${existingDocumentFile}`

    // Check if future PDF is not above to {MAX_PDF_SIZE} pages
    const additionalFileSize = await numberOfPage(additionFilePath)
    const currentFileSize = await numberOfPage(existingFilePath)
    if (additionalFileSize + currentFileSize > MAX_PDF_SIZE) {
      throw new Error(`PDF will exceed ${MAX_PDF_SIZE} pages`)
    }

    await mergePDF(
      `${uploadDestination}${existingDocumentFile}`,
      `${uploadDestination}${documentFileObj.file}`,
      `${uploadDestination}${existingDocumentFile}`,
    )

    // If merging in successful or not, we need to keep that the file in DB is the old file name
    documentFileObj = { ...documentFileObj, file: existingDocumentFile }
  }
  return documentFileObj
}

const removePage = (filePath, pageNumberToRemove) =>
  // Compute cat argument for pdftk :https://doc.ubuntu-fr.org/pdftk#concatenation
  numberOfPage(filePath).then((pageNumber) => {
    if (pageNumber === 1) throw new Error("Can't remove the only page")

    let cat
    if (pageNumberToRemove === 1) {
      // First page
      cat = 'A2-end'
    } else if (pageNumberToRemove === pageNumber) {
      // Last page
      cat = `A1-${pageNumberToRemove - 1}`
    } else {
      const firstPartEnd = pageNumberToRemove - 1
      const secondPartBegin = pageNumberToRemove + 1
      cat = `A1-${firstPartEnd} ${secondPartBegin}-end`
    }

    return pdftk
      .input({
        A: filePath,
      })
      .cat(cat)
      .output(filePath)
  })

module.exports = {
  getPDF,
  getFileBasename,
  mergePDF,
  removePage,
  numberOfPage,
  transformImageToPDF,
  handleNewFileUpload,
  IMG_EXTENSIONS,
}
