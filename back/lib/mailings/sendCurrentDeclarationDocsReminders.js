/* eslint-disable no-await-in-loop */
const { format, subMonths, subDays } = require('date-fns')
const fr = require('date-fns/locale/fr')
const { chunk, get } = require('lodash')
const { getCampaignTemplate, sendMail } = require('./mailjet')

const documentLabels = require('../../constants/documentLabels')
const DeclarationMonth = require('../../models/DeclarationMonth')
const Declaration = require('../../models/Declaration')
const EmployerDocument = require('../../models/EmployerDocument')
const User = require('../../models/User')
const winston = require('../log')

const DOCS_REMINDER_TEMPLATE_ID = 915059

const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))

/*
 * This script has one big requirement: That it will be run during the month after
 * the concerned declaration month. (eg. Februrary the 2nd, for example, for January declarations)
 * AND while the declaration period is still on (eg. January 28th and February 15th)
 * If this is not respected, the date labels will be wrong.
 */
const sendCurrentDeclarationDocsReminder = () => {
  const lastMonth = subMonths(new Date(), 1)
  const formattedMonthInFrench = format(lastMonth, 'MMMM YYYY', { locale: fr })

  return DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first()
    .then((activeMonth) => {
      if (!activeMonth) throw new Error('No active month')

      return Promise.all([
        // Get unfinished declarations from users who have not received a reminder in the last day
        Declaration.query()
          .eager('[declarationMonth, infos, user, employers.documents]')
          .join('Users', 'Users.id', '=', 'declarations.userId')
          .where({
            isFinished: false,
            hasFinishedDeclaringEmployers: true,
            monthId: activeMonth.id,
          })
          .andWhere(function() {
            this.where(
              'Users.lastDocsReminderDate',
              '<',
              subDays(new Date(), 1),
            ).orWhereNull('Users.lastDocsReminderDate')
          }),
        getCampaignTemplate(DOCS_REMINDER_TEMPLATE_ID),
      ])
        .then(async ([allDeclarations, campaignTemplateResult]) => {
          const { 'Html-part': html, 'Text-part': text } = get(
            campaignTemplateResult,
            'body.Data.0',
            {},
          )
          if (!html || !text) {
            throw new Error(
              `No HTML or text part for template ${DOCS_REMINDER_TEMPLATE_ID}`,
            )
          }

          const declarationChunks = chunk(allDeclarations, 50)

          for (const declarations of declarationChunks) {
            const messages = declarations.map((declaration) => {
              const documents = declaration.infos
                .filter(({ isTransmitted, file }) => !isTransmitted && !file)
                .map(({ type }) => documentLabels[type])
                .concat(
                  declaration.employers.reduce((prev, employer) => {
                    if (
                      employer.hasEndedThisMonth &&
                      !employer.documents.some(
                        (doc) =>
                          doc.type ===
                          EmployerDocument.types.employerCertificate,
                      )
                    ) {
                      return prev.concat(
                        `${documentLabels.employerCertificate} ${
                          employer.employerName
                        }`,
                      )
                    }
                    if (employer.documents.length === 0) {
                      return prev.concat(
                        `${documentLabels.salarySheet} ${
                          employer.employerName
                        }`,
                      )
                    }
                    return prev
                  }, []),
                )

              const regexpDate = new RegExp('{{var:date:""}}', 'ig')
              const regexpDocs = new RegExp('{{var:documents:""}}', 'ig')

              const interpolatedHtml = html
                .replace(regexpDate, formattedMonthInFrench)
                .replace(
                  regexpDocs,
                  documents.length > 0
                    ? documents.map((doc) => `<li>${doc}</li>`).join('')
                    : '<li>Merci de vous connecter pour <b>valider</b> les justificatifs transmis</li>',
                )
              const interpolatedText = text
                .replace(regexpDate, formattedMonthInFrench)
                .replace(
                  regexpDocs,
                  documents.length > 0
                    ? documents.join('\n')
                    : 'Merci de vous connecter pour *valider* les justificatifs transmis\n',
                )

              return {
                DeduplicateCampaign: true,
                From: {
                  Email: 'no-reply@zen.pole-emploi.fr',
                  Name: `L'équipe Zen Pôle Emploi`,
                },
                To: [
                  {
                    Email: declaration.user.email,
                    Name: `${declaration.user.firstName} ${
                      declaration.user.lastName
                    }`,
                  },
                ],
                HTMLPart: interpolatedHtml,
                TextPart: interpolatedText,
                Subject:
                  documents.length > 0
                    ? 'Nous attendons vos justificatifs'
                    : `Vous n'avez pas validé vos justificatifs`,
                Variables: {
                  prenom: declaration.user.firstName,
                },
                CustomCampaign: `Rappel docs actu ${formattedMonthInFrench}`,
              }
            })

            await sendMail({
              Messages: messages,
            })

            await User.query()
              .patch({
                lastDocsReminderDate: new Date(),
              })
              .whereIn('id', declarations.map(({ user }) => user.id))

            await wait(3000) // wait 3 seconds between each loop (trying to avoid mailjet quota error)
          }
        })
        .catch((err) => {
          winston.error(
            'There was an error while sending reminder emails. The process will start again in 5 minutes.',
          )
          winston.error(err)
          setTimeout(sendCurrentDeclarationDocsReminder, 300000)
        })
    })
}

module.exports = sendCurrentDeclarationDocsReminder
