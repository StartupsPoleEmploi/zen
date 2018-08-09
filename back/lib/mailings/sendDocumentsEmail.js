const mailjetRequest = require('./mailjetRequest')
const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')

const isProduction = process.env.NODE_ENV === 'production'

const sendDocumentsEmail = (declaration) => {
  const declarationMonth = new Date(declaration.declarationMonth.month)
  const formattedDeclarationMonth = format(declarationMonth, 'MMMM YYYY', {
    locale: fr,
  })

  return mailjetRequest({
    SandboxMode: !isProduction, // Mailjet *will* send e-mails out of prod if this line is removed
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
      },
    ],
  })
}

module.exports = sendDocumentsEmail
