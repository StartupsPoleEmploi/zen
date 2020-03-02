const winston = require('winston')
const SlackHook = require("winston-slack-webhook-transport");

const {
  WINSTON_ENABLE_SLACK,
  SLACK_WEBHOOK_SU_ZEN_TECH,
} = process.env;

if (WINSTON_ENABLE_SLACK === 'true') {
  winston.add(new SlackHook({
    webhookUrl: SLACK_WEBHOOK_SU_ZEN_TECH,
    level: 'warn',
    formatter: ({ level, message }) => ({
      text: `*${level}*: ${message}`,
    }),
  }))
}

module.exports = winston
