const express = require('express')
const { format } = require('date-fns')
const zip = require('express-easy-zip')
const path = require('path')
const { get, isUndefined, kebabCase } = require('lodash')
const { uploadsDirectory: uploadDestination } = require('config')

const winston = require('../lib/log')
const mailjet = require('../lib/mailings/mailjet')
const ActivityLog = require('../models/ActivityLog')
const Declaration = require('../models/Declaration')
const DeclarationMonth = require('../models/DeclarationMonth')
const DeclarationReview = require('../models/DeclarationReview')
const User = require('../models/User')
const Status = require('../models/Status')

/*
  This is temporary behaviour while a test is conducted:
  We have some emails stored in a json file, and we prevent
  them from being authorized in Zen.
 */
let emailsToIgnore = []
try {
  /* eslint-disable-next-line global-require */
  emailsToIgnore = require('../constants/users-to-ignore.json').map((email) =>
    email.toLowerCase(),
  )
} catch (e) {
  winston.warn('No user in list of users to ignore')
}

const router = express.Router()
router.use(zip())

router.get('/declarationsMonths', (req, res, next) => {
  DeclarationMonth.query()
    .where('startDate', '<=', new Date())
    .orderBy('startDate', 'desc')
    .then((declarationMonths) => res.json(declarationMonths))
    .catch(next)
})

router.get('/declarations', (req, res, next) => {
  if (!req.query.monthId) {
    return res.status(501).json('Must add monthId as query param')
  }

  Declaration.query()
    .eager('[user, employers, review, infos]')
    .where({ monthId: req.query.monthId })
    .then((declarations) => res.json(declarations))
    .catch(next)
})

router.get('/users', (req, res, next) => {
  User.query()
    .where({ isAuthorized: req.query.authorized === 'true' })
    .then((users) => res.json(users))
    .catch(next)
})

router.post('/users/authorize', (req, res, next) => {
  const useIds = Array.isArray(req.body.ids)
  const useEmails = Array.isArray(req.body.emails)
  if (!useIds && !useEmails) {
    return res.status(400).json('Bad request')
  }

  let query = User.query()

  if (useEmails) {
    const emails = req.body.emails.filter(
      (email) => !emailsToIgnore.includes(email.toLowerCase()),
    )

    query.where(function() {
      query = this.where('email', 'ilike', emails)
      req.body.emails.slice(1).forEach((email) => {
        query = this.orWhere('email', 'ilike', email)
      })
    })
  } else {
    query = query.whereIn('id', req.body.ids).whereNotNull('email')
  }

  // first get users to avoid sending "welcome" message to already subscribed users
  return query
    .andWhere('isAuthorized', false)
    .then((users) =>
      Promise.all([
        User.query()
          .patch({ isAuthorized: true })
          .whereIn('id', users.map((user) => user.id)),
        users.length > 0 &&
          mailjet.authorizeContactsAndSendConfirmationEmails({
            users,
            activeMonth: get(req.activeMonth, 'month'),
          }),
      ]),
    )
    .then(([updatedRowsNb]) =>
      res.json({
        updatedRowsNb,
      }),
    )
    .catch(next)
})

router.post('/declarations/review', (req, res, next) => {
  if (
    !req.body.declarationId ||
    (!req.body.notes && isUndefined(req.body.isVerified))
  ) {
    return res.status(400).json('Incomplete request')
  }

  Declaration.query()
    .eager('review')
    .findById(req.body.declarationId)
    .then((declaration) => {
      const declarationNoteObj = {}

      if ('isVerified' in req.body) {
        declarationNoteObj.isVerified = req.body.isVerified
      }
      if ('notes' in req.body) {
        declarationNoteObj.notes = req.body.notes
      }

      if (declaration.review) {
        return declaration.review
          .$query()
          .patch(declarationNoteObj)
          .then(() => res.json('ok'))
      }

      return DeclarationReview.query()
        .insert({
          declarationId: req.body.declarationId,
          ...declarationNoteObj,
        })
        .then(() => res.json('ok'))
    })
    .catch(next)
})

// No login form for now, users must be inserted in db manually.
router.get('/activityLog', (req, res) => {
  ActivityLog.query()
    .eager('user')
    .orderBy('createdAt', 'desc')
    .limit(1000)
    .then((logs) => res.json(logs))
})

router.get('/declarations/:declarationId/files', (req, res) => {
  Declaration.query()
    .eager(`[infos, employers.documents, user, declarationMonth]`)
    .findById(req.params.declarationId)
    .then((declaration) => {
      if (!declaration) return res.status(404).json('No such declaration')

      const formattedMonth = format(
        declaration.declarationMonth.month,
        'MM-YYYY',
      )

      const files = declaration.infos
        .map((info) => ({
          label: info.type,
          value: info.file,
        }))
        .concat(
          declaration.employers.map((employer) => ({
            label: `employer-${employer.employerName}`,
            value: get(employer, 'documents[0].file'),
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

router.post('/status', (req, res, next) =>
  Status.query()
    .update({ up: req.body.up })
    .returning('*')
    .then((result) => {
      winston.info(
        `Following action in administration interface, Zen is now *${
          req.body.up ? '' : 'de'
        }activated*`,
      )
      res.json(result[0])
    })
    .catch(next),
)

module.exports = router
