const mailjet = require('./mailjet')
const winston = require('../log')
const Declaration = require('../../models/Declaration')
const DeclarationMonth = require('../../models/DeclarationMonth')

// En tant que assmat je veux qu'on me rappels par mails si j'ai pas fini mon actu, afin d'éviter des TP
// Cela arrive si l'utilisateur quitte le site avant la validation de l'actualisation 
// en cliquent sur "Enregistrer et revenir plus tard"

async function $sendDeclarationOfUser(user) {
  return mailjet.sendMail({
    Messages: [
      {
        From: { Email: 'no-reply@zen.pole-emploi.fr', Name: `L'équipe Zen` },
        To: [{ Email: user.email, Name: `${user.firstName} ${user.lastName}` }],
        TemplateID: 1105638,
        TemplateLanguage: true,
        Subject: `Vous êtes à quelques clics de valider votre actualisation...`,
        Variables: {
          prenom: user.firstName,
        },
        CustomCampaign: "Déclaration non finie",
      },
    ],
  });
}

async function $getCurrentMonth() {
  return DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first();
}

async function sendCurrentDeclarationNotFinish() {
  const currentMonth = await $getCurrentMonth();
  if (!currentMonth) throw new Error('[sendDeclarationNotFinish] No active month')

  const declarations = await Declaration.query().eager('[user]')
    .where({ hasFinishedDeclaringEmployers: false, monthId: currentMonth.id });
  await Promise.all(
    declarations.map((declaration) => $sendDeclarationOfUser(declaration.user)
        .catch((err) => {
          const { user } = declaration;
          winston.error(
            `There was an error while sending email "ACTU_NON_TERMINEE" for user "${user.email} (${user.id})"; declaration ${declaration.id}: ${err}`,
          );
        })
    ),
  );
}

module.exports = sendCurrentDeclarationNotFinish
