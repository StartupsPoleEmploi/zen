/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */

/*
 * Code to send documents via the API
 * Needs to be resilient to:
 * * HTTP 429 errors (too many requests), which require us to try again later
 * * undefined conversionId, which come back with an HTTP 200 but indicate an error
 *
 * Sending multiple documents is done sequentially instead of in parallel, as
 * we need to handle the limit of requests / seconds given to us
 * (at the time of writing, it is assumed it'll be about 1 request / second)
 */

const { uploadsDirectory } = require('config')
const { format } = require('date-fns')
const config = require('config')
const superagent = require('superagent')
const fs = require('fs')
const path = require('path')
const { deburr, toNumber } = require('lodash')

const winston = require('../log')

const DEFAULT_WAIT_TIME = 1000
const MAX_RETRIES = 3

const CONTEXT_CODE = '1'

const CODES = {
  SALARY_SHEET: {
    codeContexte: CONTEXT_CODE,
    codeSituation: '1',
    codeTypeDocument: 'BDS',
  },
  EMPLOYER_CERTIFICATE: {
    codeContexte: CONTEXT_CODE,
    codeSituation: '1',
    codeTypeDocument: 'AEMP',
  },
  SICKNESS: {
    codeContexte: CONTEXT_CODE,
    codeSituation: '4',
    codeTypeDocument: 'AAT',
  },
  RETIREMENT: {
    codeContexte: CONTEXT_CODE,
    codeSituation: '5',
    codeTypeDocument: 'NRAV',
  },
  INVALIDITY: {
    codeContexte: CONTEXT_CODE,
    codeSituation: '6',
    codeTypeDocument: 'NINV',
  },
  INTERNSHIP: {
    codeContexte: CONTEXT_CODE,
    codeSituation: '3',
    codeTypeDocument: 'ASF',
  },
}

const documentsToTransmitTypes = [
  {
    boolField: 'hasInternship',
    type: 'internship',
    label: 'Stage',
    confirmationData: CODES.INTERNSHIP,
  },
  {
    boolField: 'hasSickLeave',
    type: 'sickLeave',
    label: 'Congé Maladie',
    confirmationData: CODES.SICKNESS,
  },
  {
    boolField: 'hasMaternityLeave',
    type: 'maternityLeave',
    label: 'Congé maternité',
    confirmationData: CODES.SICKNESS,
  },
  {
    boolField: 'hasRetirement',
    type: 'retirement',
    label: 'Retraite',
    confirmationData: CODES.RETIREMENT,
  },
  {
    boolField: 'hasInvalidity',
    type: 'invalidity',
    label: 'Invalidité',
    confirmationData: CODES.INVALIDITY,
  },
]

const uploadUrl = `${
  config.apiHost
}/partenaire/peconnect-envoidocument/v1/depose?synchrone=true`

const getConfirmationUrl = (conversionId) =>
  `${
    config.apiHost
  }/partenaire/peconnect-envoidocument/v1/depose/${conversionId}/confirmer`

const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms))
const checkHeadersAndWait = (headers) => {
  const waitTime = toNumber(headers['retry-after']) * 1000
  return wait(Number.isNaN(waitTime) ? DEFAULT_WAIT_TIME : waitTime)
}

const doUpload = ({ document, accessToken, previousTries = 0 }) =>
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
    .then((res) => {
      if (!res.body.conversionId) {
        return checkHeadersAndWait(res.headers).then(() =>
          doUpload({
            document,
            accessToken,
            previousTries: previousTries + 1,
          }),
        )
      }
      return res
    })
    .catch((err) => {
      if (previousTries > MAX_RETRIES) {
        winston.error('Error while uploading document', document.id, err)
        throw err
      }
      if (err.status === 429) {
        return checkHeadersAndWait(err.response.headers).then(() =>
          doUpload({
            document,
            accessToken,
            previousTries: previousTries + 1,
          }),
        )
      }
      winston.error('Error while uploading document', document.id, err)
      throw err
    })

const doConfirm = ({
  conversionId,
  document,
  accessToken,
  previousTries = 0,
}) =>
  superagent
    .post(getConfirmationUrl(conversionId), {
      ...document.confirmationData,
      nomDocument: document.label,
    })
    .set('Authorization', `Bearer ${accessToken}`)
    .set('Accept-Encoding', 'gzip')
    .set('Accept', 'application/json')
    .set('media', 'M') // "Mobile". "I" (Internet) crashed the documents transmission
    .then(() => document.dbDocument.$query().patch({ isTransmitted: true }))
    .catch((err) => {
      if (previousTries > MAX_RETRIES) {
        winston.error('Error while confirming document', document.id, err)
        throw err
      }
      if (err.status === 429) {
        // HTTP 429 Too many requests
        return checkHeadersAndWait(err.response.headers).then(() =>
          doConfirm({
            conversionId,
            document,
            accessToken,
            previousTries: previousTries + 1,
          }),
        )
      }
      winston.error('Error while confirming document', document.id, err)
      throw err
    })

const sendDocuments = async ({ declaration, accessToken }) => {
  const documentsToTransmit = declaration.documents
    .map((dbDocument) => {
      const typeInfos = documentsToTransmitTypes.find(
        ({ type }) => type === dbDocument.type,
      )

      return {
        filePath: `${uploadsDirectory}${dbDocument.file}`,
        label: typeInfos.label,
        dbDocument,
        confirmationData: typeInfos.confirmationData,
      }
    })
    .concat(
      declaration.employers.reduce(
        (prev, { employerName, documents, hasEndedThisMonth }) => {
          if (!documents[0] || !documents[0].file) return prev

          return prev.concat(
            documents.map((document) => ({
              filePath: `${uploadsDirectory}${document.file}`,
              label: `${hasEndedThisMonth ? 'AE' : 'BS'} - ${employerName}`,
              dbDocument: document,
              confirmationData: hasEndedThisMonth
                ? CODES.EMPLOYER_CERTIFICATE
                : CODES.SALARY_SHEET,
            })),
          )
        },
        [],
      ),
    )
    .map(({ label, ...rest }) => ({
      label: deburr(
        `${label} - ${format(declaration.declarationMonth.month, 'MM-YYYY')}`,
      ),
      ...rest,
    }))
    .filter(({ dbDocument }) => !dbDocument.isTransmitted)

  for (const key in documentsToTransmit) {
    if (key !== 0) await wait(DEFAULT_WAIT_TIME)
    const {
      body: { conversionId },
    } = await doUpload({ document: documentsToTransmit[key], accessToken })
    await wait(DEFAULT_WAIT_TIME)
    await doConfirm({
      document: documentsToTransmit[key],
      accessToken,
      conversionId,
    })
  }
}

module.exports = {
  sendDocuments,
}
