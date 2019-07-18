/* eslint-disable no-await-in-loop */
const { format, subMonths, subDays } = require('date-fns')
const fr = require('date-fns/locale/fr')
const { chunk, orderBy } = require('lodash')

const { getTemplate, sendMail } = require('./mailjet')
const DeclarationMonth = require('../../models/DeclarationMonth')
const Declaration = require('../../models/Declaration')
const EmployerDocument = require('../../models/EmployerDocument')
const User = require('../../models/User')
const winston = require('../log')

const ALL_DOCS_REMINDER_TEMPLATE_ID = 915055
const DOCS_REMINDER_TEMPLATE_ID = 915059

const documentLabels = {
  sickLeave: 'Feuille maladie',
  internship: 'Attestation de stage',
  maternityLeave: 'Attestation de congé maternité',
  retirement: 'Attestation retraite',
  invalidity: 'Attestation invalidité',
  employerCertificate: 'Attestation employeur',
  salarySheet: 'Bulletin de salaire',
}

const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))
const getFormattedMonthAndYear = (date) =>
  format(date, 'MMMM YYYY', { locale: fr })

const getMissingDocumentLabelsFromDeclaration = (declaration) =>
  declaration.infos
    .filter(({ isTransmitted, file }) => !isTransmitted && !file)
    .map(
      ({ type }) =>
        `${documentLabels[type]} / ${getFormattedMonthAndYear(
          declaration.declarationMonth.month,
        )}`,
    )
    .concat(
      declaration.employers.reduce((declarationPrev, employer) => {
        if (
          employer.hasEndedThisMonth &&
          !employer.documents.some(
            (doc) => doc.type === EmployerDocument.types.employerCertificate,
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
      }, []),
    )

const sendAllDocumentsReminders = () => {
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
    getTemplate(ALL_DOCS_REMINDER_TEMPLATE_ID),
  ])
    .then(async ([allUsers, { html, text }]) => {
      const userChunks = chunk(allUsers, 50)

      for (const users of userChunks) {
        const messages = users.map((user) => {
          const documents = orderBy(
            user.declarations,
            'monthId',
            'desc',
          ).reduce(
            (prev, declaration) =>
              prev.concat(getMissingDocumentLabelsFromDeclaration(declaration)),
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
      setTimeout(sendAllDocumentsReminders, 300000)
    })
}

/*
 * This script has one big requirement: That it will be run during the month after
 * the concerned declaration month. (eg. Februrary the 2nd, for example, for January declarations)
 * AND while the declaration period is still on (eg. January 28th and February 15th)
 * If this is not respected, the date labels will be wrong.
 */
const sendCurrentDeclarationDocsReminders = () => {
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
        getTemplate(DOCS_REMINDER_TEMPLATE_ID),
      ])
        .then(async ([allDeclarations, { html, text }]) => {
          const declarationChunks = chunk(allDeclarations, 50)

          for (const declarations of declarationChunks) {
            const messages = declarations.map((declaration) => {
              const documents = getMissingDocumentLabelsFromDeclaration(
                declaration,
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
          setTimeout(sendCurrentDeclarationDocsReminders, 300000)
        })
    })
}

module.exports = {
  sendAllDocumentsReminders,
  sendCurrentDeclarationDocsReminders,
}
