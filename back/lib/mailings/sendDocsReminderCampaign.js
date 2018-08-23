const { format, subMonths } = require('date-fns')
const { get } = require('lodash')
const {
  createCampaignDraft,
  getCampaignTemplate,
  sendCampaign,
  setCampaignTemplate,
  createSegment,
} = require('./mailjet')
const fr = require('date-fns/locale/fr')

const DOCS_REMINDER_CAMPAIGN_ID = 510671

/*
 * This script has one big requirement: That it will be run during the month after
 * the concerned declaration month. (eg. Februrary the 2nd, for example, for January declarations)
 * If this is not respected, the date labels will be wrong.
 */
const sendDocsReminderCampaign = () => {
  const lastMonth = subMonths(new Date(), 1)
  const formattedMonthInFrench = format(lastMonth, 'MMMM YYYY', { locale: fr })
  const dateFormatForSegments = format(lastMonth, 'YYYYMM')

  return createSegment({
    Description: `Contacts actualisés mais qui n'ont pas envoyé tous leurs documents en ${formattedMonthInFrench}`,
    Expression: `(validation_necessaire=false) and (declaration_effectuee_mois=${dateFormatForSegments}) and (document_envoye_mois!=${dateFormatForSegments})`,
    Name: `${formattedMonthInFrench} - Documents non envoyés, actu faite`,
  })
    .then((segmentRes) => {
      const segmentId = get(segmentRes, 'body.Data.0.ID')
      if (!segmentId) throw new Error('No Campaign ID')
      return createCampaignDraft({
        Subject: 'N’oubliez pas d’envoyer vos documents',
        Title: `Rappel documents ${format(new Date(), 'DD/MM/YYYY')}`.concat(
          process.env.NODE_ENV !== 'production' ? ' (test)' : '',
        ),
        SegmentationID: segmentId,
      })
    })
    .then((campaignDraftRes) => {
      const campaignId = get(campaignDraftRes, 'body.Data.0.ID')
      if (!campaignId) throw new Error('No Campaign ID')

      return getCampaignTemplate(DOCS_REMINDER_CAMPAIGN_ID)
        .then((result) => {
          const { 'Html-part': html, 'Text-part': text } = get(
            result,
            'body.Data.0',
            {},
          )
          if (!html || !text)
            throw new Error(
              `No HTML or text part for template ${DOCS_REMINDER_CAMPAIGN_ID}`,
            )

          return (
            setCampaignTemplate(campaignId, {
              'Html-part': html,
              'Text-part': text,
            })
              // TODO: This should send a notification to Slack
              .then(() => sendCampaign(campaignId))
          )
        })
        .catch((err) => console.error(err))
    })
}

module.exports = sendDocsReminderCampaign
