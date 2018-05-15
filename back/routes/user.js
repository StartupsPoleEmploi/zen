const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => res.json(req.session.user))

module.exports = router
