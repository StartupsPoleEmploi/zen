const pdf = require('pdfjs')
const fs = require('fs')
const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')

const Helvetica = require('pdfjs/font/Helvetica')
const HelveticaBold = require('pdfjs/font/Helvetica-Bold')
const { uploadsDeclarationDirectory } = require('config')

const { cm } = pdf

const logo = new pdf.Image(fs.readFileSync(`${__dirname}/mailings/logo.jpg`))
const documentFooter = new pdf.Image(
  fs.readFileSync(`${__dirname}/mailings/document-footer.jpg`),
)

const generatePDFName = (declaration) => {
  const declarationDate = format(declaration.declarationMonth.month, 'YYYY-MM')

  return `${declarationDate}__${declaration.userId}.pdf`
}

const getFriendlyPDFName = (declaration) => {
  const declarationDate = format(
    declaration.declarationMonth.month,
    'MMMM-YYYY',
    { locale: fr },
  )
  return `declaration-${declarationDate}.pdf`
}

const generatePDFPath = (declaration) =>
  `${uploadsDeclarationDirectory}${generatePDFName(declaration)}`

/* Generate and save PDF from a given declaration */
const generateDeclarationAsPDF = (declaration) => {
  // Available variables: pdf, fonts, logo, lorem
  const formattedDeclarationMonth = format(
    new Date(declaration.declarationMonth.month),
    'MMMM YYYY',
    { locale: fr },
  )

  const formattedDeclarationDate = format(new Date(), 'DD/MM/YYYY')

  const workHours = Math.round(
    declaration.employers.reduce(
      (prev, employer) => employer.workHours + prev,
      0,
    ),
  )
  const salary = Math.round(
    declaration.employers.reduce((prev, employer) => employer.salary + prev, 0),
  )

  const doc = new pdf.Document({
    font: Helvetica,
  })

  const header = doc.cell()
  header
    .cell({ paddingTop: 2 * cm })
    .image(logo, { height: cm, align: 'center' })
  header
    .cell({ paddingTop: 1 * cm })
    .text('Justificatif de Télé-actualisation par internet', {
      textAlign: 'center',
      fontSize: 14,
    })
  header
    .cell({ paddingTop: 1 * cm })
    .text(
      `Votre déclaration de Situation mensuelle du mois de ${formattedDeclarationMonth} a été enregistrée le ${formattedDeclarationDate}`,
      { textAlign: 'center', font: HelveticaBold },
    )

  const cell = doc.cell({ paddingTop: 1 * cm })
  cell.text('Vous avez déclaré :', { font: HelveticaBold }).br()

  cell.text(
    `-        ${
      declaration.isLookingForJob ? 'Être toujours' : 'Ne plus être'
    } à la recherche d'un emploi`,
  )
  cell.text(
    declaration.hasWorked
      ? `-        Avoir travaillé ${workHours} heures et avoir perçu un salaire brut de ${salary} euros`
      : `-        Ne pas avoir travaillé`,
  )
  cell.text(
    `-        ${
      declaration.hasInternship ? 'Avoir' : 'Ne pas avoir'
    } été en stage`,
  )
  cell.text(`-        Ne pas être créateur / créatrice d'entreprise`)
  cell.text(
    `-        ${
      declaration.hasSickLeave ? 'Avoir' : 'Ne pas avoir'
    } été en arrêt maladie`,
  )
  cell.text(
    `-        ${
      declaration.hasMaternityLeave ? 'Avoir' : 'Ne pas avoir'
    } été en congé maternité`,
  )
  cell.text(
    `-        ${
      declaration.hasRetirement ? 'Percevoir' : 'Ne pas percevoir'
    } une nouvelle pension retraite`,
  )
  cell.text(
    `-        ${
      declaration.hasInvalidity ? 'Percevoir' : 'Ne pas percevoir'
    } une nouvelle pension d’invalidité de 2ème et 3ème catégorie`,
  )

  if (declaration.isLookingForJob) {
    doc.cell(
      'En fonction de ces informations, votre inscription sur la liste des demandeurs d’emploi est maintenue.',
      { paddingTop: 1 * cm },
    )
  }

  doc.cell(
    'Sur la base de cette déclaration et sous certaines conditions, vous pourrez bénéficier d’un paiement provisoire par avance. Dans le cas contraire, vos paiements sont suspendus dans l’attente de vos justificatifs.',

    { font: HelveticaBold, paddingTop: 0.5 * cm, fontSize: 10 },
  )

  doc.cell('ATTENTION', { font: HelveticaBold, paddingTop: 1 * cm })

  doc
    .cell({ paddingTop: 1 * cm })
    .text()
    .add('Si vous n’avez pas encore envoyé vos documents')
    .add('Attestation Employeur, Bulletin de paie, etc.', {
      font: HelveticaBold,
    })
    .add(') n’oubliez pas de vous reconnecter sur le site internet ')
    .add('http://zen.pole-emploi.fr/', { font: HelveticaBold })
    .add(' pour finaliser votre dossier.')

  doc
    .cell({ paddingTop: 2 * cm })
    .image(documentFooter, { width: 18 * cm, align: 'center' })

  // Save file
  const filePath = generatePDFPath(declaration)

  return new Promise((resolve, reject) => {
    doc
      .asBuffer()
      .then((pdfContent) => {
        fs.writeFile(filePath, pdfContent, { flag: 'w' }, function(err) {
          if (err) return reject(err)
          resolve(pdfContent)
        })
      })
      .catch(reject)
  })
}

const getDeclarationPDF = (declaration) => {
  const pdfPath = generatePDFPath(declaration)

  return new Promise((resolve, reject) => {
    fs.access(pdfPath, (error) => {
      if (error) {
        generateDeclarationAsPDF(declaration)
          .then(resolve)
          .catch(reject)
      } else {
        fs.readFile(pdfPath, function(err, fileContent) {
          if (err) reject(err)
          resolve(fileContent)
        })
      }
    })
  })
}

module.exports = {
  getDeclarationPDF,
  generatePDFName,
  generatePDFPath,
  getFriendlyPDFName,
}
