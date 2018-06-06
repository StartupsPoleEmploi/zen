const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.json(req.session.user))
router.delete('/', (req, res) => {
  req.session.user = null
  res.json('logged out')
})
module.exports = router
