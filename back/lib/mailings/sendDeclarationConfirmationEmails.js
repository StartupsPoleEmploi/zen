const winston = require('winston')
const pdf = require('pdfjs')
const fs = require('fs')
const Helvetica = require('pdfjs/font/Helvetica')
const HelveticaBold = require('pdfjs/font/Helvetica-Bold')
const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')

const mailjet = require('./mailjet')
const Declaration = require('../../models/Declaration')

const { setDeclarationDoneProperty } = require('./manageContacts')

const { cm } = pdf

const isProd = process.env.NODE_ENV === 'production'

const logo = new pdf.Image(fs.readFileSync(`${__dirname}/logo.jpg`))
const documentFooter = new pdf.Image(
  fs.readFileSync(`${__dirname}/document-footer.jpg`),
)
// available variables: pdf, fonts, logo, lorem

const generateDocument = (declaration) => {
  const formattedDeclarationMonth = format(
    new Date(declaration.declarationMonth.month),
    'MMMM YYYY',
    { locale: fr },
  )

  const formattedDeclarationDate = format(new Date(), 'DD/MM/YYYY')

  const workHours = declaration.employers.reduce(
    (prev, employer) => parseInt(employer.workHours, 10) + prev,
    0,
  )
  const salary = declaration.employers.reduce(
    (prev, employer) => parseInt(employer.salary, 10) + prev,
    0,
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
  cell.text(
    `-        ${
      declaration.hasSickLeave ? 'Avoir' : 'Ne pas avoir'
    } été en arrêt maladie`,
  )
  cell.text(
    `-        ${
      declaration.hasSickLeave ? 'Avoir' : 'Ne pas avoir'
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

  return doc.asBuffer()
}

const sendDeclarationConfirmation = (declaration) =>
  generateDocument(declaration).then((fileBuffer) => {
    const base64File = fileBuffer.toString('base64')

    const declarationMonth = new Date(declaration.declarationMonth.month)
    const formattedDeclarationMonth = format(declarationMonth, 'MMMM YYYY', {
      locale: fr,
    })

    return mailjet
      .sendMail({
        Messages: [
          {
            From: {
              Email: 'no-reply@zen.pole-emploi.fr',
              Name: `L'équipe Zen`,
            },
            To: [
              {
                Email: declaration.user.email,
                Name: `${declaration.user.firstName} ${
                  declaration.user.lastName
                }`,
              },
            ],
            TemplateID: 504060,
            TemplateLanguage: true,
            Subject: `Votre déclaration de situation de ${formattedDeclarationMonth} a été enregistrée`,
            Variables: {
              prenom: declaration.user.firstName,
              date: formattedDeclarationMonth,
            },
            Attachments: [
              {
                ContentType: 'application/pdf',
                Filename: `Actualisation ${formattedDeclarationMonth}.pdf`,
                Base64Content: base64File,
              },
            ],
            CustomCampaign: `Confirmation de transmission de déclaration - ${format(
              declarationMonth,
              'MM/YYYY',
            )}`,
          },
        ],
      })
      .then(() => declaration.$query().patch({ isEmailSent: true }))
  })

let isSendingEmails = false

const sendDeclarationConfirmations = () => {
  if (isSendingEmails) return
  isSendingEmails = true

  return Declaration.query()
    .eager('[declarationMonth, user, employers]')
    .where({ hasFinishedDeclaringEmployers: true, isEmailSent: false })
    .then((declarations) =>
      Promise.all(
        declarations.map((declaration) => {
          if (!declaration.user.email) {
            // no user email, getting rid of this
            return declaration.$query().patch({ isEmailSent: true })
          }

          let promise = Promise.resolve()
          if (isProd) {
            promise = setDeclarationDoneProperty(declaration)
          }

          return promise
            .then(() => sendDeclarationConfirmation(declaration))
            .then(() => declaration.$query().patch({ isEmailSent: true }))
            .catch((err) =>
              winston.error(
                `There was an error while sending confirmation email for declaration ${
                  declaration.id
                }: ${err}`,
              ),
            )
        }),
      ),
    )
    .then(() => {
      isSendingEmails = false
    })
    .catch(() => {
      isSendingEmails = false
    })
}

module.exports = sendDeclarationConfirmations
