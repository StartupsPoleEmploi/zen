const express = require('express')
const Raven = require('raven')
const config = require('config')
const winston = require('../lib/log')

const { isUserTokenValid, refreshToken } = require('../lib/token')
const { refreshAccessToken } = require('../lib/refreshAccessTokenMiddleware')

const sendSubscriptionConfirmation = require('../lib/mailings/sendSubscriptionConfirmation')

const User = require('../models/User')

const router = express.Router()

router.get('/', refreshAccessToken, (req, res) => {
  const userTokenValid = isUserTokenValid(req.session.user.tokenExpirationDate)

  const data = {
    ...req.session.user,
    csrfToken: req.csrfToken && req.csrfToken(),
  }

  if (userTokenValid) {
    // Don't send tokenExpirationDate but only boolean in order to avoid problems
    // with client-side out of sync dates
    return res.json({ ...data, isTokenValid: true })
  }

  return refreshToken(req)
    .then(() => res.json({ ...data, isTokenValid: true }))
    .catch((err) => {
      winston.error(err)
      res.json({ ...data, isTokenValid: false })
    })
})

router.patch('/', (req, res, next) => {
  // This is only intended to let an user add his email,
  // not modify it.
  if (!req.session.user || !req.session.user.id || req.session.user.email) {
    return res.status(401).json('Unauthorized')
  }

  return User.query()
    .findOne({ id: req.session.user.id })
    .then((user) => {
      if (!user) throw new Error('No such user')

      // We do not allow overriding previously obtained info.
      return user.$query().patchAndFetch({
        email: req.body.email,
      })
    })
    .then((user) => {
      if (config.get('shouldSendTransactionalEmails')) {
        // Note: We do not wait for Mailjet to answer to send data back to the user
        sendSubscriptionConfirmation(user).catch((e) =>
          Raven.captureException(e),
        )
      }
      req.session.user.email = user.email
      res.json(req.session.user)
    })
    .catch(next)
})

module.exports = router
