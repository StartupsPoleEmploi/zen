const express = require('express')
const router = express.Router()

const { upload, uploadDestination } = require('../lib/upload')
const { Declaration, Employer } = require('../models')
const declaredMonth = new Date('2018-05-01T00:00:00.000Z') // TODO handle other months later

router.get('/', (req, res) => {
  if (!('last' in req.query)) return res.status(400).json('Route not ready')

  Declaration.find({
    where: { declaredMonth, userId: req.session.user.id },
  }).then((declaration) => {
    if (!declaration) return res.status(400).json('No such declaration')
    res.json(declaration)
  })
})

router.post('/', (req, res) => {
  const declarationData = {
    ...req.body,
    userId: req.session.user.id,
    declaredMonth,
  }
  Declaration.upsert(declarationData).then(() => res.json(declarationData))
})

router.get('/files', (req, res, next) => {
  if (!req.query.declarationId || !req.query.name)
    return res.status(400).json('Missing parameters')
  Declaration.find({
    where: {
      id: req.query.declarationId,
      userId: req.session.user.id,
    },
  }).then((declaration) => {
    if (!declaration) return res.status(400).json('No such declaration')
    if (!declaration[req.query.name])
      return res.status(404).json('No such file')
    res.sendfile(declaration[req.query.name], { root: uploadDestination })
  })
})

router.post('/files', upload.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.declarationId)
    return res.status(400).json('Missing declarationId')
  if (!req.body.name) return res.status(400)

  Declaration.find({
    where: { id: req.body.declarationId, userId: req.session.user.id },
  })
    .then((declaration) => {
      if (!declaration) return res.status(400).json('No such declaration')

      declaration[req.body.name] = req.file.filename
      return declaration.save().then(() => res.json(declaration))
    })
    .catch(() => res.json(400).json('Error'))
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
