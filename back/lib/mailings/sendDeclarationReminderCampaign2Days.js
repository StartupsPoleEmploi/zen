const mailjet = require('./mailjet');
const winston = require('../log');
const monthCtrl = require('../../controllers/monthCtrl');
const userCtrl = require('../../controllers/userCtrl');

/**
 * Send email to users that has not start declaration of the current month into zen.
 */
async function sendDeclarationReminderCampaign2Days() {
  const currentMonth = await monthCtrl.getCurrentMonth();
  if (!currentMonth) throw new Error('[sendDeclarationReminderCampaign2Days] No active month');

  const allUsers = await userCtrl.getUsersWithoutDeclaration(currentMonth.id);
  while (allUsers.length) {
    const users = allUsers.splice(0, 50).filter((e) => !!e.email);
    // eslint-disable-next-line no-await-in-loop
    await mailjet.sendMail({
      Messages: users.map((user) => ({
        From: { Email: 'no-reply@zen.pole-emploi.fr', Name: 'L\'équipe Zen' },
        To: [{ Email: user.email, Name: `${user.firstName} ${user.lastName}` }],
        TemplateID: 1107170,
        TemplateLanguage: true,
        Subject: 'Plus que 2 jours pour vous actualiser !',
        Title: 'Plus que 2 jours pour vous actualiser !',
        Variables: {
          prenom: user.firstName,
          peid: user.peId,
        },
        CustomCampaign: 'Plus que 2 jours pour vous actualiser !',
      })),
    }).catch((err) => {
      winston.error(`There was an error while sending email "RAPPEL_ACTU_2J" : ${err}`);
    });
  }
}

module.exports = sendDeclarationReminderCampaign2Days;
