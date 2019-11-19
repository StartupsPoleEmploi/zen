const superagent = require('superagent')

const Declaration = require('../models/Declaration')
const DeclarationMonth = require('../models/DeclarationMonth')

const getActiveMonth = () =>
  DeclarationMonth.query()
    .where('endDate', '>', new Date())
    .andWhere('startDate', '<=', 'now')
    .first()

const getDeclarationsForMonth = (monthId) =>
  Declaration.query()
    .eager('[user, employers, review, infos]')
    .where({ monthId })

const postDeclarationStatusToSlack = () =>
  getActiveMonth().then((activeMonth) => {
    if (!activeMonth) return

    return getDeclarationsForMonth(activeMonth.id).then((declarations) => {
      const message = `
Actualisations débutées : ${declarations.length}
Actualisations terminées: ${
        declarations.filter(
          ({ hasFinishedDeclaringEmployers }) => hasFinishedDeclaringEmployers,
        ).length
      }
Actualisations avec justificatifs validés : ${
        declarations.filter(({ isFinished }) => isFinished).length
      }`

      return superagent.post(process.env.SLACK_WEBHOOK_SU_ZEN, {
        text: message,
      })
    })
  })

module.exports = postDeclarationStatusToSlack
