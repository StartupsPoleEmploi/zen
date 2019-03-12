const superagent = require('superagent')
const { toNumber } = require('lodash')

const DEFAULT_WAIT_TIME = process.env.NODE_ENV !== 'test' ? 1000 : 0
const MAX_RETRIES = 3
const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))
const checkHeadersAndWait = (headers) => {
  const waitTime = toNumber(headers['retry-after']) * 1000
  return wait(Number.isNaN(waitTime) ? DEFAULT_WAIT_TIME : waitTime)
}

/*
  superagent supplement which automatically retries requests if it got an HTTP 429
*/
const resilientRequest = ({
  accessToken,
  headers,
  url,
  previousTries = 0,
  method = 'get',
  data,
  fields,
  attachments,
}) => {
  const request = superagent[method](url, data)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Accept-Encoding', 'gzip')

  if (headers) {
    headers.forEach((header) => request.set(header.key, header.value))
  }

  if (fields) {
    fields.forEach((field) => request.field(field.key, field.value))
  }

  if (attachments) {
    attachments.forEach((attachment) =>
      request.attach(attachment.name, attachment.file, attachment.uploadname),
    )
  }

  return request.catch((err) => {
    if (err.status !== 429) throw err
    if (previousTries >= MAX_RETRIES) {
      throw err
    }
    // HTTP 429 Too many requests
    return checkHeadersAndWait(err.response.headers).then(() =>
      resilientRequest({
        url,
        accessToken,
        previousTries: previousTries + 1,
      }),
    )
  })
}

module.exports = {
  request: resilientRequest,
  checkHeadersAndWait,
}
