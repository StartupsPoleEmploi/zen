const mailjet = require('./mailjet')
const winston = require('../log')
const monthCtrl = require('../../controllers/monthCtrl')
const userCtrl = require('../../controllers/userCtrl')

/**
 * Send email to users that has not start declaration of the current month into zen.
 */
async function sendDeclarationReminderCampaign() {
  const currentMonth = await monthCtrl.getCurrentMonth();
  if (!currentMonth) throw new Error('[sendDeclarationReminderCampaign] No active month');

  const allUsers = await userCtrl.getUsersWithoutDeclaration(currentMonth.id);
  while (allUsers.length) {
    const users = allUsers.splice(0, 50).filter(e => !!e.email);
    // eslint-disable-next-line no-await-in-loop
    await mailjet.sendMail({
      Messages: users.map(user => ({
        From: { Email: 'no-reply@zen.pole-emploi.fr', Name: `L'équipe Zen` },
        To: [{ Email: user.email, Name: `${user.firstName} ${user.lastName}` }],
        TemplateID: 502257,
        TemplateLanguage: true,
        Subject: 'Avez-vous pensé à vous actualiser ?',
        Variables: {
          prenom: user.firstName,
        },
      })),
    }).catch((err) => {
      winston.error(`There was an error while sending email "RAPPEL_ACTU" : ${err}`);
    });
  }
}

module.exports = sendDeclarationReminderCampaign;