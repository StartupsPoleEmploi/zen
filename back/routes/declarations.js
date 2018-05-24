const express = require('express')
const router = express.Router()

const { Declaration, Employer } = require('../models')

const declaredMonth = new Date('2018-05-01T00:00:00.000Z') // TODO handle other months later

router.get('/')
router.post('/', (req, res) => {
  const declarationData = {
    ...req.body,
    userId: req.session.user.id,
    declaredMonth,
  }
  Declaration.upsert(declarationData).then(() => res.json(declarationData))
})

router.post('/finish', (req, res) => {
  Declaration.find({
    where: { declaredMonth, userId: req.session.user.id },
  }).then((declaration) => {
    if (!declaration) return res.status(404).json('Declaration not found')

    Employer.findAll({
      declarationId: declaration.id,
      userId: req.session.user.id,
    }).then((employers) => {
      if (employers.some(({ file }) => !file))
        return res.status(400).json('Declaration not complete')

      declaration.isFinished = true
      declaration.save().then(() => res.json(declaration))
    })
  })
})

module.exports = router
