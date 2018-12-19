const express = require('express')
const Raven = require('raven')
const config = require('config')

const User = require('../models/User')
const sendSubscriptionConfirmation = require('../lib/mailings/sendSubscriptionConfirmation')
const isUserTokenValid = require('../lib/isUserTokenValid')

const router = express.Router()

router.get('/', (req, res) =>
  res.json({
    ...req.session.user,

    // Don't send tokenExpirationDate but only boolean in order to avoid problems
    // with client-side out of sync dates
    isTokenValid: isUserTokenValid(req.session.user.tokenExpirationDate),
    csrfToken: req.csrfToken(),
  }),
)

router.patch('/', (req, res, next) => {
  // This is only intended to let user subscribe to tests
  if (
    !req.session.user ||
    !req.session.user.id ||
    req.session.user.isAuthorized ||
    req.session.user.isWaitingForConfirmation
  ) {
    return res.status(401).json('Unauthorized')
  }

  return User.query()
    .findOne({ id: req.session.user.id })
    .then((user) => {
      if (!user) throw new Error('No such user')

      // We do not allow overriding previously obtained info.
      return user.$query().patchAndFetch({
        email: user.email || req.body.email,
        peCode: user.peCode || req.body.peCode,
        postalCode: user.postalCode || req.body.postalCode,
      })
    })
    .then((user) => {
      if (config.get('shouldSendTransactionalEmails')) {
        // Note: We do not wait for Mailjet to answer to send data back to the user
        sendSubscriptionConfirmation(user).catch((e) =>
          Raven.captureException(e),
        )
      }
      req.session.user.isWaitingForConfirmation = true
      res.json(req.session.user)
    })
    .catch(next)
})
module.exports = router
