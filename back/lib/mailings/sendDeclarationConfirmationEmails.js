const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')

const mailjet = require('./mailjet')
const winston = require('../log')
const Declaration = require('../../models/Declaration')
const { getDeclarationPdf } = require('../pdfGenerators/declarationProof')
const { setDeclarationDoneProperty } = require('./manageContacts')

const isProd = process.env.NODE_ENV === 'production'

const sendDeclarationConfirmationEmail = (declaration) =>
  getDeclarationPdf(declaration).then((fileBuffer) => {
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
                Name: `${declaration.user.firstName} ${declaration.user.lastName}`,
              },
            ],
            TemplateID: 1063091,
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

const sendDeclarationConfirmationEmails = () => {
  if (isSendingEmails) return
  isSendingEmails = true

  return Declaration.query()
    .eager('[declarationMonth, user, employers, infos]')
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
            .then(() => sendDeclarationConfirmationEmail(declaration))
            .then(() => declaration.$query().patch({ isEmailSent: true }))
            .catch((err) =>
              winston.error(
                `There was an error while sending confirmation email for declaration ${declaration.id}: ${err}`,
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

module.exports = sendDeclarationConfirmationEmails
