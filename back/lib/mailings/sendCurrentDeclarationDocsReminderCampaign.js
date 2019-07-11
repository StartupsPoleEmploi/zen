const Declaration = require('../../models/Declaration')
const DeclarationMonth = require('../../models/DeclarationMonth')

const DOCS_REMINDER_CAMPAIGN_ID = 510671

/*
 * This script has one big requirement: That it will be run during the month after
 * the concerned declaration month. (eg. Februrary the 2nd, for example, for January declarations)
 * If this is not respected, the date labels will be wrong.
 */
const sendCurrentDeclarationDocsReminderCampaign = () => {
  DeclarationMonth.query()
    .orderBy('id', 'desc')
    .first()
    .then((activeMonth) => {
      // 1- Get users who start declaration but not finished
      Declaration.query()
        .eager('[declarationMonth, user, employers.[documents]]')
        .where({
          isFinished: false,
          hasFinishedDeclaringEmployers: true,
          monthId: activeMonth.id,
        })
        .then((declarations) => {
          // Get documents list
          declarations.forEach((declaration) => {
            const files = declaration.employers.reduce(
              (docs, employer) => docs.concat(employer.documents),
              [],
            )

            console.log('files => ', files)
          })
        })
    })
}

module.exports = sendCurrentDeclarationDocsReminderCampaign
