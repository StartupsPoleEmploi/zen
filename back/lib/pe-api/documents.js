const { uploadsDirectory } = require('config')
const { format } = require('date-fns')
const config = require('config')
const superagent = require('superagent')
const fs = require('fs')
const path = require('path')

const uploadUrl = `${
  config.apiHost
}/partenaire/peconnect-envoidocument/v1/depose`

const getConfirmationUrl = (conversionId) =>
  `${
    config.apiHost
  }/partenaire/peconnect-envoidocument/v1/${conversionId}/confirmer`

const accessibleContextsUrl = `${
  config.apiHost
}/partenaire/peconnect-envoidocument/v1/depose/contextes-accessibles`
const contextsUrl = `${
  config.apiHost
}/partenaire/peconnect-envoidocument/v1/depose/contextes`

const sendDocuments = ({ declaration, accessToken }) => {
  const documentsToTransmit = [
    {
      boolField: 'hasTrained',
      docField: 'trainingDocument',
      label: 'Formation',
    },
    {
      boolField: 'hasInternship',
      docField: 'internshipDocument',
      label: 'Stage',
    },
    {
      boolField: 'hasSickLeave',
      docField: 'sickLeaveDocument',
      label: 'Congé Maladie',
    },
    {
      boolField: 'hasMaternityLeave',
      docField: 'maternityLeaveDocument',
      label: 'Congé maternité',
    },
    {
      boolField: 'hasRetirement',
      docField: 'retirementDocument',
      label: 'Retraite',
    },
    {
      boolField: 'hasInvalidity',
      docField: 'invalidityDocument',
      label: 'Invalidité',
    },
  ]
    .reduce((prev, fields) => {
      if (!declaration[fields.boolField] || !declaration[fields.docField])
        return prev
      return prev.concat({
        filePath: `${uploadsDirectory}${declaration[fields.docField].file}`,
        label: fields.label,
        document: declaration[fields.docField],
      })
    }, [])
    .concat(
      declaration.employers.reduce(
        (prev, { employerName, document, hasEndedThisMonth }) => {
          if (!document || !document.file) return prev
          return prev.concat({
            filePath: `${uploadsDirectory}${document.file}`,
            label: `${hasEndedThisMonth ? 'AE' : 'BS'} - ${employerName}`,
            isFileCertificate: hasEndedThisMonth,
            document,
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
    documentsToTransmit.map(
      (document) =>
        new Promise((resolve, reject) =>
          fs.readFile(document.filePath, (err, file) => {
            if (err) return reject(err)

            document.file = file
            resolve()
          }),
        ),
    ),
  ).then(
    () =>
      superagent
        .post(
          `${
            config.apiHost
          }/partenaire/peconnect-envoidocument/v1/depose?synchrone=true`,
        )
        .attach(
          'fichier',
          fs.createReadStream(documentsToTransmit[0].filePath),
          `1${path.extname(documentsToTransmit[0].filePath)}`,
        )
        .field('lancerConversion', true) // Will become false in case of multiple files to send in one go
        .set('Authorization', `Bearer ${accessToken}`)
        .set('Accept-Encoding', 'gzip'),
    /* .catch((err, ...rest) => {
          console.log(err, rest)
          throw new Error('bleh')
        }) */
  )
}

module.exports = {
  sendDocuments,
}
