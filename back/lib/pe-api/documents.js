const { uploadsDirectory } = require('config')
const { format } = require('date-fns')
const config = require('config')
const superagent = require('superagent')
const fs = require('fs')
const path = require('path')
require('superagent-retry-delay')(superagent)

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

const uploadUrl = `${
  config.apiHost
}/partenaire/peconnect-envoidocument/v1/depose?synchrone=true`

const getConfirmationUrl = (conversionId) =>
  `${
    config.apiHost
  }/partenaire/peconnect-envoidocument/v1/depose/${conversionId}/confirmer`

const sendDocuments = ({ declaration, accessToken }) => {
  const documentsToTransmit = [
    {
      boolField: 'hasInternship',
      docField: 'internshipDocument',
      label: 'Stage',
      confirmationData: CODES.INTERNSHIP,
    },
    {
      boolField: 'hasSickLeave',
      docField: 'sickLeaveDocument',
      label: 'Congé Maladie',
      confirmationData: CODES.SICKNESS,
    },
    {
      boolField: 'hasMaternityLeave',
      docField: 'maternityLeaveDocument',
      label: 'Congé maternité',
      confirmationData: CODES.SICKNESS,
    },
    {
      boolField: 'hasRetirement',
      docField: 'retirementDocument',
      label: 'Retraite',
      confirmationData: CODES.RETIREMENT,
    },
    {
      boolField: 'hasInvalidity',
      docField: 'invalidityDocument',
      label: 'Invalidité',
      confirmationData: CODES.INVALIDITY,
    },
  ]
    .reduce((prev, fields) => {
      if (!declaration[fields.boolField] || !declaration[fields.docField])
        return prev
      return prev.concat({
        filePath: `${uploadsDirectory}${declaration[fields.docField].file}`,
        label: fields.label,
        document: declaration[fields.docField],
        confirmationData: fields.confirmationData,
      })
    }, [])
    .concat(
      declaration.employers.reduce(
        (prev, { employerName, document, hasEndedThisMonth }) => {
          if (!document || !document.file) return prev
          return prev.concat({
            filePath: `${uploadsDirectory}${document.file}`,
            label: `${hasEndedThisMonth ? 'AE' : 'BS'} - ${employerName}`,
            document,
            confirmationData: hasEndedThisMonth
              ? CODES.EMPLOYER_CERTIFICATE
              : CODES.SALARY_SHEET,
          })
        },
        [],
      ),
    )
    .map(({ label, ...rest }) => ({
      label: `${label} - ${format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )}`,
      ...rest,
    }))
    .filter(({ document }) => !document.isTransmitted)

  return Promise.all(
    documentsToTransmit.map((document) =>
      superagent
        .post(uploadUrl)
        .retry(3, 2000)
        .attach(
          'fichier',
          fs.createReadStream(document.filePath),
          `1${path.extname(document.filePath)}`,
        )
        .field('lancerConversion', true) // Will become false in case of multiple files to send in one go
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Accept-Encoding', 'gzip')
        .set('Accept', 'application/json')
        .then(({ body: { conversionId } }) =>
          superagent
            .post(getConfirmationUrl(conversionId), {
              ...document.confirmationData,
              nomDocument: document.label,
            })
            .retry(3, 2000)
            .set('Authorization', `Bearer ${accessToken}`)
            .set('Accept-Encoding', 'gzip')
            .set('Accept', 'application/json'),
        ),
    ),
  )
}

module.exports = {
  sendDocuments,
}
