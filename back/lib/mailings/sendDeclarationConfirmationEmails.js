const { format } = require('date-fns')
const fr = require('date-fns/locale/fr')
const async = require('async')

const mailjet = require('./mailjet')
const winston = require('../log')
const Declaration = require('../../models/Declaration')
const { getDeclarationPdf } = require('../pdfGenerators/declarationProof')
const { setDeclarationDoneProperty } = require('./manageContacts')

const isProd = process.env.NODE_ENV === 'production'

const sendDeclarationConfirmationEmail = (declaration) =>
  getDeclarationPdf(declaration).then((fileBuffer) => {
    const base64File = fileBuffer.toString('base64')

    const declarationMonth = new Date(declaration.declarationMonth.month)
    const formattedDeclarationMonth = format(declarationMonth, 'MMMM YYYY', {
      locale: fr,
    })

    return mailjet
      .sendMail({
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
            TemplateID: 1063091,
            TemplateLanguage: true,
            Subject: `Votre déclaration de situation de ${formattedDeclarationMonth} a été enregistrée`,
            Variables: {
              prenom: declaration.user.firstName,
              date: formattedDeclarationMonth,
            },
            Attachments: [
              {
                ContentType: 'application/pdf',
                Filename: `Actualisation ${formattedDeclarationMonth}.pdf`,
                Base64Content: base64File,
              },
            ],
            CustomCampaign: `Confirmation de transmission de déclaration - ${format(
              declarationMonth,
              'MM/YYYY',
            )}`,
          },
        ],
      })
      .then(() => declaration.$query().patch({ isEmailSent: true }))
  })

let isSendingEmails = false

async function sendDeclarationConfirmationEmails() {
  if (isSendingEmails) return
  isSendingEmails = true

  try {
    const declarations = await Declaration.query()
      .eager('[declarationMonth, user, employers, infos]')
      .where({ hasFinishedDeclaringEmployers: true, isEmailSent: false });

    await async.eachSeries(declarations, async (declaration) => {
      // no user email, getting rid of this
      if (!declaration.user.email) return declaration.$query().patch({ isEmailSent: true });

      const logInfo = { declarationId: declaration.id, userId: declaration.userId };
      // todo verify if setDeclarationDoneProperty is still useful
      let canContinue = true;
      if (isProd) {
        await setDeclarationDoneProperty(declaration).catch(err => {
          canContinue = false;
          winston.warn(`[CRON] There was an error while sending DoneProperty into mailjet for declaration ${declaration.id}: ${err}`, logInfo);
        })
      }
      if (!canContinue) return;

      await sendDeclarationConfirmationEmail(declaration)
        .then(() => declaration.$query().patch({ isEmailSent: true }))
        .catch((err) => {
          winston.warn(`[CRON] There was an error while sending confirmation email for declaration ${declaration.id}: ${err}`, logInfo);
        })
    })
  } catch (error) {
    winston.warn(`[CRON] Error on sendDeclarationConfirmationEmails ${error}`, { error });
  }
  isSendingEmails = false
}

module.exports = sendDeclarationConfirmationEmails
