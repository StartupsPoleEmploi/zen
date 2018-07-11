const bcrypt = require('bcrypt')
const express = require('express')
const auth = require('http-auth')
const { format } = require('date-fns')
const zip = require('express-easy-zip')
const path = require('path')
const { kebabCase } = require('lodash')
const { uploadsDirectory: uploadDestination } = require('config')

const ActivityLog = require('../models/ActivityLog')
const Administrator = require('../models/Administrators')
const Declaration = require('../models/Declaration')

const actionsLabels = {
  VALIDATE_DECLARATION: `Étape 1 (déclaration initiale) terminée`,
  VALIDATE_EMPLOYERS: `Étape 2 (employeurs, salaires et heures travaillée) terminée`,
  VALIDATE_FILES: `Étape 3 (envoi des fichiers) terminée`,
}

const statuses = {
  hasTrained: {
    label: 'a été en formation',
    dateFields: ['trainingStartDate', 'trainingEndDate'],
  },
  hasInternship: {
    label: 'a été en stage',
    dateFields: ['internshipStartDate', 'internshipEndDate'],
  },
  hasSickLeave: {
    label: 'a été en congé maladie',
    dateFields: ['sickLeaveStartDate', 'sickLeaveEndDate'],
  },
  hasMaternityLeave: {
    label: 'a été en congé maternité',
    dateFields: ['maternityLeaveStartDate'],
  },
  hasRetirement: {
    label: 'est en retraite',
    dateFields: ['retirementStartDate'],
  },
  hasInvalidity: { label: 'est invalide', dateFields: ['invalidityStartDate'] },
}

const calculateTotal = (employers, field) =>
  employers.reduce((prev, employer) => parseInt(employer[field], 10) + prev, 0)

const basic = auth.basic(
  {
    realm: 'Admin interface',
  },
  (username, password, callback) => {
    Administrator.query()
      .findOne({ name: username })
      .then((administrator) => {
        if (!administrator) return callback(false)
        bcrypt
          .compare(password, administrator.password)
          .then((res) => callback(res === true))
      })
      .catch((err) => callback(err))
  },
)

const router = express.Router()
router.use(zip())

// No login form for now, users must be inserted in db manually.
router.get('/', auth.connect(basic), (req, res) => {
  req.session.isAdmin = true
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
                    ? `<a href="/api/admin/${
                        log.metadata.declarationId
                      }">Voir la déclaration</a>`
                    : ''
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

router.use((req, res, next) => {
  // Set when visiting the first route (and validating the auth)
  if (!req.session.isAdmin) return res.status(401).json('Access denied')
  next()
})

router.get('/:declarationId', (req, res) => {
  Declaration.query()
    .eager('[employers, user, declarationMonth]')
    .findById(req.params.declarationId)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')

      return res.send(`
        <html>
          <head>
            <title>Zen Admin</title>
            <style>
              table {
                margin: auto;
              }
              tr:nth-child(2n) {
                background: lightgray;
              }
            </style>
          </head>
          <body>
          <h3>
            ${declaration.user.firstName} ${declaration.user.lastName}
          </h3>
          <h4>
            Declaration
            ${format(declaration.declarationMonth.month, 'MM/YYYY')}
          </h4>
          <p>
            Déclaration des employeurs ${
              declaration.hasFinishedDeclaringEmployers
                ? 'terminée'
                : 'non terminée'
            }
            </p>
            <p>Envoi des fichiers  ${
              declaration.isFinished ? 'validé' : 'non validé'
            }</p>
            <p>
              Infos complémentaires : ${Object.keys(statuses)
                .filter((key) => declaration[key])
                .map(
                  (key) =>
                    `${statuses[key].label} (${statuses[key].dateFields
                      .map((field) => format(declaration[field], 'DD/MM'))
                      .join(' - ')})`,
                )
                .join(', ')}
            </p>
            <p>
            Souhaite rester inscrit à Pôle Emploi: ${
              declaration.isLookingForJob ? 'Oui' : 'Non'
            }</p>
            <p>
              Employeurs:<br />
                ${declaration.employers
                  .map(
                    (employer) =>
                      `${employer.employerName} ${employer.workHours}h ${
                        employer.salary
                      }€ - Contrat ${
                        employer.hasEndedThisMonth ? 'terminé' : ' non terminé'
                      }`,
                  )
                  .join('<br />')}
            </p>
            <p>
              Total: ${calculateTotal(
                declaration.employers,
                'workHours',
              )}h, ${calculateTotal(declaration.employers, 'salary')}€
            </p>
            <p>
              <a href="/api/admin/${declaration.id}/files">
                Télécharger les fichiers
                (${declaration.isFinished ? 'validées' : 'non validés'})
              </a>
            </p>
          </body>
        </html>
      `)
    })
})

router.get('/:declarationId/files', (req, res) => {
  Declaration.query()
    .eager('[employers, user, declarationMonth]')
    .findById(req.params.declarationId)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')

      const formattedMonth = format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )

      const files = [
        'trainingDocument',
        'internshipDocument',
        'sickLeaveDocument',
        'maternityLeaveDocument',
        'retirementDocument',
        'invalidityDocument',
      ]
        .map((label) => ({
          label,
          value: declaration[label],
        }))
        .concat(
          declaration.employers.map((employer) => ({
            label: `employer-${employer.employerName}`,
            value: employer.file,
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
