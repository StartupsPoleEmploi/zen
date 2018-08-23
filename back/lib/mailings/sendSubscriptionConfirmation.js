const mailjet = require('./mailjet')

const sendSubscriptionConfirmation = (user) =>
  Promise.all([
    mailjet.sendMail({
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
          CustomCampaign: "Confirmation d'inscription",
        },
      ],
    }),
    mailjet.manageContact({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      properties: {
        nom: user.lastName,
        prenom: user.firstName,
        validation_necessaire: true,
      },
    }),
  ])

module.exports = sendSubscriptionConfirmation
