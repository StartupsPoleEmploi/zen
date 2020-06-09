const express = require('express')
const zip = require('express-easy-zip')

const ConseillersHelpQuery = require('../../models/ConseillersHelpQuery')

const router = express.Router()
router.use(zip())

router.get('/conseiller-helps', (req, res, next) => {
  ConseillersHelpQuery.query()
    .then((helps) => res.json(helps))
    .catch(next)
})

module.exports = router
