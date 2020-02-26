const winston = require('winston')
const SlackHook = require("winston-slack-webhook-transport");
const Elasticsearch = require('winston-elasticsearch');

const {
  WINSTON_ENABLE_SLACK,
  SLACK_WEBHOOK_SU_ZEN_TECH,
  WINSTON_ENABLE_ELASTICSEARCH,
  ELASTICSEARCH_LOG_INDEX,
  ELASTICSEARCH_LOG_INDEX_PREFIX,
  ELASTICSEARCH_LOG_URL,
  ELASTICSEARCH_LOG_USER,
  ELASTICSEARCH_LOG_PWD,
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

if (WINSTON_ENABLE_ELASTICSEARCH) {
  winston.add(new Elasticsearch({
    level: 'debug',
    index: ELASTICSEARCH_LOG_INDEX,
    indexPrefix: ELASTICSEARCH_LOG_INDEX_PREFIX,
    clientOpts: {
      node: ELASTICSEARCH_LOG_URL,
      auth: {
        username: ELASTICSEARCH_LOG_USER,
        password: ELASTICSEARCH_LOG_PWD
      }
    }
  }))
}

module.exports = winston
