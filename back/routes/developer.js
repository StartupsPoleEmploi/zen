/*
  These routes must ever ONLY be included in dev mode.
*/

const express = require('express')

const router = express.Router()

router.get('/session/user', (req, res) =>
  res.json({ ...req.session.user, csrfToken: req.csrfToken() }),
)

router.post('/session/user', (req, res) => {
  req.session.user = req.body
  res.json('ok')
})

module.exports = router
