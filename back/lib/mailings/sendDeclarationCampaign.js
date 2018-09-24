const { format } = require('date-fns')
const { get } = require('lodash')
const {
  createCampaignDraft,
  getCampaignTemplate,
  scheduleCampaign,
  setCampaignTemplate,
} = require('./mailjet')
const fr = require('date-fns/locale/fr')

const VALIDATED_USERS_SEGMENT_ID = 337
const DECLARATION_CAMPAIGN_TEMPLATE = 494021

/*
 * This script has one big requirement: That it will be run on the 28 (or 29, 30 or 31) of
 * the concerned declaration month. (eg. 28/01 for January declarations)
 * If this is not respected, the date labels will be wrong.
 */
const sendDeclarationCampaign = () =>
  createCampaignDraft({
    Subject: 'L’actualisation Zen commence aujourd’hui',
    Title: `Lancement actualisation ${format(new Date(), 'MM/YYYY')}`.concat(
      process.env.NODE_ENV !== 'production' ? ' (test)' : '',
    ),
    SegmentationID: VALIDATED_USERS_SEGMENT_ID,
  }).then((res) => {
    const campaignId = get(res, 'body.Data.0.ID')
    if (!campaignId) throw new Error('No Campaign ID')

    return getCampaignTemplate(DECLARATION_CAMPAIGN_TEMPLATE)
      .then((result) => {
        const { 'Html-part': html, 'Text-part': text } = get(
          result,
          'body.Data.0',
          {},
        )
        if (!html || !text)
          throw new Error(
            `No HTML or text part for template ${DECLARATION_CAMPAIGN_TEMPLATE}`,
          )
        const regexp = new RegExp('{{var:date:""}}', 'ig')
        const formattedMonth = format(new Date(), 'MMMM', { locale: fr })

        // writing « d'août » or « de septembre »
        // months for « d' » : avril, août, octobre
        const formattedDate =
          formattedMonth.startsWith('a') || formattedMonth.startsWith('o')
            ? `d'${formattedMonth}`
            : `de ${formattedMonth}`
        const interpolatedHtml = html.replace(regexp, formattedDate)
        const interpolatedText = text.replace(regexp, formattedDate)

        return setCampaignTemplate(campaignId, {
          'Html-part': interpolatedHtml,
          'Text-part': interpolatedText,
        }).then(() => scheduleCampaign(campaignId))
      })
      .catch((err) => console.error(err))
  })

module.exports = sendDeclarationCampaign
