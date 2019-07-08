/*
  These routes must ever ONLY be included in dev mode.
*/

const express = require('express')

const router = express.Router()

router.get('/session/user', (req, res) => {
  if (!req.session.userSecret) {
    // creating userSecret if it does not exist will avoid some errors if this mode is used,
    // as some routes require req.session.userSecret.accessToken, which is not useful
    // if using config bypasses
    req.session.userSecret = {}
  }

  res.json(req.session.user)
})

router.post('/session/user', (req, res) => {
  req.session.user = req.body
  res.json('ok')
})

module.exports = router
