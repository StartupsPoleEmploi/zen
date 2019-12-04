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
  which are sent any time a PE API has its quota (local or global) met
*/
const resilientRequest = (params = {}) => {
  const {
    accessToken,
    headers,
    url,
    previousTries = 0,
    method = 'get',
    data,
    fields,
    attachments,
  } = params
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

  return request.catch(async (err) => {
    if (err.status !== 429) throw err
    if (previousTries >= MAX_RETRIES) {
      throw err
    }
    // HTTP 429 Too many requests
    await checkHeadersAndWait(err.response.headers)
    return resilientRequest({ ...params, previousTries: previousTries + 1 })
  })
}

module.exports = {
  request: resilientRequest,
  checkHeadersAndWait,
}
