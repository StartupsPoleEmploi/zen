const { get } = require('lodash')
const {
  createCampaignDraft,
  getCampaignTemplate,
  scheduleCampaign,
  setCampaignTemplate,
  createSegment,
  formatDateForSegmentFilter,
} = require('./mailjet')

const ALL_DOCS_REMINDER_CAMPAIGN_ID = 877270

/*
 * This script has one big requirement: That it will be run during the month after
 * the concerned declaration month. (eg. Februrary the 2nd, for example, for January declarations)
 * If this is not respected, the date labels will be wrong.
 */
const sendAllMissingDocsReminderCampaign = () => {}

module.exports = sendAllMissingDocsReminderCampaign
