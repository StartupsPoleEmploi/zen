const express = require('express')

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

module.exports = router
