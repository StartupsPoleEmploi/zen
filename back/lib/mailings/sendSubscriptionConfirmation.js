const mailjetRequest = require('./mailjetRequest')

const isProduction = process.env.NODE_ENV === 'production'

const sendSubscriptionConfirmation = (user) =>
  mailjetRequest({
    SandboxMode: !isProduction, // Mailjet *will* send e-mails out of prod if this line is removed
    Messages: [
      {
        From: {
          Email: 'no-reply@zen.pole-emploi.fr',
          Name: `L'équipe Zen`,
        },
        To: [
          {
            Email: user.email,
            Name: `${user.firstName} ${user.lastName}`,
          },
        ],
        TemplateID: 503392,
        TemplateLanguage: true,
        Subject: `Votre demande d'inscription à Zen a été enregistrée`,
        Variables: {
          prenom: user.firstName,
        },
      },
    ],
  })

module.exports = sendSubscriptionConfirmation
