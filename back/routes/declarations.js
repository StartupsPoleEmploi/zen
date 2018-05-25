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
  if (!req.query.declarationId)
    return res.status(400).json('Missing declarationId')
  Declaration.find({
    where: {
      id: req.query.declarationId,
      userId: req.session.user.id,
    },
  }).then((declaration) => {
    if (!declaration) return res.status(400).json('No such declaration')
    if (!declaration.sickLeaveDocument)
      return res.status(404).json('No such file')
    res.sendfile(declaration.sickLeaveDocument, { root: uploadDestination })
  })
})

router.post('/files', upload.single('sickLeaveDocument'), (req, res) => {
  if (!req.file) return res.status(400).json('Missing file')
  if (!req.body.declarationId)
    return res.status(400).json('Missing declarationId')

  Declaration.find({
    where: { id: req.body.declarationId, userId: req.session.user.id },
  })
    .then((declaration) => {
      if (!declaration) return res.status(400).json('No such declaration')

      declaration.sickLeaveDocument = req.file.filename
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
