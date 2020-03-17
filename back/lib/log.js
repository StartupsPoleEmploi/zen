const winston = require('winston')
const SlackHook = require("winston-slack-webhook-transport");

const {
  WINSTON_ENABLE_SLACK,
  WINSTON_ENABLE_LOG,
  WINSTON_ENABLE_FILE,
  SLACK_WEBHOOK_SU_ZEN_TECH,
  WINSTON_FILE_FOLDER,
} = process.env;

if (WINSTON_ENABLE_LOG === 'true') {
  winston.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(), 
      winston.format.printf(
        ({level, message, ...meta}) => `${level}: ${JSON.stringify(message, null, 4)} ${JSON.stringify(meta)}\n`,
      ),
    )
  }))
}

if (WINSTON_ENABLE_FILE === 'true') {
  winston.add(new winston.transports.File({
    level: 'error',
    filename: `${WINSTON_FILE_FOLDER}/error.log`,
  }))
  winston.add(new winston.transports.File({
    level: 'debug',
    filename: `${WINSTON_FILE_FOLDER}/all.log`,
  }))
}

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
