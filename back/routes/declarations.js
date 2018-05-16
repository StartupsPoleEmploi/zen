const express = require('express')
const router = express.Router()

const { Declaration } = require('../models')

router.get('/')
router.post('/', (req, res) => {
  const declarationData = {
    ...req.body,
    userId: req.session.user.id,
    declaredMonth: new Date('2018-05-01T00:00:00.000Z'), // TODO handle other months later
  }
  Declaration.upsert(declarationData).then(() => res.json(declarationData))
})

module.exports = router
