const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')
const winston = require('winston')
const mailjet = require('./mailjet')

const Declaration = require('../../models/Declaration')

const { setDocumentsDoneProperty } = require('./manageContacts')

const isProd = process.env.NODE_ENV === 'production'

const sendDocumentsEmail = (declaration) => {
  const declarationMonth = new Date(declaration.declarationMonth.month)
  const formattedDeclarationMonth = format(declarationMonth, 'MMMM YYYY', {
    locale: fr,
  })

  return mailjet.sendMail({
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
        TemplateID: 504201,
        TemplateLanguage: true,
        Subject: `Vos documents ont bien été transmis`,
        Variables: {
          prenom: declaration.user.firstName,
          date: formattedDeclarationMonth,
        },
        CustomCampaign: `Confirmation d'envoi de documents - ${format(
          declarationMonth,
          'MM/YYYY',
        )}`,
      },
    ],
  })
}

let isSendingEmails = false

const sendDocumentsConfirmationEmails = () => {
  if (isSendingEmails) return
  isSendingEmails = true

  return Declaration.query()
    .eager('[declarationMonth, user]')
    .where({ isFinished: true, isDocEmailSent: false })
    .then((declarations) =>
      Promise.all(
        declarations.map((declaration) => {
          if (!declaration.user.email) {
            // no user email, getting rid of this
            return declaration.$query().patch({ isDocEmailSent: true })
          }

          let promise = Promise.resolve()
          if (isProd) {
            promise = setDocumentsDoneProperty(declaration)
          }

          return promise
            .then(
              () =>
                // Don't send the e-mail if the user hasn't sent any document
                Declaration.needsDocuments(declaration)
                  ? sendDocumentsEmail(declaration)
                  : Promise.resolve(),
            )
            .then(() => declaration.$query().patch({ isDocEmailSent: true }))
            .catch((err) =>
              winston.error(
                `There was an error while sending docs email for declaration ${
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

module.exports = sendDocumentsConfirmationEmails
