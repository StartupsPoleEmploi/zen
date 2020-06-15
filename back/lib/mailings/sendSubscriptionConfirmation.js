const mailjet = require('./mailjet');

async function sendSubscriptionConfirmation(user) {
  return mailjet.sendMail({
    Messages: [
      {
        From: { Email: 'no-reply@zen.pole-emploi.fr', Name: 'L\'équipe Zen' },
        To: [{ Email: user.email, Name: `${user.firstName} ${user.lastName}` }],
        TemplateID: 725394,
        TemplateLanguage: true,
        Subject: 'Bienvenue sur Zen !',
        Variables: {
          prenom: user.firstName,
        },
        CustomCampaign: "Confirmation d'inscription",
      },
    ],
  });
}

module.exports = sendSubscriptionConfirmation;
