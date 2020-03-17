const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')

const userCtrl = require('../../controllers/userCtrl')
const winston = require('../log')
const mailjet = require('./mailjet')

function $getFormatedDate() {
  const formattedMonth = format(new Date(), 'MMMM', { locale: fr })
  // writing « d'août » or « de septembre »
  // months for « d' » : avril, août, octobre
  const formattedDate =
    formattedMonth.startsWith('a') || formattedMonth.startsWith('o')
      ? `d'${formattedMonth}`
      : `de ${formattedMonth}`
  return formattedDate;
}

/*
 * This script has one big requirement: That it will be run on the 28 (or 29, 30 or 31) of
 * the concerned declaration month. (eg. 28/01 for January declarations)
 * If this is not respected, the date labels will be wrong.
 */
async function sendDeclarationCampaign() {
  winston.info('[CRON] DEBUT_ACTUALISATION: START')
  const CustomCampaign = `Lancement actu ${format(new Date(), 'MM/YYYY')}`;
  const date = $getFormatedDate();
  const allUsers = await userCtrl.getActiveUsers();

  while (allUsers.length) {
    winston.info(`[CRON] DEBUT_ACTUALISATION: Still ${allUsers.length} users`)
    const users = allUsers.splice(0, 50).filter(e => !!e.email);
    // eslint-disable-next-line no-await-in-loop
    await mailjet.sendMail({
      Messages: users.map(user => ({
        From: { Email: 'no-reply@zen.pole-emploi.fr', Name: `L'équipe Zen` },
        To: [{ Email: user.email, Name: `${user.firstName} ${user.lastName}` }],
        TemplateID: 494021,
        TemplateLanguage: true,
        Subject: 'L’actualisation Zen commence aujourd’hui',
        Title: CustomCampaign,
        Variables: { prenom: user.firstName, date },
        CustomCampaign,
      })),
    }).catch((err) => {
      winston.info(`[CRON] DEBUT_ACTUALISATION: ERROR users in the pipe`, { users: users.map(u => u.email) });
      winston.error(`There was an error while sending email "DEBUT_ACTUALISATION" : ${err}`);
    });
  }
  winston.info('[CRON] DEBUT_ACTUALISATION: END')
}
  

module.exports = sendDeclarationCampaign
