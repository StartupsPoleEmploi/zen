const fs = require('fs');
const util = require('util');
const { format } = require('date-fns');
const fr = require('date-fns/locale/fr');
const Mustache = require('mustache');

const { uploadsDeclarationDirectory } = require('config');
const { htmlToPdf } = require('../utils');

const isProdEnv = process.env.NODE_ENV === 'prod';
const DECLARATION_PDF_TEMPLATE = `${__dirname}/declarationPdf.mst`;

const exists = util.promisify(fs.exists);
const mkDir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
let templateHTML; // For caching

const DOCUMENT_LABELS = {
  sickLeave: 'Avoir été en arrêt maladie',
  internship: 'Avoir été en stage',
  maternityLeave: 'Avoir été en congé maternité',
  retirement: 'Percevoir une nouvelle pension retraite',
  invalidity: 'Percevoir une nouvelle pension d’invalidité',
};

const formatIntervalDates = (startDate, endDate) => {
  const startString = format(new Date(startDate), 'DD/MM/YYYY');
  if (!endDate) return `le ${startString}`;

  const endString = format(new Date(endDate), 'DD/MM/YYYY');
  return `du ${startString} au ${endString}`;
};

const generatePdfName = (declaration) => {
  const declarationDate = format(declaration.declarationMonth.month, 'YYYY-MM');
  return `${declarationDate}__${declaration.userId}.pdf`;
};

function getFriendlyPdfName({ declarationMonth: { month } }) {
  const declarationDate = format(month, 'MMMM-YYYY', { locale: fr });
  return `declaration-${declarationDate}.pdf`;
}

const generatePdfPath = (declaration) =>
  `${uploadsDeclarationDirectory}${generatePdfName(declaration)}`;

function lowerCaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

const generateDeclarationAsPdf = async (declaration, pdfPath) => {
  // Generate actualisation/ folder if not exists
  const folderExists = await exists(uploadsDeclarationDirectory);
  if (!folderExists) await mkDir(uploadsDeclarationDirectory);

  const data = {
    user: {
      email: declaration.user.email.toLowerCase(),
      firstName: declaration.user.firstName,
      lastName: declaration.user.lastName.toUpperCase(),
    },
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
    specialSituations: Object.entries(DOCUMENT_LABELS).map(([key, val]) => {
      const info = declaration.infos.find((e) => e.type === key);
      if (info) {
        return `${val} ${formatIntervalDates(info.startDate, info.endDate)}`;
      }
      return `Ne pas ${lowerCaseFirstLetter(val)}`;
    }),
  };

  if (!templateHTML) templateHTML = await readFile(DECLARATION_PDF_TEMPLATE);
  const html = Mustache.render(templateHTML.toString(), data);
  const pdfStream = await htmlToPdf(html);

  await writeFile(pdfPath, pdfStream, { flags: 'w' });
};

const getDeclarationPdf = async (declaration) => {
  const pdfPath = generatePdfPath(declaration);

  const fileExist = await exists(pdfPath);
  if (!fileExist) await generateDeclarationAsPdf(declaration, pdfPath);
  return readFile(pdfPath);
};

module.exports = {
  getDeclarationPdf,
  generatePdfPath,
  getFriendlyPdfName,
};
