const express = require('express')
const { addWeeks, subWeeks } = require('date-fns')

const User = require('../models/User')
const DeclarationMonth = require('../models/DeclarationMonth')

if (process.env.NODE_ENV !== 'test') {
  throw new Error('This routes are ONLY meant for automatic testing purposes')
}

const router = express.Router()

const defaultFemaleUser = {
  firstName: 'Harry',
  lastName: 'Pisces',
  email: 'harry@pisces.com',
  gender: 'female',
  postalCode: '59160',
  peId: 'acbdefghi',
}

router.post('/db/reset', (req, res, next) =>
  User.knex()
    .raw(
      `
    TRUNCATE
    "Users",
    activity_logs,
    declaration_infos,
    declaration_months,
    declaration_reviews,
    declarations,
    employer_documents,
    employers,
    session,
    status
    CASCADE
  `,
    )
    .then(() => {
      const user = {
        ...defaultFemaleUser,
        ...(req.body.userOverride || {}),
      }

      return Promise.all([
        User.query().insertAndFetch(user),

        DeclarationMonth.query().insert({
          month: new Date(),
          startDate: subWeeks(new Date(), 1),
          endDate: addWeeks(new Date(), 1),
        }),

        User.knex().raw('INSERT INTO status (up) values (true)'),
      ])
    })
    .then(([user]) => {
      req.isServiceUp = true
      req.session.user = {
        ...user,
        isAuthorized:
          'authorizeUser' in req.query ? req.query.authorizeUser : true,
        canSendDeclaration:
          'allowDeclaration' in req.query ? req.query.allowDeclaration : true,
        hasAlreadySentDeclaration:
          'hasAlreadySentDeclaration' in req.query
            ? req.query.hasAlreadySentDeclaration
            : false,
        tokenExpirationDate: '2059-05-06T13:34:15.985Z',
      }
      req.session.userSecret = {
        accessToken: 'abcde',
        idToken: 'fghij',
      }

      res.json('ok')
    })
    .catch(next),
)

module.exports = router
