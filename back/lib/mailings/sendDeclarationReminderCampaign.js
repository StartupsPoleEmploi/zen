const { format, setDate, subMonths } = require('date-fns')
const fr = require('date-fns/locale/fr')
const { get } = require('lodash')

const winston = require('../log')
const {
  createCampaignDraft,
  getTemplate,
  scheduleCampaign,
  setTemplate,
  createSegment,
  formatDateForSegmentFilter,
} = require('./mailjet')

const DECLARATION_REMINDER_CAMPAIGN_ID = 502257

/*
 * This script has one big requirement: That it will be run during the month after
 * the concerned declaration month. (eg. Februrary the 2nd, for example, for January declarations)
 * If this is not respected, the date labels will be wrong.
 */
const sendDeclarationReminderCampaign = () => {
  const lastMonth = subMonths(new Date(), 1)
  const formattedMonthInFrench = format(lastMonth, 'MMMM YYYY', { locale: fr })
  const dateFormatForSegments = formatDateForSegmentFilter(lastMonth)
  const formattedNow = format(new Date(), 'DD/MM/YYYY')

  return createSegment({
    Description: `Contacts qui ne se sont pas actualisés en ${formattedMonthInFrench}`,
    Expression: `(validation_necessaire=false) AND ((declaration_effectuee_mois!=${dateFormatForSegments}) OR (not IsProvided(declaration_effectuee_mois)))`,
    Name: `${formattedMonthInFrench} - Actualisation non faite (envoi du ${formattedNow})`,
  })
    .then((segmentRes) => {
      const segmentId = get(segmentRes, 'body.Data.0.ID')
      if (!segmentId) throw new Error('No Campaign ID')
      return createCampaignDraft({
        Subject: 'Avez-vous pensé à vous actualiser ?',
        Title: `Rappel actu ${format(new Date(), 'DD/MM/YYYY')}`.concat(
          process.env.NODE_ENV !== 'production' ? ' (test)' : '',
        ),
        SegmentationID: segmentId,
      })
    })
    .then((campaignDraftRes) => {
      const campaignId = get(campaignDraftRes, 'body.Data.0.ID')
      if (!campaignId) throw new Error('No Campaign ID')

      return getTemplate(DECLARATION_REMINDER_CAMPAIGN_ID).then(
        ({ html, text }) => {
          const regexp = new RegExp('{{var:date:""}}', 'ig')
          const formattedDate = format(setDate(new Date(), 15), 'DD MMMM', {
            locale: fr,
          })

          const interpolatedHtml = html.replace(regexp, formattedDate)
          const interpolatedText = text.replace(regexp, formattedDate)

          return setTemplate(campaignId, {
            'Html-part': interpolatedHtml,
            'Text-part': interpolatedText,
          }).then(() => scheduleCampaign(campaignId))
        },
      )
    })
    .catch((err) => winston.error(err))
}

module.exports = sendDeclarationReminderCampaign
