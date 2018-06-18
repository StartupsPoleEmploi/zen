const bcrypt = require('bcrypt')
const express = require('express')
const auth = require('http-auth')
const { format } = require('date-fns')

const ActivityLog = require('../models/ActivityLog')
const Administrator = require('../models/Administrators')

const actionsLabels = {
  VALIDATE_DECLARATION: `Étape 1 (déclaration initiale) terminée`,
  VALIDATE_EMPLOYERS: `Étape 2 (employeurs, salaires et heures travaillée) terminée`,
  VALIDATE_FILES: `Étape 3 (envoi des fichiers) terminée`,
}

const basic = auth.basic(
  {
    realm: 'Admin interface',
  },
  (username, password, callback) => {
    Administrator.query()
      .findOne({ name: username })
      .then((administrator) => {
        if (!administrator) return callback(false)
        bcrypt.compare(password, administrator.password).then((res) => {
          callback(res === true)
        })
      })
      .catch((err) => callback(err))
  },
)

const router = express.Router()

// No login form for now, users must be inserted in db manually.
router.get('/', auth.connect(basic), (req, res) => {
  ActivityLog.query()
    .eager('user')
    .orderBy('createdAt', 'desc')
    .then((logs) => {
      const tableRows = logs
        .map(
          (log) => `
            <tr>
              <td style="padding: 10px;">
                ${log.user.firstName} ${log.user.lastName}
              </td>
              <td style="padding: 10px;">${actionsLabels[log.action]}</td>
              <td style="padding: 10px;">
                ${format(log.createdAt, 'DD/MM HH:ss')}
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
              table {
                margin: auto;
              }
              tr:nth-child(2n) {
                background: lightgray;
              }
            </style>
          </head>
          <body>
            <table>
              <thead>
                <th>Nom</th>
                <th>Action</th>
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

module.exports = router
