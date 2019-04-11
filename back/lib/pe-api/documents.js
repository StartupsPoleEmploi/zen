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
 *
 * Uploading files requires two API calls:
 * * The first one does the actual file upload
 * * The second one adds information (labels, context information needed by PE API
 *    to correctly identify the document) and confirms the upload.
 *
 * Without both calls, the document will not be handled by PE.
 */

const { uploadsDirectory } = require('config')
const { format } = require('date-fns')
const config = require('config')
const fs = require('fs')
const path = require('path')
const { deburr } = require('lodash')

const { request, checkHeadersAndWait } = require('../resilientRequest')
const EmployerDocument = require('../../models/EmployerDocument')

const winston = require('../log')

const DEFAULT_WAIT_TIME = process.env.NODE_ENV !== 'test' ? 1000 : 0

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

const doUpload = ({ document, accessToken, previousTries = 0 }) =>
  request({
    accessToken,
    headers: [{ key: 'media', value: 'M' }], // "Mobile". "I" (Internet) crashed the documents transmission
    url: uploadUrl,
    fields: [{ key: 'lancerConversion', value: true }], // Will become false in case of multiple files to send in one go
    attachments: [
      {
        name: 'fichier',
        file: fs.createReadStream(document.filePath),
        uploadname: `1${path.extname(document.filePath)}`,
      },
    ],
    method: 'post',
  }).then((res) => {
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

const doConfirm = ({ conversionId, document, accessToken }) =>
  request({
    accessToken,
    headers: [{ key: 'media', value: 'M' }], // "Mobile". "I" (Internet) crashed the documents transmission
    url: getConfirmationUrl(conversionId),
    method: 'post',
    data: {
      ...document.confirmationData,
      nomDocument: document.label,
    },
  }).then(() => document.dbDocument.$query().patch({ isTransmitted: true }))

const sendDocuments = async ({ declaration, accessToken }) => {
  const documentsToTransmit = declaration.infos
    .filter(({ file }) => file)
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
        (prev, { employerName, documents, type }) => {
          if (!documents[0] || !documents[0].file) return prev

          const label = `${
            type === EmployerDocument.types.employerCertificate ? 'AE' : 'BS'
          } - ${employerName}`
          const confirmationData =
            type === EmployerDocument.types.employerCertificate
              ? CODES.EMPLOYER_CERTIFICATE
              : CODES.SALARY_SHEET

          return prev.concat(
            documents.map((document) => ({
              filePath: `${uploadsDirectory}${document.file}`,
              label,
              dbDocument: document,
              confirmationData,
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
    } = await doUpload({
      document: documentsToTransmit[key],
      accessToken,
    }).catch((err) => {
      winston.error(
        'Error while uploading document',
        documentsToTransmit[key].id,
        err,
      )
      throw err
    })

    await wait(DEFAULT_WAIT_TIME)

    await doConfirm({
      document: documentsToTransmit[key],
      accessToken,
      conversionId,
    }).catch((err) => {
      winston.error(
        'Error while confirming document',
        documentsToTransmit[key].id,
        err,
      )
      throw err
    })
  }
}

module.exports = {
  sendDocuments,
}
