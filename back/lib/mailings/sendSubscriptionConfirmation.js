const NodeMailjet = require('node-mailjet')

const isProduction = process.env.NODE_ENV === 'production'

if (!process.env.EMAIL_KEY || !process.env.EMAIL_KEY_SECRET) {
  throw new Error('Mailjet info is not configured')
}

const mailjet = NodeMailjet.connect(
  process.env.EMAIL_KEY,
  process.env.EMAIL_KEY_SECRET,
  { version: 'v3.1' },
)

const sendSubscriptionConfirmation = (user) =>
  mailjet.post('send', { version: 'v3.1' }).request({
    SandboxMode: !isProduction,
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
