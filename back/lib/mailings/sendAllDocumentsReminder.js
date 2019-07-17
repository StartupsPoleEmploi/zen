/* eslint-disable no-await-in-loop */
const { format, subDays } = require('date-fns')
const fr = require('date-fns/locale/fr')
const { chunk, get, orderBy } = require('lodash')
const { getCampaignTemplate, sendMail } = require('./mailjet')

const documentLabels = require('../../constants/documentLabels')
const EmployerDocument = require('../../models/EmployerDocument')
const User = require('../../models/User')
const winston = require('../log')

const ALL_DOCS_REMINDER_TEMPLATE_ID = 915055

const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))
const getFormattedMonthAndYear = (date) =>
  format(date, 'MMMM YYYY', { locale: fr })

const sendAllDocumentsReminder = () => {
  return Promise.all([
    // Get unfinished declarations from users who have not received a reminder in the last day
    User.query()
      .eager('[declarations.[declarationMonth, infos, employers.documents]]')
      .join('declarations', 'declarations.userId', '=', 'Users.id')
      .where(function() {
        this.where(
          'lastDocsReminderDate',
          '<',
          subDays(new Date(), 1),
        ).orWhereNull('lastDocsReminderDate')
      })
      .andWhere({
        'declarations.isFinished': false,
        'declarations.hasFinishedDeclaringEmployers': true,
      }),
    getCampaignTemplate(ALL_DOCS_REMINDER_TEMPLATE_ID),
  ])
    .then(async ([allUsers, campaignTemplateResult]) => {
      const { 'Html-part': html, 'Text-part': text } = get(
        campaignTemplateResult,
        'body.Data.0',
        {},
      )
      if (!html || !text) {
        throw new Error(
          `No HTML or text part for template ${ALL_DOCS_REMINDER_TEMPLATE_ID}`,
        )
      }

      const userChunks = chunk(allUsers, 50)

      for (const users of userChunks) {
        const messages = users.map((user) => {
          const documents = orderBy(
            user.declarations,
            'monthId',
            'desc',
          ).reduce(
            (prev, declaration) =>
              prev.concat(
                declaration.infos
                  .filter(({ isTransmitted, file }) => !isTransmitted && !file)
                  .map(
                    ({ type }) =>
                      `${documentLabels[type]} / ${getFormattedMonthAndYear(
                        declaration.declarationMonth.month,
                      )}`,
                  )
                  .concat(
                    declaration.employers.reduce(
                      (declarationPrev, employer) => {
                        if (
                          employer.hasEndedThisMonth &&
                          !employer.documents.some(
                            (doc) =>
                              doc.type ===
                              EmployerDocument.types.employerCertificate,
                          )
                        ) {
                          return declarationPrev.concat(
                            `${documentLabels.employerCertificate} ${
                              employer.employerName
                            } / ${getFormattedMonthAndYear(
                              declaration.declarationMonth.month,
                            )}`,
                          )
                        }
                        if (employer.documents.length === 0) {
                          return declarationPrev.concat(
                            `${documentLabels.salarySheet} ${
                              employer.employerName
                            } / ${getFormattedMonthAndYear(
                              declaration.declarationMonth.month,
                            )}`,
                          )
                        }
                        return declarationPrev
                      },
                      [],
                    ),
                  ),
              ),
            [],
          )

          const listedDocuments = documents.slice(0, 10)
          const remainingDocumentsNb = documents.length - listedDocuments.length

          const regexpDocs = new RegExp('{{var:documents:""}}', 'ig')

          const interpolatedHtml = html.replace(
            regexpDocs,
            listedDocuments.length > 0
              ? listedDocuments
                  .map((doc) => `<li>${doc}</li>`)
                  .concat(
                    remainingDocumentsNb > 0
                      ? `<li>et ${remainingDocumentsNb} autres justificatifs</li>`
                      : '',
                  )
                  .join('')
              : '<li>Merci de vous connecter pour <b>valider</b> les justificatifs transmis</li>',
          )
          const interpolatedText = text.replace(
            regexpDocs,
            listedDocuments.length > 0
              ? listedDocuments
                  .concat(
                    remainingDocumentsNb > 0
                      ? `Et ${remainingDocumentsNb} autres justificatifs\n`
                      : '',
                  )
                  .join('\n')
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
                Email: user.email,
                Name: `${user.firstName} ${user.lastName}`,
              },
            ],
            HTMLPart: interpolatedHtml,
            TextPart: interpolatedText,
            Subject: `Votre dossier Pôle emploi n'est pas à jour`,
            Variables: {
              prenom: user.firstName,
            },
            CustomCampaign: `Rappel docs global ${getFormattedMonthAndYear(
              new Date(),
            )}`,
          }
        })

        await sendMail({
          Messages: messages,
        })

        await User.query()
          .patch({
            lastDocsReminderDate: new Date(),
          })
          .whereIn('id', users.map((user) => user.id))

        await wait(3000) // wait 3 seconds between each loop (trying to avoid mailjet quota error)
      }
    })
    .catch((err) => {
      winston.error(
        'There was an error while sending reminder emails. The process will start again in 5 minutes.',
      )
      winston.error(err)
      setTimeout(sendAllDocumentsReminder, 300000)
    })
}

module.exports = sendAllDocumentsReminder
