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
superagent
  .post(uploadUrl)
  .attach(
    'fichier',
    fs.createReadStream(document.filePath),
    `1${path.extname(document.filePath)}`,
  )
  .field('lancerConversion', true) // Will become false in case of multiple files to send in one go
  .set('Authorization', `Bearer ${accessToken}`)
  .set('Accept-Encoding', 'gzip')
  .set('Accept', 'application/json')
  .set('media', 'M') // "Mobile". "I" (Internet) crashed the documents transmission


  */

// Retries after a few seconds if it gets a 429 response.
const resilientRequest = ({
  accessToken,
  headers,
  url,
  previousTries = 0,
  requestType = 'get',
  data = {},
  fields,
  attachements,
}) => {
  const request = superagent[requestType](url, data)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Accept-Encoding', 'gzip')

  if (headers) {
    headers.forEach((header) => request.set(header.key, header.value))
  }

  if (fields) {
    fields.forEach((field) => request.field(field.key, field.value))
  }

  if (attachements) {
    attachements.forEach((attachment) =>
      request.attach(attachment.name, attachment.file, attachment.uploadname),
    )
  }

  return request.catch((err) => {
    if (err.status !== 429) throw err
    if (previousTries > MAX_RETRIES) {
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
  get: resilientRequest,
}
