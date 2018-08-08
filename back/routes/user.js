const express = require('express')

const User = require('../models/User')

const router = express.Router()

router.get('/', (req, res) => res.json(req.session.user))
router.delete('/', (req, res) => {
  req.session.user = null
  res.json('logged out')
})
router.patch('/', (req, res, next) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json('Unauthorized')
  }

  return User.query()
    .findOne({ id: req.session.user.id })
    .then((user) => {
      if (!user) throw new Error('No such user')

      // We do not allow overriding previously obtained info.
      return user.$query().patch({
        email: user.email || req.body.email,
        peCode: user.peCode || req.body.peCode,
        pePostalCode: user.pePostalCode || req.body.pePostalCode,
      })
    })
    .then(() => res.end())
    .catch(next)
})
module.exports = router
