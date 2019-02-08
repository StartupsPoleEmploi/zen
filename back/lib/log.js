const winston = require('winston')
const slackWinston = require('slack-winston').Slack

winston.add(slackWinston, {
  // Send this file's logs to Slack
  webhook_url: process.env.SLACK_WEBHOOK_SU_ZEN_TECH,
  message: `*{{level}}*: {{message}}\n\n{{meta}}`,
  level: 'info',
})

module.exports = winston
