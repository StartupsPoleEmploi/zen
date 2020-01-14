const mailjet = require('./mailjet')
const winston = require('../log')
const User = require('../../models/User')
const DeclarationMonth = require('../../models/DeclarationMonth')
const Declaration = require('../../models/Declaration')

async function $getCurrentMonth() {
  return DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first(); 
}

async function $getUserWithoutDeclaration(declarationMonth) {
  const declarations = await Declaration.query()
    .where('monthId', '=', declarationMonth.id)
    .column('userId');
  return User.query()
    .whereNotNull('Users.registeredAt')
    .andWhere('Users.isBlocked', '=', false)
    .andWhere('Users.isAuthorized', '=', true)
    .andWhere('Users.isActuDone', '=', false)
    .whereNotIn('id', declarations.map(d => d.userId))
}

/**
 * Send email to users that has not start declaration of the current month into zen.
 */
async function sendDeclarationReminderCampaign() {
  const currenMonth = await $getCurrentMonth();
  if (!currenMonth) throw new Error('[sendDeclarationReminderCampaign] No active month');

  let users = await $getUserWithoutDeclaration(currenMonth);
  users = users.slice(0, 3);
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

module.exports = sendDeclarationReminderCampaign;