const mailjet = require('./mailjet')
const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')

const sendDocumentsEmail = (declaration) => {
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
    .then(() => declaration.$query().patch({ isDocEmailSent: true }))
}

module.exports = sendDocumentsEmail
