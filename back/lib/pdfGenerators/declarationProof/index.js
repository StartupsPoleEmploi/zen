const fs = require('fs')
const util = require('util')
const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')
const Mustache = require('mustache')

const { uploadsDeclarationDirectory } = require('config')
// const winston = require('../../log')
const { htmlToPdf } = require('../utils')
const { eraseFile } = require('../../files')

const isProdEnv = process.env.NODE_ENV === 'prod'
const DECLARATION_PDF_TEMPLATE = `${__dirname}/declarationPdf.mst`

const exists = util.promisify(fs.exists)
const mkDir = util.promisify(fs.mkdir)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
let templateHTML // For caching

const documentLabels = {
  sickLeave: 'arrêt maladie',
  internship: 'stage',
  maternityLeave: 'congé maternité',
  retirement: 'retraite',
  invalidity: 'invalidité',
}

const formatIntervalDates = (startDate, endDate) => {
  const startString = format(new Date(startDate), 'DD/MM/YYYY')
  if (!endDate) return `le ${startString}`

  const endString = format(new Date(endDate), 'DD/MM/YYYY')
  return `du ${startString} au ${endString}`
}

function generatePdfName({ declarationMonth, userId }) {
  return `${format(declarationMonth.month, 'YYYY-MM')}__${userId}.pdf`
}

function getFriendlyPdfName({ declarationMonth: { month } }) {
  const declarationDate = format(month, 'MMMM-YYYY', { locale: fr })
  return `declaration-${declarationDate}.pdf`
}

const generatePdfPath = (declaration) =>
  `${uploadsDeclarationDirectory}${generatePdfName(declaration)}`

const generateDeclarationAsPdf = async (declaration, pdfPath) => {
  // Generate actualisation/ folder if exists
  const folderExists = await exists(uploadsDeclarationDirectory)
  if (!folderExists) await mkDir(uploadsDeclarationDirectory)

  const data = {
    baseUrl: isProdEnv
      ? 'http://zen.pole-emploi.fr'
      : 'http://zen.beta.pole-emploi.fr',
    dateMonth: format(
      new Date(declaration.declarationMonth.month),
      'MMMM YYYY',
      { locale: fr },
    ),
    declarationDate: format(new Date(declaration.updatedAt), 'DD/MM/YYYY'),
    declarationTime: format(new Date(declaration.updatedAt), 'HH:MM'),
    isLookingForJob: declaration.isLookingForJob,
    dateEndLookingForJob: declaration.isLookingForJob
      ? format(new Date(), 'DDDD DD MMMM YYYY')
      : null,
    hasWorked: declaration.hasWorked,
    workHours: Math.round(
      declaration.employers.reduce(
        (prev, { workHours }) => workHours + prev,
        0,
      ),
    ),
    salary: declaration.employers.reduce(
      (prev, { salary }) => salary + prev,
      0,
    ),
    specialSituations: declaration.infos
      .filter((info) => !['jobSearch'].includes(info.type))
      .map(
        (info) =>
          `Avoir été en ${documentLabels[info.type]} ${formatIntervalDates(
            info.startDate,
            info.endDate,
          )}`,
      ),
  }

  if (!templateHTML) templateHTML = await readFile(DECLARATION_PDF_TEMPLATE)
  const html = Mustache.render(templateHTML.toString(), data)
  const pdfStream = await htmlToPdf(html)

  await writeFile(pdfPath, pdfStream, { flags: 'w' })
}

const getDeclarationPdf = async (declaration) => {
  const pdfPath = generatePdfPath(declaration)

  const fileExist = await exists(pdfPath)
  if (!fileExist) await generateDeclarationAsPdf(declaration, pdfPath)
  return readFile(pdfPath)
}

module.exports = {
  getDeclarationPdf,
  generatePdfName,
  generatePdfPath,
  getFriendlyPdfName,
  eraseFile,
}
