const express = require('express')

const router = express.Router()
const { transaction } = require('objection')
const {
  get,
  isBoolean,
  isInteger,
  isNumber,
  isString,
  pick,
} = require('lodash')

const { upload, uploadDestination } = require('../lib/upload')
const { requireActiveMonth } = require('../lib/activeMonthMiddleware')
const { sendDeclaration } = require('../lib/pe-api/declaration')
const isUserTokenValid = require('../lib/isUserTokenValid')
const winston = require('../lib/log')

const Declaration = require('../models/Declaration')
const Employer = require('../models/Employer')
const EmployerDocument = require('../models/EmployerDocument')
const ActivityLog = require('../models/ActivityLog')

const { DECLARATION_STATUSES } = require('../constants')

const getSanitizedEmployer = ({ employer, declaration, user }) => {
  const workHours = parseFloat(employer.workHours)
  const salary = parseFloat(employer.salary)

  return {
    ...employer,
    userId: user.id,
    declarationId: declaration.id,
    // Save temp data as much as possible
    workHours: !Number.isNaN(workHours) ? workHours : null,
    salary: !Number.isNaN(salary) ? salary : null,
  }
}

router.post('/', requireActiveMonth, (req, res, next) => {
  const sentEmployers = req.body.employers || []
  if (!sentEmployers.length) return res.status(400).json('No data')

  return Declaration.query()
    .eager('[employers, infos]')
    .findOne({
      userId: req.session.user.id,
      monthId: req.activeMonth.id,
    })
    .then((declaration) => {
      if (!declaration) {
        return res.status(400).json('Please send declaration first')
      }

      const newEmployers = sentEmployers.filter((employer) => !employer.id)
      const updatedEmployers = sentEmployers.filter(({ id }) =>
        declaration.employers.some((employer) => employer.id === id),
      )

      declaration.employers = newEmployers
        .concat(updatedEmployers)
        .map((employer) =>
          getSanitizedEmployer({
            employer,
            user: req.session.user,
            declaration,
          }),
        )

      const shouldLog =
        req.body.isFinished && !declaration.hasFinishedDeclaringEmployers

      if (!req.body.isFinished) {
        // Temp saving for the user to come back later
        return declaration
          .$query()
          .upsertGraph()
          .then(() => res.json(declaration))
      }

      // Additional check: Employers declaration is finished and all should be filled
      if (
        declaration.employers.some(
          (employer) =>
            !isString(employer.employerName) ||
            employer.employerName.length === 0 ||
            !isInteger(employer.workHours) ||
            !isNumber(employer.salary) ||
            !isBoolean(employer.hasEndedThisMonth),
        )
      ) {
        return res.status(400).json('Invalid employers declaration')
      }

      if (!isUserTokenValid(req.user.tokenExpirationDate)) {
        return declaration
          .$query()
          .upsertGraph()
          .then(() => res.status(401).json('Expired token'))
      }

      declaration.hasFinishedDeclaringEmployers = true
      declaration.transmittedAt = new Date()

      // Sending declaration to pe.fr
      return sendDeclaration({
        declaration,
        accessToken: req.session.userSecret.accessToken,
        ignoreErrors: req.body.ignoreErrors,
      })
        .then(({ body }) => {
          if (body.statut !== DECLARATION_STATUSES.SAVED) {
            // the service will answer with HTTP 200 for a bunch of errors
            // So they need to be handled here
            winston.warn(
              `Declaration transmission error for user ${req.session.user.id}`,
              pick(body, [
                'statut',
                'statutActu',
                'message',
                'erreursIncoherence',
                'erreursValidation',
              ]),
            )

            declaration.hasFinishedDeclaringEmployers = false
            declaration.transmittedAt = null

            return declaration
              .$query()
              .upsertGraph()
              .then(() =>
                // This is a custom error, we want to show a different feedback to users
                res
                  .status(
                    body.statut === DECLARATION_STATUSES.TECH_ERROR ? 503 : 400,
                  )
                  .json({
                    consistencyErrors: body.erreursIncoherence || [],
                    validationErrors: Object.values(
                      body.erreursValidation || {},
                    ),
                  }),
              )
          }

          winston.info(`Sent declaration for user ${req.session.user.id} to PE`)

          return transaction(Declaration.knex(), (trx) =>
            Promise.all([
              declaration.$query(trx).upsertGraph(),
              shouldLog
                ? ActivityLog.query(trx).insert({
                  userId: req.session.user.id,
                  action: ActivityLog.actions.VALIDATE_EMPLOYERS,
                  metadata: JSON.stringify({
                    declarationId: declaration.id,
                  }),
                })
                : Promise.resolve(),
            ]),
          ).then(() => res.json(declaration))
        })
        .catch((err) => {
          // If we could not save the declaration on pe.fr
          // We still save the data the user sent us
          // but we put it as unfinished.
          declaration.hasFinishedDeclaringEmployers = false
          declaration.transmittedAt = null

          return declaration
            .$query()
            .upsertGraph()
            .then(() => {
              throw err
            })
        })
    })
    .catch(next)
})

router.get('/files', (req, res, next) => {
  if (!req.query.documentId) return res.status(400).json('Missing employerId')

  return EmployerDocument.query()
    .eager('employer.user')
    .findOne({
      id: req.query.documentId,
    })
    .then((document) => {
      if (get(document, 'employer.user.id') !== req.session.user.id)
        return res.status(404).json('No such file')
      res.sendFile(document.file, { root: uploadDestination })
    })
    .catch(next)
})

router.post('/files', upload.single('document'), (req, res, next) => {
  if (!req.file && !req.body.skip) return res.status(400).json('Missing file')
  if (!req.body.employerId) return res.status(400).json('Missing employerId')

  const fetchEmployer = () =>
    Employer.query()
      .eager('documents')
      .findOne({
        id: req.body.employerId,
        userId: req.session.user.id,
      })

  return fetchEmployer()
    .then((employer) => {
      if (!employer) return res.status(404).json('No such employer')

      const type = employer.hasEndedThisMonth
        ? 'employerCertificate'
        : 'salarySheet'

      const documentFileObj = req.body.skip
        ? {
          // Used in case the user sent his file by another means.
          file: null,
          isTransmitted: true,
          type,
        }
        : { file: req.file.filename, type }

      const documentIndex = employer.documents.findIndex(
        (document) => document.type === type,
      )

      let savePromise
      if (documentIndex !== -1) {
        savePromise = employer.documents[documentIndex].$query().patch({
          id: employer.documents[documentIndex].id,
          ...documentFileObj,
        })
      } else {
        savePromise = EmployerDocument.query().insert({
          employerId: employer.id,
          ...documentFileObj,
        })
      }
      return savePromise
        .then(fetchEmployer)
        .then((savedEmployer) => res.json(savedEmployer))
    })
    .catch(next)
})

module.exports = router