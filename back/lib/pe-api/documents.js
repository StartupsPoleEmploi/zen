/* eslint-disable prefer-destructuring */

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
const config = require('config')
const fs = require('fs')
const path = require('path')
const { deburr, pick } = require('lodash')
const { format } = require('date-fns')
const async = require('async')

const { request, checkHeadersAndWait } = require('../resilientRequest')
const EmployerDocument = require('../../models/EmployerDocument')
const { optimizePDF } = require('../../lib/pdf-utils')
const DeclarationInfo = require('../../models/DeclarationInfo')

const winston = require('../log')

const DEFAULT_WAIT_TIME = process.env.NODE_ENV !== 'test' ? 1000 : 0
const CONTEXT_CODE = '1'
const MAX_TRIES = 3

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

const uploadUrl = `${config.apiHost}/partenaire/peconnect-envoidocument/v1/depose?synchrone=true`

const getConfirmationUrl = (conversionId) =>
  `${config.apiHost}/partenaire/peconnect-envoidocument/v1/depose/${conversionId}/confirmer`

const formatDeclarationInfoDoc = (doc) => {
  const typeInfos = documentsToTransmitTypes.find(
    ({ type }) => type === doc.type,
  )
  return {
    filePath: `${uploadsDirectory}${doc.file}`,
    label: `${typeInfos.label} - ${format(
      doc.declaration.declarationMonth.month,
      'MM-YYYY',
    )}`,
    dbDocument: doc,
    confirmationData: typeInfos.confirmationData,
  }
}

const formatEmployerDoc = (doc) => ({
  filePath: `${uploadsDirectory}${doc.file}`,
  label: deburr(
    `${
      doc.type === EmployerDocument.types.employerCertificate ? 'AE' : 'BS'
    } - ${doc.employer.employerName} - ${format(
      doc.employer.declaration.declarationMonth.month,
      'MM-YYYY',
    )}`,
  ),
  dbDocument: doc,
  confirmationData:
    doc.type === EmployerDocument.types.employerCertificate
      ? CODES.EMPLOYER_CERTIFICATE
      : CODES.SALARY_SHEET,
})

const doUpload = ({ filePath, accessToken, previousTries = 0 }) =>
  request({
    accessToken,
    headers: [{ key: 'media', value: 'M' }], // "Mobile". "I" (Internet) crashed the documents transmission
    url: uploadUrl,
    fields: [{ key: 'lancerConversion', value: true }], // Will become false in case of multiple files to send in one go
    attachments: [
      {
        name: 'fichier',
        file: fs.createReadStream(filePath),
        uploadname: `1${path.extname(filePath)}`,
      },
    ],
    method: 'post',
  }).then((res) => {
    if (!res.body.conversionId) {
      return checkHeadersAndWait(res.headers).then(() =>
        doUpload({
          filePath,
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
  })

async function sendDocument({ accessToken, document }) {
  let documentType = null;
  let userId = null;
  let infosToSendDocument = null;
  if (Object.values(DeclarationInfo.types).includes(document.type)) {
    infosToSendDocument = formatDeclarationInfoDoc(document)
    documentType = `DeclarationInfo ${document.type}`
    userId = document.declaration.userId;
  } else if (Object.values(EmployerDocument.types).includes(document.type)) {
    infosToSendDocument = formatEmployerDoc(document)
    documentType = `EmployerDocument ${document.type}`
    userId = document.employer.userId;
  } else {
    throw new Error('Unknown document type')
  }

  if (config.get('bypassDocumentsDispatch')) {
    winston.info(`Simulating sending document ${infosToSendDocument.dbDocument.type} ${infosToSendDocument.dbDocument.id} to PE`)
    return infosToSendDocument.dbDocument.$query().patch({ isTransmitted: true })
  }

  if (path.extname(infosToSendDocument.filePath) === '.pdf') {
    // optimize PDF before sending them to PE
    await optimizePDF(infosToSendDocument.filePath).catch((err) =>
      // if the optimization fails, log it, but continue anyway
      winston.debug(`Error while optimizing document ${infosToSendDocument.dbDocument.id} (ERR ${err})`),
    )
  }

  let step = 0;
  try {
    const retryTime = { times: MAX_TRIES, interval: DEFAULT_WAIT_TIME };
    const { body: { conversionId } } = await async.retry(retryTime, 
      async () => doUpload({ filePath: infosToSendDocument.filePath, accessToken }),
    );
    step += 1;
    await async.retry(retryTime, 
      async () => doConfirm({ document: infosToSendDocument, accessToken, conversionId }),
    );
    await infosToSendDocument.dbDocument.$query().patch({ isTransmitted: true });
  } catch (err) {
    const errorFrom = step === 0 ? 'uploading' : 'confirming'
    const docId = infosToSendDocument.dbDocument.id;
    err.message = `Error while ${errorFrom} document ${docId} with type "${documentType}" of user "${userId}" (HTTP ${err.status}) => ${err.message}`;
    winston.error(err.message, { 
      url: err.response.request.url, 
      userId, 
      doc: { docId, ... pick(infosToSendDocument, ['filePath', 'label', 'confirmationData']) },
      err,
    })
    throw err
  }
}

module.exports = {
  sendDocument,
}
