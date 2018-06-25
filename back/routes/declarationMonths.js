const express = require('express')

const router = express.Router()

router.get('/', (req, res) => {
  if (!('active' in req.query)) return res.status(400).json('Route not ready')
  res.json((req.activeMonth && req.activeMonth.month) || null)
})

module.exports = router
