const express = require('express')
const { format } = require('date-fns')
const zip = require('express-easy-zip')
const path = require('path')
const { get, kebabCase } = require('lodash')
const { uploadsDirectory: uploadDestination } = require('config')

const ActivityLog = require('../models/ActivityLog')
const Declaration = require('../models/Declaration')
const DeclarationMonth = require('../models/DeclarationMonth')

const actionsLabels = {
  VALIDATE_DECLARATION: `Étape 1 (déclaration initiale) terminée`,
  VALIDATE_EMPLOYERS: `Étape 2 (employeurs, salaires et heures travaillée) terminée`,
  VALIDATE_FILES: `Étape 3 (envoi des fichiers) terminée`,
  TRANSMIT_FILE: `Fichier transmis sur pole-emploi.fr`,
  TRANSMIT_DECLARATION: `Déclaration transmise sur pole-emploi.fr`,
}

const router = express.Router()
router.use(zip())

router.get('/declarationsMonths', (req, res, next) => {
  DeclarationMonth.query()
    .where('startDate', '<', new Date())
    .orderBy('startDate', 'desc')
    .then((declarationMonths) => res.json(declarationMonths))
    .catch(next)
})

router.get('/declarations', (req, res, next) => {
  if (!req.query.monthId) {
    return res.status(501).json('Must add monthId as query param')
  }

  Declaration.query()
    .eager('[user, employers]')
    .where({ monthId: req.query.monthId })
    .then((declarations) => res.json(declarations))
    .catch(next)
})

router.post('/declarations/metadata', (req, res, next) => {
  if (!req.body.id || (!req.body.notes && !req.body.isVerified)) {
    return res.status(400).json('Incomplete request')
  }
  Declaration.query()
    .findById(req.body.id)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('Not found')

      if ('isVerified' in req.body) {
        declaration.metadata.isVerified = req.body.isVerified
      }
      if ('notes' in req.body) {
        declaration.metadata.notes = req.body.notes
      }

      return declaration
        .$query()
        .patch()
        .then(() => res.json('ok'))
    })
    .catch(next)
})

// No login form for now, users must be inserted in db manually.
router.get('/activityLog', (req, res) => {
  Promise.all([
    ActivityLog.query()
      .eager('user')
      .orderBy('createdAt', 'desc'),
    Declaration.query()
      .orderBy('createdAt', 'desc')
      .first()
      .then((lastDeclaration) =>
        Declaration.query()
          .eager('declarationMonth')
          .where({
            monthId: lastDeclaration.monthId,
          }),
      ),
  ]).then(([logs, declarations]) => {
    const tableRows = logs
      .map(
        (log) => `
            <tr>
              <td style="padding: 10px;">
                ${log.user.firstName} ${log.user.lastName}
              </td>
              <td style="padding: 10px;">${actionsLabels[log.action]}</td>
              <td style="padding: 10px;">
                ${
                  log.metadata.declarationId
                    ? `Déclaration ${log.metadata.declarationId}`
                    : log.metadata.file || ''
                }
              </td>
              <td style="padding: 10px;">
                ${format(log.createdAt, 'DD/MM HH:mm')}
              </td>
            </tr>
          `,
      )
      .join('')

    return res.send(`
        <html>
          <head>
            <title>Zen Admin</title>
            <style>
              p { text-align: center; }
              table {
                margin: auto;
              }
              tr:nth-child(2n) {
                background: lightgray;
              }
            </style>
          </head>
          <body>
            <p>
              <b>${format(
                declarations[0].declarationMonth.month,
                'MMMM YYYY',
              )}</b><br />
              Page 1 validée (questions) : ${declarations.length}<br />
              Page 2 validée (employeurs): ${
                declarations.filter(
                  ({ hasFinishedDeclaringEmployers }) =>
                    hasFinishedDeclaringEmployers,
                ).length
              }<br />
              Page 3 validée : ${
                declarations.filter(({ isFinished }) => isFinished).length
              }<br />
            </p>
            <table>
              <thead>
                <th>Nom</th>
                <th>Action</th>
                <th>Données complémentaires</th>
                <th>Date</th>
              </thead>
              <tbody>
              ${tableRows}
              </tbody>
            </table>
          </body>
        </html>
      `)
  })
})

router.get('/declarations/:declarationId/files', (req, res) => {
  const documentKeys = [
    'internshipDocument',
    'sickLeaveDocument',
    'maternityLeaveDocument',
    'retirementDocument',
    'invalidityDocument',
  ]
  Declaration.query()
    .eager(
      `[${documentKeys.join(
        ', ',
      )}, employers.document, user, declarationMonth]`,
    )
    .findById(req.params.declarationId)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')

      const formattedMonth = format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )

      const files = documentKeys
        .map((label) => ({
          label,
          value: get(declaration, `${label}.file`),
        }))
        .concat(
          declaration.employers.map((employer) => ({
            label: `employer-${employer.employerName}`,
            value: get(employer, 'document.file'),
          })),
        )
        .filter(({ value }) => value) // remove null values
        .map((file, key) => ({
          path: `${uploadDestination}${file.value}`,
          name: kebabCase(
            `${declaration.user.firstName}-${declaration.user.lastName}-${
              file.label
            }-${formattedMonth}-${String.fromCharCode(key + 97)}`, // identifier to avoid duplicates
          ).concat(
            // PE.fr uploads do not handle "jpeg" files (-_-), so renaming on the fly.
            path.extname(file.value) === '.jpeg'
              ? '.jpg'
              : path.extname(file.value),
          ),
        }))

      if (files.length === 0) return res.send('Pas de fichiers disponibles')

      res.zip({
        files,
        filename: `${declaration.user.firstName}-${
          declaration.user.lastName
        }-${formattedMonth}-fichiers-${
          declaration.isFinished ? 'validés' : 'non-validés'
        }.zip`,
      })
    })
})

module.exports = router
